import axios from 'axios';

const SHIPROCKET_BASE = 'https://apiv2.shiprocket.in/v1/external';

let cachedToken = null;
let tokenExpiry = 0;
const DEFAULT_TIMEOUT_MS = Number(process.env.SHIPROCKET_TIMEOUT_MS || 10000);
const DEFAULT_RETRY_COUNT = Number(process.env.SHIPROCKET_RETRY_COUNT || 2);
let hasWarnedMockMode = false;

const summarizeErrorPayload = (payload) => {
  if (!payload) {
    return '';
  }

  if (typeof payload === 'string') {
    return payload.slice(0, 500);
  }

  try {
    return JSON.stringify(payload).slice(0, 500);
  } catch {
    return '[unserializable payload]';
  }
};

/**
 * Shiprocket API Service
 * Feature-flagged via SHIPROCKET_ENABLED env var.
 * When disabled, all methods return mock data.
 */
class ShiprocketService {
  get isEnabled() {
    return process.env.SHIPROCKET_ENABLED === 'true';
  }

  extractDocumentUrl(payload, preferredKeys = []) {
    if (!payload || typeof payload !== 'object') {
      return '';
    }

    const keys = [
      ...preferredKeys,
      'label_url',
      'invoice_url',
      'manifest_url',
      'pdf_url',
      'url',
    ];

    const containers = [
      payload,
      payload.data,
      payload.response,
      payload.response?.data,
      payload.response?.label,
      payload.response?.invoice,
      payload.response?.manifest,
      payload.result,
    ].filter(Boolean);

    for (const container of containers) {
      for (const key of keys) {
        const value = container?.[key];
        if (typeof value === 'string' && value.trim()) {
          return value.trim();
        }
      }
    }

    return '';
  }

  async getToken() {
    if (cachedToken && Date.now() < tokenExpiry) {
      return cachedToken;
    }

    if (!this.isEnabled) return 'mock-token';

    const email = (process.env.SHIPROCKET_EMAIL || '').trim();
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
      const configError = new Error('Shiprocket credentials are missing. Check SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD.');
      configError.statusCode = 500;
      configError.code = 'SHIPROCKET_CONFIG_ERROR';
      throw configError;
    }

    try {
      const response = await axios.post(`${SHIPROCKET_BASE}/auth/login`, {
        email,
        password,
      }, {
        timeout: DEFAULT_TIMEOUT_MS,
      });

      if (!response.data?.token) {
        const tokenError = new Error('Shiprocket login succeeded but token is missing in response');
        tokenError.statusCode = 502;
        tokenError.code = 'SHIPROCKET_TOKEN_MISSING';
        throw tokenError;
      }

      cachedToken = response.data.token;
      tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000; // 9 days
      return cachedToken;
    } catch (err) {
      const status = err.response?.status || err.statusCode;
      const payloadSummary = summarizeErrorPayload(err.response?.data);
      console.error(`[Shiprocket] Login failed (status: ${status || 'n/a'})`, payloadSummary || err.message);

      if ((status === 401 || status === 403) && !err.code) {
        const authError = new Error('Shiprocket authentication failed. Check SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD.');
        authError.statusCode = status;
        authError.code = 'SHIPROCKET_AUTH_FAILED';
        throw authError;
      }

      throw err;
    }
  }

  async request(method, endpoint, data = null) {
    if (!this.isEnabled) {
      if (!hasWarnedMockMode) {
        console.warn('[Shiprocket] SHIPROCKET_ENABLED is not "true". Returning mock responses for shipping endpoints.');
        hasWarnedMockMode = true;
      }
      return this._mockResponse(endpoint, data);
    }

    const methodName = method.toUpperCase();
    const totalAttempts = DEFAULT_RETRY_COUNT + 1;

    for (let attempt = 0; attempt <= DEFAULT_RETRY_COUNT; attempt += 1) {
      try {
        const token = await this.getToken();
        const config = {
          method,
          url: `${SHIPROCKET_BASE}${endpoint}`,
          timeout: DEFAULT_TIMEOUT_MS,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        };
        if (data) config.data = data;

        const response = await axios(config);
        return response.data;
      } catch (err) {
        const status = err.response?.status || err.statusCode;
        const errorMsg = err.response?.data?.message || err.response?.data?.errors || err.message;
        const isTimeout = err.code === 'ECONNABORTED';
        const isAuthFailure = status === 401 || status === 403;
        const isRetriable = isTimeout || !status || status >= 500 || status === 429;
        const hasNextAttempt = attempt < DEFAULT_RETRY_COUNT;
        const payloadSummary = summarizeErrorPayload(err.response?.data);

        if (isAuthFailure && hasNextAttempt) {
          console.warn(`[Shiprocket] ${methodName} ${endpoint} auth failed on attempt ${attempt + 1}/${totalAttempts}. Refreshing token and retrying.`);
          cachedToken = null;
          tokenExpiry = 0;
          continue;
        }

        if (isRetriable && hasNextAttempt) {
          console.warn(`[Shiprocket] ${methodName} ${endpoint} failed on attempt ${attempt + 1}/${totalAttempts}. Retrying.`, {
            status: status || 'n/a',
            reason: typeof errorMsg === 'string' ? errorMsg : summarizeErrorPayload(errorMsg),
          });
          continue;
        }

        const normalizedMessage = typeof errorMsg === 'string' ? errorMsg : summarizeErrorPayload(errorMsg) || 'Shiprocket request failed';
        console.error(`[Shiprocket] ${methodName} ${endpoint} failed after ${attempt + 1}/${totalAttempts} attempt(s).`, {
          status: status || 'n/a',
          message: normalizedMessage,
          payload: payloadSummary || undefined,
        });

        const wrappedError = new Error(normalizedMessage);
        wrappedError.statusCode = status || (isTimeout ? 504 : 502);
        wrappedError.code = isAuthFailure ? 'SHIPROCKET_AUTH_FAILED' : 'SHIPROCKET_REQUEST_FAILED';
        wrappedError.endpoint = endpoint;
        wrappedError.method = methodName;
        wrappedError.details = payloadSummary;
        throw wrappedError;
      }
    }

    throw new Error(`Shiprocket request failed after retries: ${methodName} ${endpoint}`);
  }

  /**
   * Create a Shiprocket order from a backend Order document.
   */
  async createOrder(order) {
    const payload = {
      order_id: order._id.toString(),
      order_date: new Date(order.createdAt).toISOString().split('T')[0],
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
      billing_customer_name: order.shippingAddress?.fullName?.split(' ')[0] || 'Customer',
      billing_last_name: order.shippingAddress?.fullName?.split(' ').slice(1).join(' ') || '',
      billing_address: order.shippingAddress?.address || '',
      billing_city: order.shippingAddress?.city || '',
      billing_pincode: order.shippingAddress?.pincode || '',
      billing_state: order.shippingAddress?.state || '',
      billing_country: 'India',
      billing_email: order.shippingAddress?.email || '',
      billing_phone: order.shippingAddress?.phone || '',
      shipping_is_billing: true,
      order_items: (order.orderItems || []).map(item => ({
        name: item.name,
        sku: item.product?.toString() || 'SVAYAM',
        units: item.qty || 1,
        selling_price: item.price,
      })),
      payment_method: order.isPaid ? 'Prepaid' : 'COD',
      sub_total: order.totalAmount || 0,
      length: 20,
      breadth: 15,
      height: 10,
      weight: 0.5,
    };

    return this.request('post', '/orders/create/adhoc', payload);
  }

  /**
   * Generate AWB (Air Waybill) for a shipment.
   */
  async generateAWB(shipmentId, courierId) {
    return this.request('post', '/courier/assign/awb', {
      shipment_id: shipmentId,
      courier_id: courierId,
    });
  }

  /**
   * Get shipping label for a shipment.
   */
  async generateLabel(shipmentId) {
    return this.request('post', '/courier/generate/label', {
      shipment_id: [shipmentId],
    });
  }

  /**
   * Generate shipping invoice for a Shiprocket order.
   */
  async generateInvoice(shiprocketOrderId) {
    const normalizedId = Number(shiprocketOrderId);
    const ids = Number.isFinite(normalizedId) ? [normalizedId] : [shiprocketOrderId];

    try {
      return await this.request('post', '/orders/print/invoice', { ids });
    } catch (error) {
      // Compatibility fallback for payload variants in older API responses.
      if (error?.statusCode && error.statusCode < 500) {
        return this.request('post', '/orders/print/invoice', { order_ids: ids });
      }
      throw error;
    }
  }

  /**
   * Generate manifest for shipments.
   */
  async generateManifest(shipmentIds) {
    return this.request('post', '/manifests/generate', {
      shipment_id: shipmentIds,
    });
  }

  /**
   * Track a shipment by AWB number.
   */
  async trackShipment(awbCode) {
    return this.request('get', `/courier/track/awb/${awbCode}`);
  }

  /**
   * Get available couriers for a shipment.
   */
  async checkServiceability(pickup_postcode, delivery_postcode, weight, cod = 0) {
    return this.request('get', `/courier/serviceability/?pickup_postcode=${pickup_postcode}&delivery_postcode=${delivery_postcode}&weight=${weight}&cod=${cod}`);
  }

  /**
   * Mock responses for when Shiprocket is disabled.
   */
  _mockResponse(endpoint, data) {
    if (endpoint.includes('/orders/create')) {
      return {
        order_id: data?.order_id || `MOCK-${Date.now()}`,
        shipment_id: Math.floor(Math.random() * 1000000),
        status: 'NEW',
        status_code: 1,
      };
    }
    if (endpoint.includes('/courier/assign/awb')) {
      return {
        response: {
          data: {
            awb_code: `AWB-${Math.floor(Math.random() * 1000000000)}`,
            courier_name: 'Mock Courier',
          },
        },
      };
    }
    if (endpoint.includes('/courier/generate/label')) {
      return {
        label_url: `https://mock.shiprocket.local/label/${data?.shipment_id?.[0] || 'unknown'}.pdf`,
        response: 'Mock label generated',
      };
    }
    if (endpoint.includes('/orders/print/invoice')) {
      const invoiceId = data?.ids?.[0] || data?.order_ids?.[0] || 'unknown';
      return {
        invoice_url: `https://mock.shiprocket.local/invoice/${invoiceId}.pdf`,
        response: 'Mock invoice generated',
      };
    }
    if (endpoint.includes('/manifests/generate')) {
      return { manifest_url: '', response: 'Mock manifest generated' };
    }
    if (endpoint.includes('/courier/track')) {
      return {
        tracking_data: {
          track_status: 1,
          shipment_status: 'Shipped',
          shipment_track: [{ current_status: 'In Transit' }],
        },
      };
    }
    return { mock: true };
  }
}

export default new ShiprocketService();

import axios from 'axios';

const SHIPROCKET_BASE = 'https://apiv2.shiprocket.in/v1/external';

let cachedToken = null;
let tokenExpiry = 0;

/**
 * Shiprocket API Service
 * Feature-flagged via SHIPROCKET_ENABLED env var.
 * When disabled, all methods return mock data.
 */
class ShiprocketService {
  get isEnabled() {
    return process.env.SHIPROCKET_ENABLED === 'true';
  }

  async getToken() {
    if (cachedToken && Date.now() < tokenExpiry) {
      return cachedToken;
    }

    if (!this.isEnabled) return 'mock-token';

    const response = await axios.post(`${SHIPROCKET_BASE}/auth/login`, {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    });

    cachedToken = response.data.token;
    tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000; // 9 days
    return cachedToken;
  }

  async request(method, endpoint, data = null) {
    if (!this.isEnabled) {
      return this._mockResponse(endpoint, data);
    }

    const token = await this.getToken();
    const config = {
      method,
      url: `${SHIPROCKET_BASE}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    if (data) config.data = data;

    const response = await axios(config);
    return response.data;
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
        label_url: '',
        response: 'Mock label generated',
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

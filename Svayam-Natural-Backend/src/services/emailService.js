import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL || '';
const frontendUrl = (process.env.FRONTEND_URL || 'https://svayamnatural.com').replace(/\/$/, '');
const supportEmail = process.env.SUPPORT_EMAIL || 'support@svayamnatural.com';

const EMAIL_CATEGORIES = {
  ORDER_CONFIRMATION: 'order_confirmation',
  SHIPPING_UPDATE: 'shipping_update',
  ABANDONED_CART: 'abandoned_cart',
};

const canSend = () => {
  if (!resend) {
    console.warn('[Email] RESEND_API_KEY is missing. Emails will not be sent.');
    return false;
  }
  if (!fromEmail) {
    console.warn('[Email] RESEND_FROM_EMAIL is missing. Emails will not be sent.');
    return false;
  }
  return true;
};

const formatMoney = (value) => {
  const amount = Number(value || 0);
  return `INR ${amount.toFixed(2)}`;
};

/**
 * Build premium email template with header and footer
 */
const buildEmailShell = ({ title, preheader, body, footer }) => `
  <div style="background:#f5f3ef;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;color:#2a2a2a;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #eee;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
      <div style="background:#0f2e1f;color:#f3efe6;padding:24px 32px;">
        <p style="margin:0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;">Svayam Natural</p>
        <h1 style="margin:12px 0 0;font-size:24px;font-weight:700;">${title}</h1>
        <p style="margin:8px 0 0;font-size:13px;color:#d7c9b1;line-height:1.5;">${preheader}</p>
      </div>
      <div style="padding:32px;">${body}</div>
      <div style="padding:24px 32px;background:#f9f7f2;color:#7a6a57;font-size:12px;border-top:1px solid #eee;">
        <p style="margin:0 0 12px;">${footer || `<strong>Need help?</strong> Reply to this email or reach us at <a href="mailto:${supportEmail}" style="color:#c2a25d;text-decoration:none;">${supportEmail}</a>`}</p>
        <p style="margin:0;font-size:11px;color:#a09080;">© 2024 Svayam Natural. All rights reserved.</p>
      </div>
    </div>
  </div>
`;

/**
 * Log email event for tracking
 */
const logEmailEvent = (category, email, status, details = {}) => {
  console.log(`[Email] [${category}] [${status}] ${email}`, details);
};

/**
 * Send order confirmation email
 * @param {string} email - Customer email
 * @param {Object} order - Order object with items, total, etc.
 */
export const sendOrderConfirmationEmail = async (email, order) => {
  if (!canSend()) {
    logEmailEvent(EMAIL_CATEGORIES.ORDER_CONFIRMATION, email, 'skipped', { reason: 'email_service_disabled' });
    return;
  }

  try {
    const orderId = order?._id?.toString?.() || String(order?._id || '');
    const orderLink = `${frontendUrl}/track-order?id=${encodeURIComponent(orderId)}`;
    
    // Build items list with better formatting
    const itemsHtml = (order.orderItems || [])
      .map(item => `
        <div style="padding:12px 0;border-bottom:1px solid #f0ebe3;">
          <p style="margin:0;font-weight:600;color:#0f2e1f;">${item.name || 'Product'}</p>
          <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:13px;color:#7a6a57;">
            <span>Qty: ${item.qty || item.quantity || 1}</span>
            <span>${formatMoney(item.price * (item.qty || item.quantity || 1))}</span>
          </div>
        </div>
      `)
      .join('') || '<p style="color:#7a6a57;">No items in order</p>';

    const body = `
      <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#555;">Thank you for your order! We're excited to send you these Svayam Natural products. Your order is being prepared now.</p>
      
      <div style="padding:16px;background:#f9f7f2;border-radius:12px;margin-bottom:20px;">
        <p style="margin:0 0 12px;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#7a6a57;font-weight:600;">Order Details</p>
        <p style="margin:0 0 8px;"><strong>Order ID:</strong> <span style="font-family:monospace;color:#c2a25d;">${orderId}</span></p>
        <p style="margin:0;"><strong>Total Amount:</strong> <span style="font-size:16px;font-weight:700;color:#0f2e1f;">${formatMoney(order.totalAmount)}</span></p>
      </div>

      <div style="margin-bottom:20px;">
        <p style="margin:0 0 12px;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#7a6a57;font-weight:600;">Items Ordered</p>
        ${itemsHtml}
      </div>

      <div style="text-align:center;padding:20px 0;">
        <a href="${orderLink}" style="display:inline-block;background:#c2a25d;color:#0f2e1f;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:600;font-size:14px;transition:background 0.2s;">Track your order</a>
      </div>

      <p style="margin:20px 0 0;font-size:12px;color:#7a6a57;line-height:1.6;">
        We'll send you a shipping notification as soon as your package is on its way. 
        You can track it anytime using the link above.
      </p>
    `;

    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Order Confirmed - #${orderId}`,
      html: buildEmailShell({
        title: 'Order confirmed!',
        preheader: `We've received your order #${orderId}. We're preparing it now.`,
        body,
      }),
    });

    logEmailEvent(EMAIL_CATEGORIES.ORDER_CONFIRMATION, email, 'sent', { orderId });
  } catch (error) {
    logEmailEvent(EMAIL_CATEGORIES.ORDER_CONFIRMATION, email, 'error', { 
      message: error.message,
      code: error.code 
    });
    
    // Re-throw to allow caller to handle with retry logic
    throw error;
  }
};

/**
 * Send shipping update email
 * @param {string} email - Customer email
 * @param {Object} order - Order object with tracking info
 */
export const sendShippingUpdateEmail = async (email, order) => {
  if (!canSend()) {
    logEmailEvent(EMAIL_CATEGORIES.SHIPPING_UPDATE, email, 'skipped', { reason: 'email_service_disabled' });
    return;
  }

  try {
    const orderId = order?._id?.toString?.() || String(order?._id || '');
    const trackingNumber = order?.trackingNumber || order?.awbCode || 'Pending';
    const trackingStatus = order?.trackingStatus || order?.lifecycleStatus || 'Processing';
    const orderLink = `${frontendUrl}/track-order?id=${encodeURIComponent(orderId)}`;
    
    const body = `
      <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#555;">Your order is on its way! Here are the tracking details:</p>
      
      <div style="padding:16px;background:#f9f7f2;border-radius:12px;margin-bottom:20px;">
        <p style="margin:0 0 12px;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#7a6a57;font-weight:600;">Tracking Information</p>
        <p style="margin:0 0 8px;"><strong>Order ID:</strong> <span style="font-family:monospace;color:#c2a25d;">${orderId}</span></p>
        <p style="margin:0 0 8px;"><strong>Tracking Number:</strong> <span style="font-family:monospace;color:#c2a25d;">${trackingNumber}</span></p>
        <p style="margin:0;"><strong>Status:</strong> <span style="padding:4px 8px;background:#e8f4f0;color:#0f6b52;border-radius:4px;">${trackingStatus}</span></p>
      </div>

      <div style="text-align:center;padding:20px 0;">
        <a href="${orderLink}" style="display:inline-block;background:#c2a25d;color:#0f2e1f;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:600;font-size:14px;">View tracking details</a>
      </div>

      <p style="margin:20px 0 0;font-size:12px;color:#7a6a57;line-height:1.6;">
        Track your package in real-time. Updates will be sent automatically as your shipment progresses.
      </p>
    `;

    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Shipment Update - Order #${orderId}`,
      html: buildEmailShell({
        title: 'Your order is on the way',
        preheader: `Tracking #${trackingNumber}`,
        body,
      }),
    });

    logEmailEvent(EMAIL_CATEGORIES.SHIPPING_UPDATE, email, 'sent', { orderId, trackingNumber });
  } catch (error) {
    logEmailEvent(EMAIL_CATEGORIES.SHIPPING_UPDATE, email, 'error', { 
      message: error.message,
      code: error.code 
    });
    throw error;
  }
};

/**
 * Send abandoned cart recovery email
 * @param {string} email - Customer email
 * @param {Object} cart - Cart object with items
 * @param {string} name - Customer name (optional)
 * @param {Object} discountDetails - Discount code details (optional)
 */
export const sendAbandonedCartEmail = async (email, cart, name, discountDetails = null) => {
  if (!canSend()) {
    logEmailEvent(EMAIL_CATEGORIES.ABANDONED_CART, email, 'skipped', { reason: 'email_service_disabled' });
    return;
  }

  try {
    const items = Array.isArray(cart?.items) ? cart.items : [];
    const cartLink = `${frontendUrl}/cart`;
    const cartTotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

    if (items.length === 0) {
      logEmailEvent(EMAIL_CATEGORIES.ABANDONED_CART, email, 'skipped', { reason: 'empty_cart' });
      return;
    }

    // Build items table
    const itemsRows = items
      .map((item) => `
        <tr style="border-bottom:1px solid #f0ebe3;">
          <td style="padding:12px 8px;width:60px;">
            ${item.image ? `<img src="${item.image}" alt="${item.name || 'Product'}" width="50" height="50" style="border-radius:8px;object-fit:cover;" />` : '<div style="width:50px;height:50px;background:#f0ebe3;border-radius:8px;"></div>'}
          </td>
          <td style="padding:12px 8px;">
            <p style="margin:0;font-weight:600;color:#0f2e1f;">${item.name || 'Svayam Natural Product'}</p>
            <p style="margin:4px 0 0;color:#7a6a57;font-size:12px;">${item.sku ? `SKU: ${item.sku}` : ''}</p>
          </td>
          <td style="padding:12px 8px;text-align:center;font-size:13px;color:#7a6a57;">x${item.quantity || 1}</td>
          <td style="padding:12px 8px;text-align:right;font-weight:600;white-space:nowrap;">${formatMoney(item.price * (item.quantity || 1))}</td>
        </tr>
      `)
      .join('');

    // Discount offer section
    let discountSection = '';
    if (discountDetails?.code) {
      const discountAmount = Math.round(cartTotal * (discountDetails.percentage / 100));
      const finalTotal = cartTotal - discountAmount;
      
      discountSection = `
        <div style="padding:16px;background:#f0f8f5;border:2px solid #c2a25d;border-radius:12px;margin:20px 0;">
          <p style="margin:0 0 12px;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#0f2e1f;font-weight:600;">🎁 Special Offer Just for You</p>
          <p style="margin:0 0 12px;font-size:13px;color:#555;">Complete your order and enjoy <strong>${discountDetails.percentage}% off</strong> with this exclusive code:</p>
          <p style="margin:0 0 12px;padding:12px;background:#ffffff;border:1px dashed #c2a25d;border-radius:8px;text-align:center;font-family:monospace;font-size:16px;font-weight:700;letter-spacing:2px;color:#0f2e1f;">${discountDetails.code}</p>
          <p style="margin:0;font-size:12px;color:#7a6a57;">You save: <strong>${formatMoney(discountAmount)}</strong> • Final total: <strong>${formatMoney(finalTotal)}</strong><br>Valid until ${discountDetails.applicableUntil ? new Date(discountDetails.applicableUntil).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '7 days'}</p>
        </div>
      `;
    }

    const body = `
      <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#555;">${name ? `Hi ${name},` : 'Hi there,'}</p>
      
      <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#555;">We noticed you have items in your cart! Complete your order to bring these Svayam Natural products home.</p>

      <div style="margin-bottom:20px;">
        <p style="margin:0 0 12px;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#7a6a57;font-weight:600;">Items in Your Cart</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
          ${itemsRows}
        </table>
        <div style="padding:12px 8px;text-align:right;border-top:2px solid #f0ebe3;">
          <p style="margin:0;font-size:13px;"><strong>Subtotal:</strong> ${formatMoney(cartTotal)}</p>
        </div>
      </div>

      ${discountSection}

      <div style="text-align:center;padding:20px 0;">
        <a href="${cartLink}" style="display:inline-block;background:#c2a25d;color:#0f2e1f;text-decoration:none;padding:14px 32px;border-radius:999px;font-weight:600;font-size:14px;">Complete Your Order</a>
      </div>

      <p style="margin:20px 0 0;font-size:12px;color:#7a6a57;line-height:1.6;">
        These items may not be available forever. Secure your Svayam Natural ritual today!
      </p>
    `;

    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Don't miss out! Your cart is waiting ${discountDetails?.code ? '— plus exclusive discount inside' : ''}`,
      html: buildEmailShell({
        title: 'Your cart is waiting',
        preheader: `${items.length} item${items.length > 1 ? 's' : ''} waiting for you${discountDetails?.code ? ' + exclusive discount' : ''}`,
        body,
      }),
    });

    logEmailEvent(EMAIL_CATEGORIES.ABANDONED_CART, email, 'sent', { 
      itemCount: items.length,
      cartTotal,
      discountCode: discountDetails?.code || null
    });
  } catch (error) {
    logEmailEvent(EMAIL_CATEGORIES.ABANDONED_CART, email, 'error', { 
      message: error.message,
      code: error.code 
    });
    throw error;
  }
};

// Export utilities and configurations
export { EMAIL_CATEGORIES, canSend };

export default {
  sendOrderConfirmationEmail,
  sendShippingUpdateEmail,
  sendAbandonedCartEmail,
  EMAIL_CATEGORIES,
};

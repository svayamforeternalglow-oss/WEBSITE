import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL || '';
const frontendUrl = (process.env.FRONTEND_URL || 'https://svayamnatural.com').replace(/\/$/, '');

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

const buildEmailShell = ({ title, preheader, body }) => `
  <div style="background:#f5f3ef;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#2a2a2a;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #eee;">
      <div style="background:#0f2e1f;color:#f3efe6;padding:20px 28px;">
        <p style="margin:0;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;">Svayam Natural</p>
        <h1 style="margin:10px 0 0;font-size:22px;">${title}</h1>
        <p style="margin:6px 0 0;font-size:13px;color:#d7c9b1;">${preheader}</p>
      </div>
      <div style="padding:28px;">${body}</div>
      <div style="padding:20px 28px;background:#f9f7f2;color:#7a6a57;font-size:12px;">
        <p style="margin:0;">Need help? Reply to this email or reach us at ${fromEmail}.</p>
      </div>
    </div>
  </div>
`;

export const sendOrderConfirmationEmail = async (email, order) => {
  if (!canSend()) return;

  const orderId = order?._id?.toString?.() || String(order?._id || '');
  const orderLink = `${frontendUrl}/track-order?id=${encodeURIComponent(orderId)}`;
  const body = `
    <p style="margin:0 0 16px;">Thank you for your order. We are processing it now.</p>
    <div style="padding:16px;border:1px solid #eee;border-radius:12px;margin-bottom:20px;">
      <p style="margin:0 0 6px;"><strong>Order ID:</strong> ${orderId}</p>
      <p style="margin:0;"><strong>Total:</strong> ${formatMoney(order.totalAmount)}</p>
    </div>
    <a href="${orderLink}" style="display:inline-block;background:#c2a25d;color:#0f2e1f;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:bold;">Track your order</a>
  `;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Order Confirmation - ${orderId}`,
      html: buildEmailShell({
        title: 'Order confirmed',
        preheader: 'We are preparing your Svayam Natural order.',
        body,
      }),
    });
    console.log('Order confirmation email sent to', email);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
};

export const sendShippingUpdateEmail = async (email, order) => {
  if (!canSend()) return;

  const orderId = order?._id?.toString?.() || String(order?._id || '');
  const trackingNumber = order?.trackingNumber || order?.awbCode || 'Pending';
  const trackingStatus = order?.trackingStatus || order?.lifecycleStatus || 'Processing';
  const orderLink = `${frontendUrl}/track-order?id=${encodeURIComponent(orderId)}`;
  const body = `
    <p style="margin:0 0 16px;">Your order is on its way.</p>
    <div style="padding:16px;border:1px solid #eee;border-radius:12px;margin-bottom:20px;">
      <p style="margin:0 0 6px;"><strong>Order ID:</strong> ${orderId}</p>
      <p style="margin:0 0 6px;"><strong>Tracking:</strong> ${trackingNumber}</p>
      <p style="margin:0;"><strong>Status:</strong> ${trackingStatus}</p>
    </div>
    <a href="${orderLink}" style="display:inline-block;background:#c2a25d;color:#0f2e1f;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:bold;">Track your order</a>
  `;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Order Shipped - Tracking Update ${orderId}`,
      html: buildEmailShell({
        title: 'Order shipped',
        preheader: 'Your package is on the move.',
        body,
      }),
    });
    console.log('Order shipping update email sent to', email);
  } catch (error) {
    console.error('Error sending shipping update email:', error);
  }
};

export const sendAbandonedCartEmail = async (email, cart, name) => {
  if (!canSend()) return;

  const items = Array.isArray(cart?.items) ? cart.items : [];
  const cartLink = `${frontendUrl}/cart`;
  const rows = items
    .map((item) => `
      <tr>
        <td style="padding:8px 0;">
          <img src="${item.image || ''}" alt="${item.name || 'Product'}" width="56" height="56" style="border-radius:8px;object-fit:cover;" />
        </td>
        <td style="padding:8px 12px;">
          <p style="margin:0;font-weight:600;">${item.name || 'Svayam Natural'}</p>
          <p style="margin:4px 0 0;color:#7a6a57;font-size:12px;">Qty: ${item.quantity || 1}</p>
        </td>
        <td style="padding:8px 0;text-align:right;font-weight:600;">${formatMoney(item.price)}</td>
      </tr>
    `)
    .join('');

  const body = `
    <p style="margin:0 0 16px;">${name ? `Hi ${name},` : 'Hi there,'} you left a few items in your cart.</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      ${rows || '<tr><td style="padding:8px 0;">Your cart is waiting for you.</td></tr>'}
    </table>
    <a href="${cartLink}" style="display:inline-block;background:#c2a25d;color:#0f2e1f;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:bold;">Return to your cart</a>
  `;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Your Svayam Natural cart is waiting',
      html: buildEmailShell({
        title: 'Your cart is waiting',
        preheader: 'Complete your Svayam Natural ritual.',
        body,
      }),
    });
    console.log('Abandoned cart email sent to', email);
  } catch (error) {
    console.error('Error sending abandoned cart email:', error);
  }
};

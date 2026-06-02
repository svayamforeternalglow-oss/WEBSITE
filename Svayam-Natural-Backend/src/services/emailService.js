import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import { isResendConfigured, sendWithResend } from './resendService.js';
dotenv.config();

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const getFromEmail = () => process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL;

const sendTransactionalEmail = async ({ to, subject, html, text }) => {
  const from = getFromEmail();

  if (isResendConfigured()) {
    try {
      await sendWithResend({ to, from, subject, html, text });
      return 'resend';
    } catch (error) {
      console.error('Error sending email with Resend:', error);
    }
  }

  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('No email provider configured');
  }

  await sgMail.send({ to, from, subject, html, text });
  return 'sendgrid';
};

export const sendOrderConfirmationEmail = async (email, order) => {
  const subject = `Order Confirmation - ${order._id}`;
  const html = `
      <h2>Thank you for your order!</h2>
      <p>We are processing your order ${order._id}.</p>
      <p>Total amount: ₹${order.totalAmount}</p>
      <p>We will notify you once it ships.</p>
    `;
  const text = [
    'Thank you for your order!',
    `We are processing your order ${order._id}.`,
    `Total amount: INR ${order.totalAmount}`,
    'We will notify you once it ships.',
  ].join('\n');

  const msg = {
    to: email,
    from: getFromEmail(),
    subject,
    html,
    text,
  };

  try {
    const provider = await sendTransactionalEmail(msg);
    console.log(`Order confirmation email sent to ${email} via ${provider}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendShippingUpdateEmail = async (email, order) => {
  const subject = `Order Shipped - Tracking Update ${order._id}`;
  const html = `
      <h2>Your order has been shipped!</h2>
      <p>Tracking Number: ${order.trackingNumber}</p>
      <p>Status: ${order.trackingStatus}</p>
      <p>You can track your order in your user dashboard.</p>
    `;
  const text = [
    'Your order has been shipped!',
    `Tracking Number: ${order.trackingNumber}`,
    `Status: ${order.trackingStatus}`,
    'You can track your order in your user dashboard.',
  ].join('\n');

  const msg = {
    to: email,
    from: getFromEmail(),
    subject,
    html,
    text,
  };

  try {
    const provider = await sendTransactionalEmail(msg);
    console.log(`Order shipping update email sent to ${email} via ${provider}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendAbandonedCartEmail = async ({ email, name, recoveryUrl, items = [], subtotal = 0, currency = 'INR', reminderNumber = 1 }) => {
  const safeName = name || 'there';
  const itemList = items
    .slice(0, 6)
    .map((item) => `<li>${item.name || 'Product'} x ${item.quantity || 1}</li>`)
    .join('');
  const moreCount = items.length > 6 ? items.length - 6 : 0;
  const moreLine = moreCount > 0 ? `<p>+ ${moreCount} more item(s)</p>` : '';

  const msg = {
    to: email,
    from: getFromEmail(),
    subject: reminderNumber > 1 ? 'Reminder: your Svayam cart is waiting' : 'Complete your Svayam cart',
    html: `
      <h2>Hi ${safeName},</h2>
      <p>Your cart is still saved with us. Complete your order before items sell out.</p>
      <ul>${itemList}</ul>
      ${moreLine}
      <p><strong>Total:</strong> ${currency} ${subtotal}</p>
      <p><a href="${recoveryUrl}">Return to your cart</a></p>
      <p>If you have questions, reply to this email and we will help.</p>
    `,
    text: [
      `Hi ${safeName},`,
      'Your cart is still saved with us. Complete your order before items sell out.',
      `Total: ${currency} ${subtotal}`,
      `Return to your cart: ${recoveryUrl}`,
      'If you have questions, reply to this email and we will help.',
    ].join('\n'),
  };

  try {
    const provider = await sendTransactionalEmail(msg);
    console.log(`Abandoned cart email sent to ${email} via ${provider}`);
  } catch (error) {
    console.error('Error sending abandoned cart email:', error);
  }
};

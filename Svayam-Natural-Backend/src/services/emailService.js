import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOrderConfirmationEmail = async (email, order) => {
  const msg = {
    to: email,
    from: process.env.FROM_EMAIL,
    subject: `Order Confirmation - ${order._id}`,
    html: `
      <h2>Thank you for your order!</h2>
      <p>We are processing your order ${order._id}.</p>
      <p>Total amount: INR ${order.totalAmount}</p>
      <p>We will notify you once it ships.</p>
    `,
  };

  try {
    await transporter.sendMail(msg);
    console.log('Order confirmation email sent to', email);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendShippingUpdateEmail = async (email, order) => {
  const msg = {
    to: email,
    from: process.env.FROM_EMAIL,
    subject: `Order Shipped - Tracking Update ${order._id}`,
    html: `
      <h2>Your order has been shipped!</h2>
      <p>Tracking Number: ${order.trackingNumber}</p>
      <p>Status: ${order.trackingStatus}</p>
      <p>You can track your order in your user dashboard.</p>
    `,
  };

  try {
    await transporter.sendMail(msg);
    console.log('Order shipping update email sent to', email);
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
    from: process.env.FROM_EMAIL,
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
  };

  try {
    await transporter.sendMail(msg);
    console.log('Abandoned cart email sent to', email);
  } catch (error) {
    console.error('Error sending abandoned cart email:', error);
  }
};

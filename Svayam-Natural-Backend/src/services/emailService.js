import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendOrderConfirmationEmail = async (email, order) => {
  const msg = {
    to: email,
    from: process.env.FROM_EMAIL,
    subject: `Order Confirmation - ${order._id}`,
    html: `
      <h2>Thank you for your order!</h2>
      <p>We are processing your order ${order._id}.</p>
      <p>Total amount: ₹${order.totalAmount}</p>
      <p>We will notify you once it ships.</p>
    `,
  };

  try {
    await sgMail.send(msg);
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
    await sgMail.send(msg);
    console.log('Order shipping update email sent to', email);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

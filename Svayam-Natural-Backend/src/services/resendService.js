import dotenv from 'dotenv';

dotenv.config();

const RESEND_API_URL = 'https://api.resend.com/emails';

export const isResendConfigured = () => Boolean(process.env.RESEND_API_KEY);

export const sendWithResend = async ({ to, from, subject, html, text }) => {
  if (!isResendConfigured()) {
    throw new Error('Resend is not configured');
  }

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Resend request failed (${response.status}): ${errorBody || response.statusText}`);
  }

  return response.json().catch(() => ({}));
};
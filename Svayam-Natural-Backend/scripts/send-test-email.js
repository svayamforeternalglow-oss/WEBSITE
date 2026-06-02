#!/usr/bin/env node
import dotenv from 'dotenv';
import { sendOrderConfirmationEmail } from '../src/services/emailService.js';

dotenv.config();

const target = process.env.TEST_TARGET_EMAIL;
if (!target) {
  console.error('Please set TEST_TARGET_EMAIL in environment to receive the test email.');
  process.exit(1);
}

const order = {
  _id: `TEST-${Date.now()}`,
  totalAmount: 123.45,
};

(async () => {
  try {
    await sendOrderConfirmationEmail(target, order);
    console.log('Done');
  } catch (err) {
    console.error('Test send failed', err);
    process.exit(1);
  }
})();

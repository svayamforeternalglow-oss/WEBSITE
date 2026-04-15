import mongoose from 'mongoose';
import shiprocket from './src/services/shiprocketService.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    process.env.SHIPROCKET_ENABLED = 'true';
    process.env.SHIPROCKET_EMAIL = 'hugeeelephant@gmail.com';
    process.env.SHIPROCKET_PASSWORD = 'w^e&QFw6zyVLDZit!5z2aKixZPH6@hNR';

    console.log('Testing createOrder...');
    const order = {
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date(),
      shippingAddress: {
        fullName: 'Test User',
        address: '123 Test St',
        city: 'Mumbai',
        pincode: '400001',
        state: 'Maharashtra',
        email: 'test@example.com',
        phone: '9876543210'
      },
      orderItems: [
        { name: 'Kesh Samraksha', qty: 1, price: 500, product: new mongoose.Types.ObjectId() }
      ],
      isPaid: true,
      totalAmount: 500
    };

    const res = await shiprocket.createOrder(order);
    console.log('Order created:', typeof res === 'object' ? JSON.stringify(res, null, 2) : res);
  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) {
      console.error('Response data:', JSON.stringify(err.response.data, null, 2));
    }
  }
}
test();

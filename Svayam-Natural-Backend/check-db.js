import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './src/models/Order.js';

dotenv.config();

const checkOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(10);
    console.log(`Found ${orders.length} orders`);

    orders.forEach((o, i) => {
      console.log(`\n--- Order ${i+1} ---`);
      console.log(`ID: ${o._id}`);
      console.log(`User: ${o.user}`);
      console.log(`Email: ${o.shippingAddress.email}`);
      console.log(`Items Count: ${o.orderItems.length}`);
      o.orderItems.forEach(item => {
          console.log(`  - Item: ${item.name}, Qty: ${item.qty}, Price: ${item.price}`);
      });
      console.log(`Total: ${o.totalAmount}`);
    });

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkOrders();

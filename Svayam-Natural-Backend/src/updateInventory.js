import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const updateInventory = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    const products = await Product.find({});
    
    if (products.length === 0) {
      console.log('No products found in the database. You might need to run the seed script first.');
      process.exit();
    }

    const result = await Product.updateMany({}, { $set: { inventory: 100 } });
    console.log(`Successfully updated ${result.modifiedCount} products to stock 100.`);

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

updateInventory();

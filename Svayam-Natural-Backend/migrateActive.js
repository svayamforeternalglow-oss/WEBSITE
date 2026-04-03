import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const productSchema = new mongoose.Schema({
  title: String,
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false }
}, { strict: false });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await Product.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true, isFeatured: false } }
    );

    console.log(`Migration complete. Modified ${result.modifiedCount} products.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();

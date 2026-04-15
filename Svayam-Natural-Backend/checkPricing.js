import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const productSchema = new mongoose.Schema({
  title: String,
  slug: String,
  price: Number,
  originalPrice: Number
}, { timestamps: true, strict: false });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const products = await Product.find({}, 'title slug price originalPrice');
    console.log(JSON.stringify(products, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const productSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const PRODUCT_IMAGE_UPDATES = [
  { slug: 'gulkand', images: ['/images/gulkand/1.png', '/images/gulkand/2.jpeg'] },
  { slug: 'tarunya-rose-toner', images: ['/images/tarunya-Rose-toner.png'] },
  { slug: 'kumkumadi-lip-balm', images: ['/images/kumkumadi-lip-balm.png'] },
  { slug: 'abhyanga-natural-soap', images: ['/images/Abhyanga Natural Soap.jpeg'] },
  { slug: 'snehchandan-natural-soap', images: ['/images/Snehchandan Natural Soap.jpeg'] },
  { slug: 'mango-body-butter', images: ['/images/Mango Body Butter.jpeg'] },
  { slug: 'kayashuddhi-abhyanga-body-oil', images: ['/images/Kayashuddhi Abhyanga Body Oil.jpeg'] },
  { slug: 'keshvardhini-hair-oil', images: ['/images/Keshvardhini Hair Oil.jpeg'] },
  { slug: 'bhruhshakti-roll-on', images: ['/images/Bhruhshakti Roll On.jpeg'] },
  { slug: 'swarnahairdra-turmeric', images: ['/images/Swarnahairdra Turmeric Powder (400gms).jpeg'] },
];

async function run() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set in .env');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    for (const update of PRODUCT_IMAGE_UPDATES) {
      const result = await Product.updateOne(
        { slug: update.slug },
        { $set: { images: update.images } }
      );

      if (result.matchedCount === 0) {
        console.log(`Not found: ${update.slug}`);
      } else if (result.modifiedCount === 0) {
        console.log(`No change: ${update.slug}`);
      } else {
        console.log(`Updated images: ${update.slug}`);
      }
    }
  } catch (error) {
    console.error('Failed to sync product images:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();

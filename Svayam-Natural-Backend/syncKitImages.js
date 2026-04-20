import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const productSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const KIT_IMAGE_UPDATES = [
  { slug: 'complete-radiance-kit', images: ['/images/Complete-Radiance-Kit.jpeg'] },
  { slug: 'hair-care-kit', images: ['/images/hibiscus-gel-marketing.png'] },
  { slug: 'tejasamrit-golden-latte-family-pack', images: ['/images/Eat-To-Glow-Kit.jpeg'] },
  { slug: 'royal-bathing-kit', images: ['/images/Royal-Bathing-Kit.jpeg'] },
  { slug: 'autea', images: ['/images/autea/AUTEA_HERO.png', '/images/autea/1.jpeg', '/images/autea/2.jpeg'] },
];

async function run() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set in .env');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    for (const update of KIT_IMAGE_UPDATES) {
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
    console.error('Failed to sync kit images:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();

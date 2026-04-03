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

const updates = [
  { "titleMatch": "Complete Radiance Kit", "originalPrice": 8000, "price": 5500 },
  { "titleMatch": "Hair Care Kit", "originalPrice": 1567, "price": 1499 },
  { "titleMatch": "Tejasamrit", "originalPrice": 897, "price": 870 },
  { "titleMatch": "Royal Bathing Kit", "originalPrice": 2500, "price": 1700 },
  { "titleMatch": "Swarnaharidra", "originalPrice": 450, "price": 310 },
  { "titleMatch": "Gulkand", "originalPrice": 600, "price": 450 },
  { "titleMatch": "Triphala", "originalPrice": 350, "price": 250 },
  { "titleMatch": "Ayutea", "originalPrice": 540, "price": 540 },
  { "titleMatch": "Abhyanga Natural Soap", "originalPrice": 300, "price": 170 },
  { "titleMatch": "Tarunya", "originalPrice": 670, "price": 510 },
  { "titleMatch": "Udwartana", "originalPrice": 510, "price": 370 },
  { "titleMatch": "Soumya", "originalPrice": 650, "price": 595 },
  { "titleMatch": "Chandraprabha", "originalPrice": 1400, "price": 999 },
  { "titleMatch": "Suryakanti", "originalPrice": 1400, "price": 999 },
  { "titleMatch": "Lavanyam", "originalPrice": 699, "price": 499 },
  { "titleMatch": "Kumkumadi", "originalPrice": 410, "price": 370 },
  { "titleMatch": "Keshvardhini", "originalPrice": 610, "price": 510 },
  { "titleMatch": "Hibiscus", "originalPrice": 359, "price": 259 },
  { "titleMatch": "Bhruhshakti", "originalPrice": 360, "price": 260 },
  { "titleMatch": "Kesh Shuddhi", "originalPrice": 410, "price": 399 },
  { "titleMatch": "Kesh Samraksha", "originalPrice": 450, "price": 399 },
  { "titleMatch": "Rose Lip Balm", "originalPrice": 410, "price": 370 },
  { "titleMatch": "Kayashuddhi", "originalPrice": 410, "price": 390 },
  { "titleMatch": "Snehchandan", "originalPrice": 310, "price": 199 }
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const products = await Product.find({});
    
    for (const update of updates) {
      let match = products.find(p => p.title && p.title.toLowerCase().includes(update.titleMatch.toLowerCase()));
      if (!match) {
        match = products.find(p => p.slug && p.slug.toLowerCase().includes(update.titleMatch.toLowerCase().replace(/ /g, '-')));
      }

      if (match) {
        match.price = update.price;
        match.originalPrice = update.originalPrice;
        await match.save();
        console.log(`✅ Updated: ${match.title} (Price: ${update.price}, Original: ${update.originalPrice})`);
      } else {
        console.log(`❌ Not found: ${update.titleMatch}`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();

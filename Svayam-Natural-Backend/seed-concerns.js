import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const concernSchema = new mongoose.Schema({
  name: String,
  slug: String,
  image: String,
  isActive: { type: Boolean, default: true }
});

const Concern = mongoose.model('Concern', concernSchema);

const concerns = [
  { name: "Pigmentation", slug: "pigmentation", image: "/images/pigmnetation.png" },
  { name: "Anti Aging", slug: "anti-aging", image: "/images/aging.png" },
  { name: "Hair Fall", slug: "hair-fall", image: "/images/hairfall.png" },
  { name: "Hair Growth", slug: "hair-growth", image: "/images/concerns/hair-growth.png" },
  { name: "Night Care", slug: "night-care", image: "/images/chandraprabha-night-necter.png" },
  { name: "Oil & Acne Control", slug: "oil-acne-control", image: "/images/concerns/acne-blemishes.png" },
  { name: "Dry Skin", slug: "dry-skin", image: "/images/concerns/skin-hydration.png" },
  { name: "Glow & Radiance", slug: "glow-radiance", image: "/images/tejasamrit.png" },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    for (let c of concerns) {
      await Concern.updateOne(
        { slug: c.slug },
        { $set: c },
        { upsert: true }
      );
    }
    console.log('Seeded concerns');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
seed();

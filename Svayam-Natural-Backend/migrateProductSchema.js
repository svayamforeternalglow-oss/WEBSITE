import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const productSchema = new mongoose.Schema({
  title: String,
  story: { type: String, default: undefined },
  howToUse: { type: String, default: undefined },
  ingredients: { type: Array, default: undefined },
  sku: { type: String, default: undefined },
  weight: { type: String, default: undefined },
}, { strict: false });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get total count
    const totalCount = await Product.countDocuments();
    console.log(`\nTotal products in database: ${totalCount}`);

    // Count products missing each field
    const missingStory = await Product.countDocuments({ story: { $exists: false } });
    const missingHowToUse = await Product.countDocuments({ howToUse: { $exists: false } });
    const missingIngredients = await Product.countDocuments({ ingredients: { $exists: false } });
    const missingSku = await Product.countDocuments({ sku: { $exists: false } });
    const missingWeight = await Product.countDocuments({ weight: { $exists: false } });

    console.log('\n--- Missing Fields Before Migration ---');
    console.log(`  story: ${missingStory} products (${((missingStory / totalCount) * 100).toFixed(1)}%)`);
    console.log(`  howToUse: ${missingHowToUse} products (${((missingHowToUse / totalCount) * 100).toFixed(1)}%)`);
    console.log(`  ingredients: ${missingIngredients} products (${((missingIngredients / totalCount) * 100).toFixed(1)}%)`);
    console.log(`  sku: ${missingSku} products (${((missingSku / totalCount) * 100).toFixed(1)}%)`);
    console.log(`  weight: ${missingWeight} products (${((missingWeight / totalCount) * 100).toFixed(1)}%)`);

    // Initialize missing fields with defaults (no overwrites)
    console.log('\n--- Initializing Missing Fields ---');
    
    const storyResult = await Product.updateMany(
      { story: { $exists: false } },
      { $set: { story: '' } }
    );
    console.log(`  story: initialized ${storyResult.modifiedCount} products`);

    const howToUseResult = await Product.updateMany(
      { howToUse: { $exists: false } },
      { $set: { howToUse: '' } }
    );
    console.log(`  howToUse: initialized ${howToUseResult.modifiedCount} products`);

    const ingredientsResult = await Product.updateMany(
      { ingredients: { $exists: false } },
      { $set: { ingredients: [] } }
    );
    console.log(`  ingredients: initialized ${ingredientsResult.modifiedCount} products`);

    const skuResult = await Product.updateMany(
      { sku: { $exists: false } },
      { $set: { sku: '' } }
    );
    console.log(`  sku: initialized ${skuResult.modifiedCount} products`);

    const weightResult = await Product.updateMany(
      { weight: { $exists: false } },
      { $set: { weight: '' } }
    );
    console.log(`  weight: initialized ${weightResult.modifiedCount} products`);

    // Verify results
    const afterStory = await Product.countDocuments({ story: { $exists: false } });
    const afterHowToUse = await Product.countDocuments({ howToUse: { $exists: false } });
    const afterIngredients = await Product.countDocuments({ ingredients: { $exists: false } });
    const afterSku = await Product.countDocuments({ sku: { $exists: false } });
    const afterWeight = await Product.countDocuments({ weight: { $exists: false } });

    console.log('\n--- Missing Fields After Migration ---');
    console.log(`  story: ${afterStory} products (${((afterStory / totalCount) * 100).toFixed(1)}%)`);
    console.log(`  howToUse: ${afterHowToUse} products (${((afterHowToUse / totalCount) * 100).toFixed(1)}%)`);
    console.log(`  ingredients: ${afterIngredients} products (${((afterIngredients / totalCount) * 100).toFixed(1)}%)`);
    console.log(`  sku: ${afterSku} products (${((afterSku / totalCount) * 100).toFixed(1)}%)`);
    console.log(`  weight: ${afterWeight} products (${((afterWeight / totalCount) * 100).toFixed(1)}%)`);

    const totalInitialized = 
      storyResult.modifiedCount + 
      howToUseResult.modifiedCount + 
      ingredientsResult.modifiedCount + 
      skuResult.modifiedCount + 
      weightResult.modifiedCount;

    console.log(`\n✓ Migration complete. Total field initializations: ${totalInitialized}`);
    console.log('✓ No existing data was overwritten.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

run();

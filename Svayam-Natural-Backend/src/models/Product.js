import mongoose from 'mongoose';
import crypto from 'crypto';

const generateSku = () => {
  const suffix = crypto
    .randomBytes(3)
    .toString('hex')
    .slice(0, 6)
    .toUpperCase();

  return `SV-${suffix}`;
};

const normalizeArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a product title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
    trim: true,
    uppercase: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  story: {
    type: String,
    default: '',
    maxlength: [4000, 'Story cannot be more than 4000 characters']
  },
  howToUse: {
    type: String,
    default: '',
    maxlength: [4000, 'How to use cannot be more than 4000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be positive']
  },
  originalPrice: {
    type: Number,
    required: [true, 'Please add an original price'],
    min: [0, 'Original price must be positive']
  },
  weight: {
    type: String,
    default: '',
    trim: true,
    maxlength: [120, 'Weight cannot be more than 120 characters']
  },
  ingredients: {
    type: [String],
    default: []
  },
  inventory: {
    type: Number,
    required: [true, 'Please specify inventory count'],
    min: [0, 'Inventory cannot be negative'],
    default: 0
  },
  images: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: [true, 'Please define a category (e.g., Face Care, Hair Care)']
  },
  concern: {
    type: String,
    required: [true, 'Please define a concern (e.g., Acne, Aging)']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

productSchema.pre('validate', function(next) {
  if (!this.sku) {
    this.sku = generateSku();
  }

  if (this.ingredients) {
    this.ingredients = normalizeArray(this.ingredients);
  }

  next();
});

// Text index for search
productSchema.index({ title: 'text', description: 'text', story: 'text', howToUse: 'text', ingredients: 'text' });
// Compound indexes for common queries
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ concern: 1, isActive: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 }, { unique: true, sparse: true });
productSchema.index({ isFeatured: 1, isActive: 1, inventory: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;

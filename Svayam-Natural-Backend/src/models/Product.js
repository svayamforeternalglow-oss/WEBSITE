import mongoose from 'mongoose';

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
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
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

// Text index for search
productSchema.index({ title: 'text', description: 'text' });
// Compound indexes for common queries
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ concern: 1, isActive: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ isFeatured: 1, isActive: 1, inventory: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;

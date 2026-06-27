import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  slug: { type: String, trim: true },
  name: { type: String, trim: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  image: { type: String, trim: true },
  weight: { type: String, trim: true },
  sku: { type: String, trim: true },
  quantity: { type: Number, min: 1, required: true },
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  items: [cartItemSchema],
  subtotal: {
    type: Number,
    default: 0,
  },
  
  // Abandonment tracking
  lastUpdatedAt: {
    type: Date,
    default: Date.now,
  },
  abandonedAt: {
    type: Date,
  },
  isAbandoned: {
    type: Boolean,
    default: false,
    index: true, // For quick queries
  },
  
  // Email tracking
  emailSentAt: {
    type: Date,
  },
  emailRetryCount: {
    type: Number,
    default: 0,
  },
  lastEmailRetryAt: {
    type: Date,
  },
  emailStatus: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'bounced'],
    default: 'pending',
  },
  
  // Discount tracking
  discountCode: {
    type: String,
    trim: true,
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
  },
  discountApplied: {
    type: Boolean,
    default: false,
  },
  
  // Conversion tracking
  convertedAt: {
    type: Date,
  },
  conversionOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  recoveryEmailUsed: {
    type: Boolean,
    default: false,
  },
  
  // Session/device tracking
  sessionId: String,
  userAgent: String,
  ipAddress: String,
}, {
  timestamps: true,
});

// Index for finding abandoned carts
cartSchema.index({ isAbandoned: 1, abandonedAt: 1 });
cartSchema.index({ email: 1, isAbandoned: 1 });
cartSchema.index({ user: 1, isAbandoned: 1 });
cartSchema.index({ createdAt: -1 });

// Calculate subtotal before saving
cartSchema.pre('save', function(next) {
  this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Mark as abandoned if not updated for specified hours
  const abandonedHours = Number(process.env.ABANDONED_CART_HOURS) || 6;
  const abandonmentThreshold = new Date(Date.now() - abandonedHours * 60 * 60 * 1000);
  
  if (this.lastUpdatedAt < abandonmentThreshold && !this.isAbandoned) {
    this.isAbandoned = true;
    this.abandonedAt = new Date();
  }
  
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;

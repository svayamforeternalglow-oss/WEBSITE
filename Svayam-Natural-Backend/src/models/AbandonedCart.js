import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: { type: String },
  slug: { type: String },
  name: { type: String },
  price: { type: Number },
  originalPrice: { type: Number },
  image: { type: String },
  weight: { type: String },
  sku: { type: String },
  quantity: { type: Number, default: 1 },
}, { _id: false });

const abandonedCartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  items: [cartItemSchema],
  subtotal: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  lastActivityAt: { type: Date, default: Date.now, index: true },
  recoveryToken: { type: String, unique: true, sparse: true, index: true },
  tokenExpiresAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 },
  reminderCount: { type: Number, default: 0 },
  firstReminderAt: { type: Date },
  secondReminderAt: { type: Date },
  recoveredAt: { type: Date },
}, { timestamps: true });

const AbandonedCart = mongoose.models.AbandonedCart || mongoose.model('AbandonedCart', abandonedCartSchema);

export default AbandonedCart;

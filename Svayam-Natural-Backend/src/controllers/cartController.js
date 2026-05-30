import crypto from 'crypto';
import AbandonedCart from '../models/AbandonedCart.js';

const MAX_CART_ITEMS = 200;

const generateToken = () => crypto.randomBytes(24).toString('hex');

const normalizeNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const sanitizeItems = (items) =>
  items
    .slice(0, MAX_CART_ITEMS)
    .map((item) => ({
      productId: item.productId || '',
      slug: item.slug || '',
      name: item.name || '',
      price: normalizeNumber(item.price, 0),
      originalPrice: normalizeNumber(item.originalPrice, 0),
      image: item.image || '',
      weight: item.weight || '',
      sku: item.sku || '',
      quantity: Math.max(1, normalizeNumber(item.quantity, 1)),
    }));

// @desc    Upsert abandoned cart snapshot
// @route   POST /api/v1/cart/abandoned
// @access  Private
export const upsertAbandonedCart = async (req, res) => {
  try {
    const { items = [], subtotal = 0, currency = 'INR' } = req.body || {};

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items must be an array' });
    }

    if (items.length === 0) {
      await AbandonedCart.findOneAndDelete({ user: req.user._id });
      return res.json({ success: true, cleared: true });
    }

    const update = {
      items: sanitizeItems(items),
      subtotal: normalizeNumber(subtotal, 0),
      currency: currency || 'INR',
      lastActivityAt: new Date(),
      tokenExpiresAt: new Date(),
    };

    const cart = await AbandonedCart.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: update,
        $setOnInsert: { recoveryToken: generateToken() },
      },
      { upsert: true, new: true }
    );

    if (!cart.recoveryToken) {
      cart.recoveryToken = generateToken();
      await cart.save();
    }

    res.json({ success: true, data: { id: cart._id } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get cart snapshot by recovery token
// @route   GET /api/v1/cart/recovery/:token
// @access  Public
export const getRecoveryCart = async (req, res) => {
  try {
    const token = req.params.token;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Recovery token required' });
    }

    const cart = await AbandonedCart.findOne({ recoveryToken: token }).lean();
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(404).json({ success: false, message: 'Recovery cart not found' });
    }

    res.json({
      success: true,
      data: {
        items: cart.items,
        subtotal: cart.subtotal,
        currency: cart.currency || 'INR',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

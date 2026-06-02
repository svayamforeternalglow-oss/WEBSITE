import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/v1/users/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/v1/users/login
// @access  Public
export const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      addresses: user.addresses,
      wishlist: user.wishlist
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/v1/users/wishlist
// @access  Private
export const addWishlist = async (req, res) => {
  const { productId } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }
    const populatedUser = await User.findById(req.user._id).populate('wishlist');
    res.json(populatedUser.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/v1/users/wishlist/:productId
// @access  Private
export const removeWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(item => item.toString() !== req.params.productId);
    await user.save();
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const normalizeCartItem = (item) => {
  const slug = typeof item?.slug === 'string' ? item.slug.trim() : '';
  if (!slug) {
    return null;
  }

  const quantity = Number(item?.quantity || item?.qty || 1);
  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 20) {
    return null;
  }

  const safeNumber = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);
  const safeString = (value) => (typeof value === 'string' ? value.trim() : '');

  return {
    productId: safeString(item?.productId || item?.product),
    slug,
    name: safeString(item?.name),
    price: safeNumber(item?.price),
    originalPrice: safeNumber(item?.originalPrice),
    image: safeString(item?.image),
    weight: safeString(item?.weight),
    sku: safeString(item?.sku),
    quantity,
  };
};

// @desc    Update saved cart (used for abandoned cart recovery)
// @route   POST /api/v1/users/cart
// @access  Private
export const updateSavedCart = async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'Cart items are required' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const normalizedItems = items
      .map(normalizeCartItem)
      .filter(Boolean);

    user.savedCart = {
      items: normalizedItems,
      updatedAt: new Date(),
    };
    user.abandonedCartEmailSentAt = null;

    await user.save();

    return res.json({
      items: user.savedCart?.items || [],
      updatedAt: user.savedCart?.updatedAt || null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get saved cart
// @route   GET /api/v1/users/cart
// @access  Private
export const getSavedCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('savedCart');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      items: user.savedCart?.items || [],
      updatedAt: user.savedCart?.updatedAt || null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

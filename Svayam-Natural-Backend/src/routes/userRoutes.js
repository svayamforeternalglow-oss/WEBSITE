import express from 'express';
import { body } from 'express-validator';
import { registerUser, authUser, getUserProfile, addWishlist, removeWishlist } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validate.js';

const router = express.Router();

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], validateRequest, registerUser);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
], validateRequest, authUser);

router.get('/profile', protect, getUserProfile);
router.post('/wishlist', protect, addWishlist);
router.delete('/wishlist/:productId', protect, removeWishlist);

export default router;

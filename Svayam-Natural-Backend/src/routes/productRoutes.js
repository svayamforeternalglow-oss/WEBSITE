import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
} from '../controllers/productController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validate.js';

const router = express.Router();

// Validation rules for product create/update
const productValidationRules = [
  body('title').optional().trim(),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('originalPrice').optional().isFloat({ min: 0 }).withMessage('Original price must be a positive number'),
  body('inventory').optional().isInt({ min: 0 }).withMessage('Inventory must be a non-negative integer'),
  body('category').optional().trim(),
  body('concern').optional().trim(),
  body('description').optional().trim(),
  body('story').optional().trim().isLength({ max: 8000 }).withMessage('Story cannot exceed 8000 characters'),
  body('howToUse').optional().trim().isLength({ max: 2000 }).withMessage('How to use cannot exceed 2000 characters'),
  body('sku').optional().trim().isLength({ max: 120 }).withMessage('SKU cannot exceed 120 characters'),
  body('weight').optional().trim().isLength({ max: 120 }).withMessage('Weight cannot exceed 120 characters'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean'),
  body('isSeasonal').optional().isBoolean().withMessage('isSeasonal must be a boolean'),
  body('seasonalRank').optional().isInt({ min: 0 }).withMessage('Seasonal rank must be a non-negative integer'),
  // Ingredients validation: optional array where each item has name and description
  body('ingredients').optional().isArray().withMessage('Ingredients must be an array'),
  body('ingredients.*.name').if(body('ingredients').exists()).trim().notEmpty().withMessage('Ingredient name is required'),
  body('ingredients.*.description').if(body('ingredients').exists()).trim().notEmpty().withMessage('Ingredient description is required'),
  body('ingredients.*.icon').if(body('ingredients').exists()).optional().trim(),
];

router.route('/')
  .get(getProducts)
  .post(protect, admin, productValidationRules, validateRequest, createProduct);

// Slug-based lookup (must be before :id to avoid conflicts)
router.route('/by-slug/:slug')
  .get(getProductBySlug);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, productValidationRules, validateRequest, updateProduct)
  .delete(protect, admin, deleteProduct);

router.route('/:id/stock')
  .patch(protect, admin, updateProductStock);

export default router;

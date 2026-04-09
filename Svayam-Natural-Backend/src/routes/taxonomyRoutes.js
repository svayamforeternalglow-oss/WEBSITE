import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getConcerns,
  createConcern,
  updateConcern,
  deleteConcern,
  getConcernProducts,
  updateConcernProducts,
} from '../controllers/taxonomyController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Categories — public read, admin write
router.route('/categories')
  .get(getCategories)
  .post(protect, admin, createCategory);

router.route('/categories/:id')
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

// Concerns — public read, admin write
router.route('/concerns')
  .get(getConcerns)
  .post(protect, admin, createConcern);

router.route('/concerns/:id')
  .put(protect, admin, updateConcern)
  .delete(protect, admin, deleteConcern);

// Concern-product assignments
router.route('/concerns/:id/products')
  .get(protect, admin, getConcernProducts)
  .put(protect, admin, updateConcernProducts);

export default router;


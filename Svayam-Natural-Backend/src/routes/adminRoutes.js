import express from 'express';
import { getRevenueStats, getOrderStatusStats, getPaymentStats } from '../controllers/adminController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/stats/revenue', protect, admin, getRevenueStats);
router.get('/stats/orders', protect, admin, getOrderStatusStats);
router.get('/stats/payments', protect, admin, getPaymentStats);

export default router;

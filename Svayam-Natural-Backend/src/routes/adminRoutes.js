import express from 'express';
import {
  getRevenueStats,
  getOrderStatusStats,
  getPaymentStats,
  getStatsSummary,
  exportPhones,
  exportUsersWithOrders,
} from '../controllers/adminController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/stats/summary', protect, admin, getStatsSummary);
router.get('/stats/revenue', protect, admin, getRevenueStats);
router.get('/stats/orders', protect, admin, getOrderStatusStats);
router.get('/stats/payments', protect, admin, getPaymentStats);
router.get('/export/phones', protect, admin, exportPhones);
router.get('/export/users', protect, admin, exportUsersWithOrders);

export default router;

import express from 'express';
import {
  addOrderItems,
  getOrderById,
  updateOrderTracking,
  getMyOrders,
  verifyPayment,
  getAdminOrders,
  updateOrderStatus,
  refundOrder,
  downloadInvoice,
  downloadBulkInvoices,
  createGuestOrder,
  verifyGuestPayment,
  verifyWebhook
} from '../controllers/orderController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Authenticated order routes
router.route('/').post(protect, addOrderItems);
router.route('/verify-payment').post(protect, verifyPayment);
router.route('/myorders').get(protect, getMyOrders);

// Admin routes
router.route('/admin/all').get(protect, admin, getAdminOrders);
router.route('/admin/bulk-ship-invoices').get(protect, admin, downloadBulkInvoices);
router.route('/admin/:id/status').patch(protect, admin, updateOrderStatus);
router.route('/admin/:id/refund').post(protect, admin, refundOrder);
router.route('/admin/:id/invoice').get(protect, admin, downloadInvoice);

// Single order routes (must be after /admin/* to avoid conflicts)
router.route('/:id').get(protect, getOrderById);
router.route('/:id/tracking').put(protect, admin, updateOrderTracking);

// Guest order routes
router.post('/guest/create', createGuestOrder);
router.post('/guest/verify-payment', verifyGuestPayment);

// Webhook route
router.post('/webhook', verifyWebhook);

export default router;

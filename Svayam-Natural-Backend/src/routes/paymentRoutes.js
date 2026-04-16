import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import Order from '../models/Order.js';
import { verifyPayment as verifyOrderPayment } from '../controllers/orderController.js';

const router = express.Router();

// @desc    Create Razorpay order
// @route   POST /api/v1/payment/razorpay
// @access  Private
router.post('/razorpay', protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id })
      .select('_id totalAmount paymentStatus')
      .lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.paymentStatus?.razorpayOrderId) {
      return res.status(400).json({ message: 'Payment order not initialized. Create order via /api/v1/orders first.' });
    }

    return res.json({
      success: true,
      message: 'Legacy compatibility response. Prefer /api/v1/orders for checkout.',
      data: {
        orderId: order._id,
        razorpayOrderId: order.paymentStatus.razorpayOrderId,
        amount: order.totalAmount,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Verify Razorpay payment
// @route   POST /api/v1/payment/razorpay/verify
// @access  Private
router.post('/razorpay/verify', protect, async (req, res) => {
  req.body = {
    razorpayOrderId: req.body.razorpayOrderId || req.body.razorpay_order_id,
    razorpayPaymentId: req.body.razorpayPaymentId || req.body.razorpay_payment_id,
    razorpaySignature: req.body.razorpaySignature || req.body.razorpay_signature,
  };

  return verifyOrderPayment(req, res);
});

export default router;

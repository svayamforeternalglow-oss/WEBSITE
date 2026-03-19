import Order from '../models/Order.js';
import User from '../models/User.js';

// @desc    Get revenue stats
// @route   GET /api/v1/admin/stats/revenue
// @access  Private/Admin
export const getRevenueStats = async (req, res) => {
  try {
    const revenue = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);
    res.json({ success: true, data: revenue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order status stats
// @route   GET /api/v1/admin/stats/orders
// @access  Private/Admin
export const getOrderStatusStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: { $toLower: "$trackingStatus" },
          count: { $sum: 1 }
        }
      }
    ]);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment stats
// @route   GET /api/v1/admin/stats/payments
// @access  Private/Admin
export const getPaymentStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          completed: { 
            $sum: { $cond: [{ $eq: [{ $toLower: "$paymentStatus.status" }, "completed"] }, 1, 0] } 
          },
          pending: { 
            $sum: { $cond: [{ $eq: [{ $toLower: "$paymentStatus.status" }, "pending"] }, 1, 0] } 
          },
          failed: { 
            $sum: { $cond: [{ $eq: [{ $toLower: "$paymentStatus.status" }, "failed"] }, 1, 0] } 
          }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

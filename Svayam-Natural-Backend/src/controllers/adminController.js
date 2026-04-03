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

// @desc    Export customer phone numbers as CSV
// @route   GET /api/v1/admin/export/phones
// @access  Private/Admin
export const exportPhones = async (req, res) => {
  try {
    const query = {};
    
    // Optional date range filter
    if (req.query.dateFrom || req.query.dateTo) {
      query.createdAt = {};
      if (req.query.dateFrom) query.createdAt.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) query.createdAt.$lte = new Date(req.query.dateTo + 'T23:59:59.999Z');
    }
    
    // Optional status filter
    if (req.query.status) {
      query.trackingStatus = new RegExp(`^${req.query.status}$`, 'i');
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    // Deduplicate by phone number
    const phoneMap = new Map();

    for (const order of orders) {
      // Extract phone from shipping address (primary source) or user
      const phone = order.shippingAddress?.phone || 
                    (order.user && typeof order.user === 'object' ? order.user.phone : '') || '';
      
      if (!phone || phone === 'N/A') continue;

      const name = order.shippingAddress?.fullName || 
                   (order.user && typeof order.user === 'object' ? order.user.name : '') || 'Guest';
      const email = order.shippingAddress?.email || 
                    (order.user && typeof order.user === 'object' ? order.user.email : '') || '';

      if (phoneMap.has(phone)) {
        const existing = phoneMap.get(phone);
        existing.orderCount += 1;
        // Keep the latest order date
        if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = order.createdAt;
        }
      } else {
        phoneMap.set(phone, {
          phone,
          name,
          email,
          lastOrderDate: order.createdAt,
          orderCount: 1,
        });
      }
    }

    // Build CSV
    const rows = Array.from(phoneMap.values());
    let csv = 'Phone,Name,Email,LastOrderDate,OrderCount\n';
    for (const row of rows) {
      const date = new Date(row.lastOrderDate).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
      // Escape commas in name/email
      const safeName = `"${(row.name || '').replace(/"/g, '""')}"`;
      const safeEmail = `"${(row.email || '').replace(/"/g, '""')}"`;
      csv += `${row.phone},${safeName},${safeEmail},${date},${row.orderCount}\n`;
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="customer-phones-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

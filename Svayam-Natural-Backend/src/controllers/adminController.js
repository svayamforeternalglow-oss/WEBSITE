import Order from '../models/Order.js';
import User from '../models/User.js';
import {
  paidOrderMatch,
  revenueDateExpression,
  parseStatsDays,
  statsWindow,
  dateRangeMatch,
} from '../utils/adminMetrics.js';

const buildPaidStatsPipeline = (windowStart, windowEnd, groupStage) => [
  { $match: paidOrderMatch() },
  { $match: dateRangeMatch(windowStart, windowEnd) },
  { $group: groupStage },
  { $sort: { _id: 1 } },
];

// @desc    Dashboard summary (paid-only revenue and counts)
// @route   GET /api/v1/admin/stats/summary
// @access  Private/Admin
export const getStatsSummary = async (req, res) => {
  try {
    const days = parseStatsDays(req.query);
    const { windowStart, windowEnd } = statsWindow(days);

    const [totals] = await Order.aggregate([
      { $match: paidOrderMatch() },
      { $match: dateRangeMatch(windowStart, windowEnd) },
      {
        $group: {
          _id: null,
          revenuePaid: { $sum: '$totalAmount' },
          ordersPaid: { $sum: 1 },
          deliveredCount: {
            $sum: {
              $cond: [
                {
                  $in: [
                    { $toLower: { $ifNull: ['$lifecycleStatus', ''] } },
                    ['delivered'],
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const revenuePaid = totals?.revenuePaid ?? 0;
    const ordersPaid = totals?.ordersPaid ?? 0;
    const deliveredCount = totals?.deliveredCount ?? 0;

    const activeFulfillmentCount = await Order.countDocuments({
      $and: [
        paidOrderMatch(),
        {
          lifecycleStatus: { $in: ['Paid', 'Processing', 'Shipped'] },
        },
      ],
    });

    res.json({
      success: true,
      data: {
        revenuePaid,
        ordersPaid,
        aovPaid: ordersPaid > 0 ? Math.round(revenuePaid / ordersPaid) : 0,
        deliveredCount,
        deliveredRate: ordersPaid > 0 ? Math.round((deliveredCount / ordersPaid) * 100) : 0,
        activeFulfillmentCount,
        windowStart: windowStart.toISOString(),
        windowEnd: windowEnd.toISOString(),
        days,
        currency: 'INR',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get revenue stats (paid orders only)
// @route   GET /api/v1/admin/stats/revenue
// @access  Private/Admin
export const getRevenueStats = async (req, res) => {
  try {
    const days = parseStatsDays(req.query);
    const { windowStart, windowEnd } = statsWindow(days);

    const revenue = await Order.aggregate(
      buildPaidStatsPipeline(windowStart, windowEnd, {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: revenueDateExpression(),
          },
        },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
      })
    );

    res.json({
      success: true,
      data: revenue,
      meta: {
        windowStart: windowStart.toISOString(),
        windowEnd: windowEnd.toISOString(),
        days,
        scope: 'paid',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order status stats (all orders by lifecycle)
// @route   GET /api/v1/admin/stats/orders
// @access  Private/Admin
export const getOrderStatusStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: {
            $toLower: {
              $ifNull: ['$lifecycleStatus', '$trackingStatus'],
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment stats (daily breakdown)
// @route   GET /api/v1/admin/stats/payments
// @access  Private/Admin
export const getPaymentStats = async (req, res) => {
  try {
    const days = parseStatsDays(req.query);
    const { windowStart, windowEnd } = statsWindow(days);

    const stats = await Order.aggregate([
      { $match: dateRangeMatch(windowStart, windowEnd, '$createdAt') },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          completed: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$isPaid', true] },
                    { $eq: [{ $toLower: '$paymentStatus.status' }, 'completed'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          pending: {
            $sum: {
              $cond: [{ $eq: [{ $toLower: '$paymentStatus.status' }, 'pending'] }, 1, 0],
            },
          },
          failed: {
            $sum: {
              $cond: [{ $eq: [{ $toLower: '$paymentStatus.status' }, 'failed'] }, 1, 0],
            },
          },
          refunded: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: [{ $toLower: '$paymentStatus.status' }, 'refunded'] },
                    { $eq: [{ $toLower: '$lifecycleStatus' }, 'refunded'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: stats,
      meta: { windowStart: windowStart.toISOString(), windowEnd: windowEnd.toISOString(), days },
    });
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

    if (req.query.dateFrom || req.query.dateTo) {
      query.createdAt = {};
      if (req.query.dateFrom) query.createdAt.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) query.createdAt.$lte = new Date(req.query.dateTo + 'T23:59:59.999Z');
    }

    if (req.query.status) {
      const statusRegex = new RegExp(`^${req.query.status}$`, 'i');
      query.$or = [
        { lifecycleStatus: statusRegex },
        { trackingStatus: statusRegex },
      ];
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    const phoneMap = new Map();

    for (const order of orders) {
      const phone =
        order.shippingAddress?.phone ||
        (order.user && typeof order.user === 'object' ? order.user.phone : '') ||
        '';

      if (!phone || phone === 'N/A') continue;

      const name =
        order.shippingAddress?.fullName ||
        (order.user && typeof order.user === 'object' ? order.user.name : '') ||
        'Guest';
      const email =
        order.shippingAddress?.email ||
        (order.user && typeof order.user === 'object' ? order.user.email : '') ||
        '';

      if (phoneMap.has(phone)) {
        const existing = phoneMap.get(phone);
        existing.orderCount += 1;
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

    const rows = Array.from(phoneMap.values());
    let csv = 'Phone,Name,Email,LastOrderDate,OrderCount\n';
    for (const row of rows) {
      const date = new Date(row.lastOrderDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const safeName = `"${(row.name || '').replace(/"/g, '""')}"`;
      const safeEmail = `"${(row.email || '').replace(/"/g, '""')}"`;
      csv += `${row.phone},${safeName},${safeEmail},${date},${row.orderCount}\n`;
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="customer-phones-${new Date().toISOString().slice(0, 10)}.csv"`
    );
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

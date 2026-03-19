import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Helper: resolve a product from a cart item (try slug first, then ObjectId)
async function resolveProduct(item) {
  const identifier = item.slug || item.productId || item.product;
  if (!identifier) return null;

  // Try slug first (most common from frontend)
  let product = await Product.findOne({ slug: identifier });
  
  // Fallback to ObjectId
  if (!product && mongoose.Types.ObjectId.isValid(identifier)) {
    product = await Product.findById(identifier);
  }

  // Fallback: try matching by title (case-insensitive)
  if (!product) {
    product = await Product.findOne({ title: { $regex: new RegExp(`^${identifier.replace(/[-]/g, ' ')}$`, 'i') } });
  }

  return product;
}

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
export const addOrderItems = async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, totalAmount } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  try {
    const finalItems = [];
    let subtotal = 0;

    for (const item of orderItems) {
      const product = await resolveProduct(item);
      
      if (product) {
        const qty = item.qty || item.quantity || 1;
        
        if (product.inventory < qty) {
          return res.status(400).json({ message: `Insufficient stock for ${product.title}. Only ${product.inventory} left.` });
        }
        product.inventory -= qty;
        await product.save();

        finalItems.push({
          name: product.title,
          qty,
          image: product.images[0] || '/images/placeholder.jpg',
          price: product.price,
          product: product._id
        });
        subtotal += product.price * qty;
      } else {
        console.warn(`Product not found for: ${JSON.stringify(item)}`);
      }
    }

    // Reject order if no items resolved
    if (finalItems.length === 0) {
      return res.status(400).json({ 
        message: 'None of the products in your cart could be found. Please refresh and try again.' 
      });
    }

    const tax = Math.round(subtotal * 0.18);
    const shipping = subtotal > 1000 ? 0 : 100;
    const finalTotal = subtotal + tax + shipping;

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const razorpayOrder = await instance.orders.create({
      amount: Math.round(finalTotal * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    if (!razorpayOrder || !razorpayOrder.id) {
       console.error("Razorpay order creation failed: ", razorpayOrder);
       throw new Error('Failed to create Razorpay payment order. Check your keys.');
    }

    const order = new Order({
      user: req.user._id,
      orderItems: finalItems,
      shippingAddress,
      paymentMethod,
      totalAmount: finalTotal,
      paymentStatus: {
        razorpayOrderId: razorpayOrder.id,
        status: 'Pending'
      }
    });

    const createdOrder = await order.save();
    
    // Email (non-blocking)
    try {
      const User = (await import('../models/User.js')).default;
      const emailService = await import('../services/emailService.js');
      const user = await User.findById(req.user._id);
      if (user && user.email) {
        await emailService.sendOrderConfirmationEmail(user.email, createdOrder);
      }
    } catch(err) {
      console.error("Email error: ", err);
    }

    res.status(201).json({
      success: true,
      data: {
        orderId: createdOrder._id,
        orderNumber: createdOrder._id,
        razorpayOrderId: razorpayOrder.id,
        amount: finalTotal,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error("addOrderItems error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify authenticated payment
// @route   POST /api/v1/orders/verify-payment
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const sign = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpaySignature === expectedSign) {
      const order = await Order.findOne({ "paymentStatus.razorpayOrderId": razorpayOrderId, user: req.user._id });
      if (order) {
        const instance = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const payment = await instance.payments.fetch(razorpayPaymentId);
        
        if (payment.amount !== Math.round(order.totalAmount * 100)) {
          return res.status(400).json({ message: "Payment amount does not match order amount" });
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentStatus.status = 'Completed';
        order.paymentStatus.razorpayPaymentId = razorpayPaymentId;
        order.paymentStatus.razorpaySignature = razorpaySignature;
        await order.save();
        return res.status(200).json({ success: true, message: "Payment verified successfully" });
      } else {
        return res.status(404).json({ message: "Order not found" });
      }
    } else {
      return res.status(400).json({ message: "Invalid signature" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order tracking status
// @route   PUT /api/v1/orders/:id/tracking
// @access  Private/Admin
export const updateOrderTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.trackingStatus = req.body.status || order.trackingStatus;
      order.trackingNumber = req.body.trackingNumber || order.trackingNumber;
      
      if (req.body.status === 'Shipped') {
        order.shippedAt = Date.now();
        try {
          const User = (await import('../models/User.js')).default;
          const emailService = await import('../services/emailService.js');
          const user = await User.findById(order.user);
          if (user && user.email) {
            await emailService.sendShippingUpdateEmail(user.email, order);
          }
        } catch(err) {
          console.error("Email error: ", err);
        }
      }
      if (req.body.status === 'Delivered') order.deliveredAt = Date.now();

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/v1/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PATCH /api/v1/orders/admin/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const statusMap = {
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      'out for delivery': 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    
    if (req.body.status) {
      order.trackingStatus = statusMap[(req.body.status || '').toLowerCase()] || req.body.status;
    }

    // Save estimated delivery date if provided
    if (req.body.estimatedDelivery) {
      order.estimatedDelivery = new Date(req.body.estimatedDelivery);
    }
    
    if (order.trackingStatus === 'Shipped' && !order.shippedAt) {
      order.shippedAt = Date.now();
    } else if (order.trackingStatus === 'Delivered' && !order.deliveredAt) {
      order.deliveredAt = Date.now();
      if (!order.shippedAt) order.shippedAt = Date.now(); 
    }

    const updatedOrder = await order.save();
    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper: compute pricing breakdown from an order
function computePricing(order) {
  const subtotal = (order.orderItems || []).reduce((sum, item) => {
    return sum + (item.price * (item.qty || item.quantity || 1));
  }, 0);
  const tax = Math.round(subtotal * 0.18);
  const shipping = subtotal > 1000 ? 0 : 100;
  const grandTotal = order.totalAmount || (subtotal + tax + shipping);
  return { subtotal, tax, shipping, grandTotal };
}

// @desc    Get all orders for admin
// @route   GET /api/v1/orders/admin/all
// @access  Private/Admin
export const getAdminOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const query = {};
    if (req.query.status) {
      query.trackingStatus = new RegExp(`^${req.query.status}$`, 'i');
    }

    const total = await Order.countDocuments(query);
    const ordersRaw = await Order.find(query)
      .populate('user', 'name email firstName lastName phone')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const orders = ordersRaw.map((order) => {
      let mappedUser = 'Guest';
      if (order.user) {
        mappedUser = {
          firstName: order.user.name || order.user.firstName || 'User',
          lastName: order.user.lastName || '',
          email: order.user.email,
          phone: order.user.phone || ''
        };
      } else if (order.shippingAddress && order.shippingAddress.fullName) {
        const [firstName, ...rest] = order.shippingAddress.fullName.split(' ');
        mappedUser = {
          firstName: firstName || 'Guest',
          lastName: rest.join(' ') || '',
          email: order.shippingAddress.email || '',
          phone: order.shippingAddress.phone || ''
        };
      }

      const pricing = computePricing(order);

      return {
        _id: order._id,
        orderId: order._id.toString(),
        userId: mappedUser,
        items: (order.orderItems || []).map(item => ({
          name: item.name,
          quantity: item.qty || item.quantity || 1,
          price: item.price,
          sku: item.product ? item.product.toString() : 'NO-SKU'
        })),
        pricing,
        shippingAddress: {
          firstName: order.shippingAddress?.fullName || '',
          lastName: '',
          city: order.shippingAddress?.city || '',
          state: order.shippingAddress?.state || '',
          pincode: order.shippingAddress?.pincode || '',
          phone: order.shippingAddress?.phone || ''
        },
        payment: {
          method: order.paymentMethod || 'Razorpay',
          status: order.isPaid ? 'completed' : (order.paymentStatus?.status?.toLowerCase() || 'pending'),
          razorpayPaymentId: order.paymentStatus?.razorpayPaymentId
        },
        status: order.trackingStatus?.toLowerCase() || 'pending',
        createdAt: order.createdAt,
        estimatedDelivery: order.estimatedDelivery || null,
        tracking: {
          trackingNumber: order.trackingNumber,
          carrier: 'Courier'
        }
      };
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Refund an order 
// @route   POST /api/v1/orders/admin/:id/refund
// @access  Private/Admin
export const refundOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (!order.isPaid) {
      return res.status(400).json({ message: 'Cannot refund unpaid order' });
    }
    
    order.trackingStatus = 'Cancelled';
    if(order.paymentStatus) {
       order.paymentStatus.status = 'Refunded';
    } else {
       order.paymentStatus = { status: 'Refunded' };
    }

    const updatedOrder = await order.save();
    res.json({ success: true, message: 'Refund processed successfully', data: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download Invoice for a specific order (HTML)
// @route   GET /api/v1/orders/admin/:id/invoice
// @access  Private/Admin
export const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const pricing = computePricing(order);
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });

    const customerName = order.shippingAddress?.fullName || (order.user?.name) || 'Guest';
    const customerEmail = order.shippingAddress?.email || order.user?.email || 'N/A';
    const customerPhone = order.shippingAddress?.phone || 'N/A';
    const customerAddress = [
      order.shippingAddress?.address,
      order.shippingAddress?.city,
      order.shippingAddress?.state,
      order.shippingAddress?.pincode
    ].filter(Boolean).join(', ') || 'N/A';

    const itemRows = (order.orderItems || []).map((item, i) => {
      const qty = item.qty || item.quantity || 1;
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;">${i + 1}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;">${item.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;text-align:center;">${qty}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;text-align:right;">₹${item.price}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;text-align:right;">₹${item.price * qty}</td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Invoice - ${order._id}</title>
<style>
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .no-print { display:none; } }
  body { font-family: 'Segoe UI', Arial, sans-serif; margin:0; padding:20px; background:#f9f9f6; color:#1a2e1a; }
  .invoice { max-width:800px; margin:0 auto; background:#fff; border:1px solid #e0ddd5; border-radius:8px; overflow:hidden; }
  .header { background:#1a2e1a; color:#f5f0e6; padding:24px 32px; display:flex; justify-content:space-between; align-items:center; }
  .header h1 { margin:0; font-size:22px; letter-spacing:1px; }
  .header .inv-num { font-size:13px; opacity:0.85; }
  .body { padding:24px 32px; }
  .meta { display:flex; justify-content:space-between; margin-bottom:24px; flex-wrap:wrap; gap:16px; }
  .meta-block h3 { margin:0 0 6px; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#8b7e6a; }
  .meta-block p { margin:2px 0; font-size:13px; }
  table { width:100%; border-collapse:collapse; margin-bottom:24px; font-size:13px; }
  thead { background:#f5f0e6; }
  th { padding:10px 12px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:#1a2e1a; border-bottom:2px solid #c2a25d; }
  .totals { width:280px; margin-left:auto; font-size:13px; }
  .totals tr td { padding:4px 12px; }
  .totals .grand { font-size:16px; font-weight:bold; color:#1a2e1a; border-top:2px solid #c2a25d; }
  .footer { text-align:center; padding:16px; font-size:11px; color:#8b7e6a; border-top:1px solid #e0ddd5; }
  .badge { display:inline-block; padding:3px 10px; border-radius:12px; font-size:11px; font-weight:600; }
  .badge-paid { background:#d1fae5; color:#065f46; }
  .badge-pending { background:#fef3c7; color:#92400e; }
  .print-btn { display:block; margin:20px auto; padding:10px 28px; background:#1a2e1a; color:#f5f0e6; border:none; border-radius:6px; cursor:pointer; font-size:14px; }
</style></head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
  <div class="invoice">
    <div class="header">
      <div>
        <h1>SVAYAM NATURAL</h1>
        <div class="inv-num">Tax Invoice</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:13px;">Order #${order._id.toString().slice(-10).toUpperCase()}</div>
        <div style="font-size:12px;opacity:0.8;">${orderDate}</div>
      </div>
    </div>
    <div class="body">
      <div class="meta">
        <div class="meta-block">
          <h3>Bill To</h3>
          <p><strong>${customerName}</strong></p>
          <p>${customerEmail}</p>
          <p>${customerPhone}</p>
        </div>
        <div class="meta-block">
          <h3>Ship To</h3>
          <p>${customerAddress}</p>
        </div>
        <div class="meta-block">
          <h3>Payment</h3>
          <p>${order.paymentMethod || 'Razorpay'}</p>
          <p><span class="badge ${order.isPaid ? 'badge-paid' : 'badge-pending'}">${order.isPaid ? 'PAID' : 'PENDING'}</span></p>
        </div>
      </div>
      <table>
        <thead><tr>
          <th>#</th><th>Item</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Price</th><th style="text-align:right;">Total</th>
        </tr></thead>
        <tbody>${itemRows || '<tr><td colspan="5" style="padding:12px;text-align:center;color:#8b7e6a;">No items</td></tr>'}</tbody>
      </table>
      <table class="totals">
        <tr><td>Subtotal</td><td style="text-align:right;">₹${pricing.subtotal}</td></tr>
        <tr><td>GST (18%)</td><td style="text-align:right;">₹${pricing.tax}</td></tr>
        <tr><td>Shipping</td><td style="text-align:right;">${pricing.shipping === 0 ? 'FREE' : '₹' + pricing.shipping}</td></tr>
        <tr class="grand"><td>Grand Total</td><td style="text-align:right;">₹${pricing.grandTotal}</td></tr>
      </table>
    </div>
    <div class="footer">
      Thank you for shopping with Svayam Natural! · support@svayam-natural.com
    </div>
  </div>
</body></html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="invoice-${order._id}.html"`);
    res.send(html);
  } catch (error) {
    console.error("downloadInvoice error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download Bulk Shipping Invoices & mark as shipped
// @route   GET /api/v1/orders/admin/bulk-ship-invoices
// @access  Private/Admin
export const downloadBulkInvoices = async (req, res) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
    const dateQuery = new Date(dateStr);
    const startOfDay = new Date(dateQuery.getFullYear(), dateQuery.getMonth(), dateQuery.getDate(), 0, 0, 0);
    const endOfDay = new Date(dateQuery.getFullYear(), dateQuery.getMonth(), dateQuery.getDate(), 23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      isPaid: true
    });

    if (orders.length === 0) {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename=bulk-invoices-${dateStr}.txt`);
      return res.send("No paid orders found for this date.");
    }

    let bulkText = `BULK SHIPPING INVOICES FOR ${dateStr}\n${'='.repeat(50)}\n\n`;
    
    for (const order of orders) {
      if(order.trackingStatus !== 'Shipped' && order.trackingStatus !== 'Delivered') {
        order.trackingStatus = 'Shipped';
        order.trackingNumber = `AWB-${Math.floor(Math.random() * 1000000000)}`;
        order.shippedAt = Date.now();
        await order.save();
      }

      const items = (order.orderItems || []).map(item => 
        `    ${(item.qty || 1)}x ${item.name} — ₹${item.price * (item.qty || 1)}`
      ).join('\n');

      bulkText += `Order: ${order._id}\n`;
      bulkText += `Customer: ${order.shippingAddress?.fullName || 'Guest'}\n`;
      bulkText += `Address: ${[order.shippingAddress?.address, order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.pincode].filter(Boolean).join(', ')}\n`;
      bulkText += `Phone: ${order.shippingAddress?.phone || 'N/A'}\n`;
      bulkText += `Items:\n${items || '    No items'}\n`;
      bulkText += `Total: ₹${order.totalAmount}\n`;
      bulkText += `AWB: ${order.trackingNumber}\n`;
      bulkText += `${'─'.repeat(50)}\n\n`;
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="shipping-invoices-${dateStr}.txt"`);
    res.send(bulkText);
  } catch (error) {
    console.error("downloadBulkInvoices error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create guest order
// @route   POST /api/v1/orders/guest/create
// @access  Public
export const createGuestOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in cart' });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await resolveProduct(item);

      if (!product) {
        console.warn(`Product not found for: ${JSON.stringify(item)}`);
        continue;
      }
      
      const qty = item.quantity || item.qty || 1;
      
      if (product.inventory < qty) {
        return res.status(400).json({ message: `Insufficient stock for ${product.title}. Only ${product.inventory} left.` });
      }
      product.inventory -= qty;
      await product.save();

      orderItems.push({
        name: product.title,
        qty,
        image: product.images[0] || '/images/placeholder.jpg',
        price: product.price,
        product: product._id
      });
      subtotal += product.price * qty;
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ 
        message: 'None of the products in your cart could be found. Please refresh and try again.' 
      });
    }

    const tax = Math.round(subtotal * 0.18);
    const shipping = subtotal > 1000 ? 0 : 100;
    const finalTotal = subtotal + tax + shipping;

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const razorpayOrder = await instance.orders.create({
      amount: Math.round(finalTotal * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    if (!razorpayOrder || !razorpayOrder.id) {
       console.error("Guest Razorpay order creation failed: ", razorpayOrder);
       throw new Error('Failed to create guest payment order. Check your keys.');
    }

    const order = new Order({
      orderItems,
      shippingAddress,
      totalAmount: finalTotal,
      paymentStatus: {
        razorpayOrderId: razorpayOrder.id,
        status: 'Pending'
      }
    });

    const createdOrder = await order.save();

    res.status(201).json({
      success: true,
      data: {
        orderId: createdOrder._id,
        orderNumber: createdOrder._id,
        razorpayOrderId: razorpayOrder.id,
        amount: finalTotal,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID
      }
    });

  } catch (error) {
    console.error("createGuestOrder error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify guest payment
// @route   POST /api/v1/orders/guest/verify-payment
// @access  Public
export const verifyGuestPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const sign = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpaySignature === expectedSign) {
      const order = await Order.findOne({ "paymentStatus.razorpayOrderId": razorpayOrderId });
      if (order) {
        const instance = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const payment = await instance.payments.fetch(razorpayPaymentId);
        
        if (payment.amount !== Math.round(order.totalAmount * 100)) {
          return res.status(400).json({ message: "Payment amount does not match order amount" });
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentStatus.status = 'Completed';
        order.paymentStatus.razorpayPaymentId = razorpayPaymentId;
        order.paymentStatus.razorpaySignature = razorpaySignature;
        await order.save();

        try {
          const emailService = await import('../services/emailService.js');
          if (order.shippingAddress?.email) {
            await emailService.sendOrderConfirmationEmail(order.shippingAddress.email, order);
          }
        } catch (err) {
          console.error("Email error:", err);
        }

        return res.status(200).json({ success: true, message: "Payment verified successfully" });
      } else {
        return res.status(404).json({ message: "Order not found" });
      }
    } else {
      return res.status(400).json({ message: "Invalid signature" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Handle Razorpay Webhook
// @route   POST /api/v1/orders/webhook
// @access  Public
export const verifyWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return res.status(400).json({ message: 'Webhook secret not configured' });

    const signature = req.headers['x-razorpay-signature'];
    
    // Validate signature using raw body
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(req.rawBody || JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const { event, payload } = req.body;

    if (event === 'payment.captured') {
      const payment = payload.payment.entity;
      const razorpayOrderId = payment.order_id;

      const order = await Order.findOne({ "paymentStatus.razorpayOrderId": razorpayOrderId });
      
      if (order && !order.isPaid) {
        if (payment.amount === Math.round(order.totalAmount * 100)) {
          order.isPaid = true;
          order.paidAt = Date.now();
          order.paymentStatus.status = 'Completed';
          order.paymentStatus.razorpayPaymentId = payment.id;
          order.paymentStatus.razorpaySignature = 'webhook_verified';
          await order.save();

          try {
            const emailService = await import('../services/emailService.js');
            let customerEmail = order.shippingAddress?.email;
            if (!customerEmail && order.user) {
              const User = (await import('../models/User.js')).default;
              const user = await User.findById(order.user);
              if (user) customerEmail = user.email;
            }
            if (customerEmail) {
              await emailService.sendOrderConfirmationEmail(customerEmail, order);
            }
          } catch(err) {
            console.error("Email error: ", err);
          }
        }
      }
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ message: error.message });
  }
};

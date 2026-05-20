import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import shiprocket from '../services/shiprocketService.js';
import { ensureShiprocketOrder } from '../services/shiprocketAutomation.js';
import {
  renderHtmlToPdf,
  invoicePdfOptions,
  shippingLabelsPdfOptions,
  PDF_WEB_FONT_LINKS,
} from '../utils/htmlToPdf.js';
import {
  getOrderState,
  transitionOrder,
  ORDER_STATES,
  CANCELLATION_REASONS,
} from '../services/orderStateMachine.js';

/** Seller / return address for invoice PDFs (wrapped for meta blocks). */
const PDF_SELLER_FROM_HTML = `<p style="margin:2px 0;font-size:13px;line-height:1.35;"><strong>Svayam Natural</strong><br>116A, Chhatrapati Nagar, Nagpur 440015<br>8446555705</p>`;

/** Same address for shipping labels (line breaks only, no outer &lt;p&gt;). */
const PDF_SELLER_FROM_LABEL_HTML = `<strong>Svayam Natural</strong><br>116A, Chhatrapati Nagar, Nagpur 440015<br>8446555705`;

const PDF_LABEL_RETURN_NOTE =
  '<span style="font-size:0.75em;color:#444;display:block;margin-top:6px;">If undelivered, return to this address.</span>';

const SHIPPING_FREE_THRESHOLD = Number(process.env.SHIPPING_FREE_THRESHOLD || 1500);
const SHIPPING_FEE = Number(process.env.SHIPPING_FEE || 200);

const calculateShipping = (subtotal) =>
  subtotal >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FEE;

// Helper: Auto-generate Shiprocket Shipment
async function autoGenerateShipment(order) {
  const orderId = order?._id?.toString?.() || String(order?._id || 'unknown');

  try {
    console.info('[OrderAutoShip] Starting shipment automation', {
      orderId,
      currentState: getOrderState(order),
      isPaid: order.isPaid,
      paymentStatus: order.paymentStatus?.status || 'Unknown',
      shiprocketEnabled: shiprocket.isEnabled,
    });

    if (!order.shiprocketShipmentId) {
      const srResult = await shiprocket.createOrder(order);
      order.shiprocketOrderId = srResult.order_id?.toString() || order.shiprocketOrderId || '';
      order.shiprocketShipmentId = srResult.shipment_id?.toString() || '';

      console.info('[OrderAutoShip] Shiprocket order created', {
        orderId,
        shiprocketOrderId: order.shiprocketOrderId || null,
        shiprocketShipmentId: order.shiprocketShipmentId || null,
      });
    }

    if (!order.shiprocketShipmentId) {
      console.error('[OrderAutoShip] Shiprocket shipment ID missing after createOrder', { orderId });
      throw createHttpError('Shiprocket shipment creation failed. Try again.', 502);
    }

    if (!order.awbCode) {
      console.info('[OrderAutoShip] Generating AWB', {
        orderId,
        shiprocketShipmentId: order.shiprocketShipmentId,
      });

      const awbResult = await shiprocket.generateAWB(order.shiprocketShipmentId);
      const awbData = awbResult?.response?.data;
      if (!awbData?.awb_code) {
        console.error('[OrderAutoShip] AWB missing in Shiprocket response', {
          orderId,
          shiprocketShipmentId: order.shiprocketShipmentId,
        });
        throw createHttpError('AWB generation failed. Keep order in processing and retry.', 502);
      }

      order.awbCode = awbData.awb_code;
      order.courierName = awbData.courier_name || 'Courier';
    }

    if (!order.labelUrl) {
      try {
        const labelResult = await shiprocket.generateLabel(order.shiprocketShipmentId);
        const labelUrl = shiprocket.extractDocumentUrl(labelResult, ['label_url']);
        if (labelUrl) {
          order.labelUrl = labelUrl;
        }
      } catch (labelErr) {
        console.error('[OrderAutoShip] Auto label generation error', {
          orderId,
          shiprocketShipmentId: order.shiprocketShipmentId || null,
          statusCode: labelErr.statusCode || null,
          code: labelErr.code || null,
          message: labelErr.message,
        });
      }
    }

    if (!order.shiprocketInvoiceUrl && order.shiprocketOrderId) {
      try {
        const invoiceResult = await shiprocket.generateInvoice(order.shiprocketOrderId);
        const invoiceUrl = shiprocket.extractDocumentUrl(invoiceResult, ['invoice_url']);
        if (invoiceUrl) {
          order.shiprocketInvoiceUrl = invoiceUrl;
        }
      } catch (invoiceErr) {
        console.error('[OrderAutoShip] Auto invoice generation error', {
          orderId,
          shiprocketOrderId: order.shiprocketOrderId || null,
          statusCode: invoiceErr.statusCode || null,
          code: invoiceErr.code || null,
          message: invoiceErr.message,
        });
      }
    }
  } catch (err) {
    console.error('[OrderAutoShip] Automation failed', {
      orderId,
      statusCode: err.statusCode || null,
      code: err.code || null,
      message: err.message,
    });
    if (!err.statusCode) {
      err.statusCode = 502;
    }
    throw err;
  }

  if (!order.awbCode) {
    throw createHttpError('Shipment is not ready yet. AWB missing.', 502);
  }

  order.trackingNumber = order.awbCode;

  console.info('[OrderAutoShip] Automation completed', {
    orderId,
    shiprocketOrderId: order.shiprocketOrderId || null,
    shiprocketShipmentId: order.shiprocketShipmentId || null,
    awbCode: order.awbCode || null,
  });

  return order;
}

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

const getIdempotencyKey = (req) => {
  const headerKey = req.get('x-idempotency-key');
  const bodyKey = req.body?.idempotencyKey;
  return (headerKey || bodyKey || '').trim();
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

const validateShippingAddress = (shippingAddress) => {
  if (!shippingAddress || typeof shippingAddress !== 'object') {
    return 'Shipping address is required';
  }

  const fullName = (shippingAddress.fullName || '').trim();
  const email = (shippingAddress.email || '').trim().toLowerCase();
  const phone = (shippingAddress.phone || '').trim();
  const address = (shippingAddress.address || '').trim();
  const city = (shippingAddress.city || '').trim();
  const state = (shippingAddress.state || '').trim();
  const pincode = (shippingAddress.pincode || '').trim();

  if (!fullName) return 'Full name is required';
  if (!EMAIL_REGEX.test(email)) return 'Valid email is required';
  if (!PHONE_REGEX.test(phone)) return 'Valid 10-digit phone number is required';
  if (!address) return 'Address is required';
  if (!city) return 'City is required';
  if (!state) return 'State is required';
  if (!PINCODE_REGEX.test(pincode)) return 'Valid 6-digit pincode is required';

  return null;
};

const validateOrderItemsPayload = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return 'No order items';
  }

  for (const item of items) {
    const qty = Number(item?.qty || item?.quantity || 1);
    if (!Number.isFinite(qty) || qty < 1 || qty > 20) {
      return 'Each item quantity must be between 1 and 20';
    }
  }

  return null;
};

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertPaymentReferenceUniqueness = async (orderId, razorpayPaymentId) => {
  if (!razorpayPaymentId) {
    return;
  }

  const conflictingOrder = await Order.findOne({
    _id: { $ne: orderId },
    'paymentStatus.razorpayPaymentId': razorpayPaymentId,
  })
    .select('_id')
    .lean();

  if (conflictingOrder) {
    throw createHttpError('Payment reference already linked to another order', 409);
  }
};

const sendDuplicateOrderResponse = async (res, idempotencyKey) => {
  const existingOrder = await Order.findOne({ idempotencyKey })
    .select('_id paymentStatus totalAmount createdAt')
    .lean();

  return res.status(409).json({
    success: false,
    code: 'DUPLICATE_CHECKOUT',
    message: 'Duplicate checkout request detected. Order already exists for this idempotency key.',
    data: existingOrder
      ? {
          orderId: existingOrder._id,
          paymentStatus: existingOrder.paymentStatus?.status || 'Pending',
          amount: existingOrder.totalAmount,
          createdAt: existingOrder.createdAt,
        }
      : null,
  });
};

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
export const addOrderItems = async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;
  const idempotencyKey = getIdempotencyKey(req);
  const touchedInventory = [];
  let orderPersisted = false;

  const itemsValidationError = validateOrderItemsPayload(orderItems);
  if (itemsValidationError) {
    return res.status(400).json({ message: itemsValidationError });
  }

  const shippingValidationError = validateShippingAddress(shippingAddress);
  if (shippingValidationError) {
    return res.status(400).json({ message: shippingValidationError });
  }

  if (!idempotencyKey) {
    return res.status(400).json({
      message: 'Missing idempotency key. Please retry checkout from the latest page.',
    });
  }

  try {
    const duplicateOrder = await Order.exists({ idempotencyKey });
    if (duplicateOrder) {
      return sendDuplicateOrderResponse(res, idempotencyKey);
    }

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
        touchedInventory.push({ productId: product._id, qty });

        finalItems.push({
          name: product.title,
          qty,
          image: product.images[0] || '/images/All-Products.jpeg',
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

    const tax = 0;
    const shipping = calculateShipping(subtotal);
    const finalTotal = subtotal + shipping;

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
      lifecycleStatus: ORDER_STATES.PENDING,
      idempotencyKey,
      paymentStatus: {
        razorpayOrderId: razorpayOrder.id,
        status: 'Pending'
      }
    });

    const createdOrder = await order.save();
    orderPersisted = true;
    
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
    if (!orderPersisted && touchedInventory.length > 0) {
      await Promise.all(
        touchedInventory.map(({ productId, qty }) =>
          Product.updateOne({ _id: productId }, { $inc: { inventory: qty } })
        )
      );
    }

    if (error?.code === 11000 && error?.keyPattern?.idempotencyKey) {
      return sendDuplicateOrderResponse(res, idempotencyKey);
    }

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

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: 'Missing payment verification fields' });
    }

    const sign = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpaySignature !== expectedSign) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const order = await Order.findOne({
      "paymentStatus.razorpayOrderId": razorpayOrderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.isPaid && order.paymentStatus?.razorpayPaymentId === razorpayPaymentId) {
      return res.status(200).json({ success: true, message: 'Payment already verified' });
    }

    if (order.isPaid && order.paymentStatus?.razorpayPaymentId && order.paymentStatus.razorpayPaymentId !== razorpayPaymentId) {
      return res.status(409).json({ message: 'Order is already paid with a different payment reference' });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const payment = await instance.payments.fetch(razorpayPaymentId);

    if (payment.amount !== Math.round(order.totalAmount * 100)) {
      return res.status(400).json({ message: "Payment amount does not match order amount" });
    }

    await assertPaymentReferenceUniqueness(order._id, razorpayPaymentId);

    transitionOrder(order, ORDER_STATES.PAID, {
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    await ensureShiprocketOrder(order, 'verifyPayment');
    await order.save();
    return res.status(200).json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin) {
      const ownerId = order.user?._id?.toString();
      if (!ownerId || ownerId !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
    }

    return res.json(order);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Update order tracking status
// @route   PUT /api/v1/orders/:id/tracking
// @access  Private/Admin
export const updateOrderTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      const statusMap = {
        processing: ORDER_STATES.PROCESSING,
        shipped: ORDER_STATES.SHIPPED,
        delivered: ORDER_STATES.DELIVERED,
        cancelled: ORDER_STATES.CANCELLED,
      };

      const requestedStatus = (req.body.status || '').toLowerCase();
      const targetState = requestedStatus ? statusMap[requestedStatus] : null;

      if (requestedStatus && !targetState) {
        return res.status(400).json({ message: 'Invalid tracking status' });
      }

      if (targetState === ORDER_STATES.SHIPPED) {
        const currentState = getOrderState(order);
        if (currentState === ORDER_STATES.PAID) {
          transitionOrder(order, ORDER_STATES.PROCESSING);
        }

        if (getOrderState(order) !== ORDER_STATES.PROCESSING) {
          return res.status(400).json({ message: 'Order must be in Processing state before shipment creation' });
        }

        await autoGenerateShipment(order);
        transitionOrder(order, ORDER_STATES.SHIPPED);

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
      } else if (targetState === ORDER_STATES.CANCELLED) {
        transitionOrder(order, targetState, {
          reason: req.body.cancellationReason || CANCELLATION_REASONS.ADMIN_CANCELLED,
        });
      } else if (targetState) {
        transitionOrder(order, targetState);
      }

      if (req.body.trackingNumber && targetState !== ORDER_STATES.SHIPPED) {
        order.trackingNumber = req.body.trackingNumber;
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
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
      pending: ORDER_STATES.PENDING,
      paid: ORDER_STATES.PAID,
      processing: ORDER_STATES.PROCESSING,
      shipped: ORDER_STATES.SHIPPED,
      delivered: ORDER_STATES.DELIVERED,
      cancelled: ORDER_STATES.CANCELLED,
    };

    if (req.body.status) {
      const normalizedStatus = (req.body.status || '').toLowerCase();
      if (normalizedStatus === 'refunded') {
        return res.status(400).json({ message: 'Use the refund endpoint to mark an order as refunded' });
      }

      const requestedState = statusMap[normalizedStatus];
      if (!requestedState) {
        return res.status(400).json({ message: 'Invalid status transition request' });
      }

      // Hard guard: shipping is blocked unless payment is completed.
      if (requestedState === ORDER_STATES.SHIPPED && !order.isPaid && order.paymentStatus?.status !== 'Completed') {
        return res.status(400).json({ message: 'Cannot ship an unpaid order' });
      }

      if (requestedState === ORDER_STATES.CANCELLED) {
        transitionOrder(order, requestedState, {
          reason: req.body.cancellationReason || CANCELLATION_REASONS.ADMIN_CANCELLED,
        });
      } else if (requestedState === ORDER_STATES.SHIPPED) {
        const currentState = getOrderState(order);
        if (currentState === ORDER_STATES.PAID) {
          transitionOrder(order, ORDER_STATES.PROCESSING);
        }

        if (getOrderState(order) !== ORDER_STATES.PROCESSING) {
          return res.status(400).json({ message: 'Order must be in Processing state before shipment creation' });
        }

        await autoGenerateShipment(order);
        transitionOrder(order, requestedState);
      } else {
        transitionOrder(order, requestedState);
      }
    }

    // Save estimated delivery date if provided
    if (req.body.estimatedDelivery) {
      order.estimatedDelivery = new Date(req.body.estimatedDelivery);
    }

    const updatedOrder = await order.save();
    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// Helper: compute pricing breakdown from an order
function computePricing(order) {
  const subtotal = (order.orderItems || []).reduce((sum, item) => {
    return sum + (item.price * (item.qty || item.quantity || 1));
  }, 0);
  const tax = 0;
  const shipping = calculateShipping(subtotal);
  const grandTotal = order.totalAmount || (subtotal + shipping);
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
      const statusRegex = new RegExp(`^${req.query.status}$`, 'i');
      query.$or = [
        { lifecycleStatus: statusRegex },
        { trackingStatus: statusRegex },
      ];
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
        status: (order.lifecycleStatus || order.trackingStatus || 'Pending').toLowerCase(),
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

    const razorpayPaymentId = order.paymentStatus?.razorpayPaymentId;
    if (!razorpayPaymentId) {
      return res.status(400).json({ message: 'Missing Razorpay payment reference for refund' });
    }

    const fullAmount = Number(order.totalAmount || 0);
    const requestedAmount = req.body.amount ? Number(req.body.amount) : fullAmount;

    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      return res.status(400).json({ message: 'Invalid refund amount' });
    }

    if (requestedAmount > fullAmount) {
      return res.status(400).json({ message: 'Refund amount cannot exceed order total' });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const refundPayload = {
      amount: Math.round(requestedAmount * 100),
      notes: {
        orderId: order._id.toString(),
        reason: req.body.reason || 'admin_refund',
      },
    };

    const refund = await instance.payments.refund(razorpayPaymentId, refundPayload);

    transitionOrder(order, ORDER_STATES.REFUNDED, {
      reason: CANCELLATION_REASONS.REFUND,
      refundId: refund.id,
      refundAmount: requestedAmount,
    });

    const updatedOrder = await order.save();
    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: updatedOrder,
      refundId: refund.id,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Download Invoice for a specific order (PDF via Puppeteer)
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
        <td style="padding:6px 10px;border-bottom:1px solid #e5e5e5;">${i + 1}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e5e5;">${item.name}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e5e5;text-align:center;">${qty}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e5e5;text-align:right;">₹${item.price}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e5e5;text-align:right;">₹${item.price * qty}</td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">${PDF_WEB_FONT_LINKS}<title>Invoice - ${order._id}</title>
<style>
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .no-print { display:none; } }
  body { font-family: 'Noto Sans', 'Segoe UI', 'DejaVu Sans', Arial, sans-serif; margin:0; padding:12px 14px; background:#f9f9f6; color:#1a2e1a; }
  .invoice { max-width:800px; margin:0 auto; background:#fff; border:1px solid #e0ddd5; border-radius:8px; overflow:hidden; }
  .header { background:#1a2e1a; color:#f5f0e6; padding:16px 24px; display:flex; justify-content:space-between; align-items:center; }
  .header h1 { margin:0; font-size:22px; letter-spacing:1px; }
  .header .inv-num { font-size:13px; opacity:0.85; }
  .body { padding:16px 24px; }
  .meta { display:flex; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:12px; }
  .meta.meta-address-row { margin-bottom:18px; }
  .meta-block { flex: 1 1 220px; }
  .meta-block h3 { margin:0 0 6px; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#8b7e6a; }
  .meta-block p { margin:2px 0; font-size:13px; }
  table { width:100%; border-collapse:collapse; margin-bottom:18px; font-size:13px; }
  thead { background:#f5f0e6; }
  th { padding:8px 10px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:#1a2e1a; border-bottom:2px solid #c2a25d; }
  .totals { width:280px; margin-left:auto; font-size:13px; }
  .totals tr td { padding:4px 10px; }
  .totals .grand { font-size:16px; font-weight:bold; color:#1a2e1a; border-top:2px solid #c2a25d; }
  .footer { text-align:center; padding:12px 14px; font-size:11px; color:#8b7e6a; border-top:1px solid #e0ddd5; }
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
          <h3>Payment</h3>
          <p>${order.paymentMethod || 'Razorpay'}</p>
          <p><span class="badge ${order.isPaid ? 'badge-paid' : 'badge-pending'}">${order.isPaid ? 'PAID' : 'PENDING'}</span></p>
        </div>
      </div>
      <div class="meta meta-address-row">
        <div class="meta-block">
          <h3>Ship To</h3>
          <p>${customerAddress}</p>
        </div>
        <div class="meta-block">
          <h3>From</h3>
          ${PDF_SELLER_FROM_HTML}
        </div>
      </div>
      <table>
        <thead><tr>
          <th>#</th><th>Item</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Price</th><th style="text-align:right;">Total</th>
        </tr></thead>
        <tbody>${itemRows || '<tr><td colspan="5" style="padding:10px;text-align:center;color:#8b7e6a;">No items</td></tr>'}</tbody>
      </table>
      <table class="totals">
        ${pricing.tax ? `<tr><td>GST (18%)</td><td style="text-align:right;">₹${pricing.tax}</td></tr>` : ''}
        <tr><td>Shipping</td><td style="text-align:right;">${pricing.shipping === 0 ? 'FREE' : '₹' + pricing.shipping}</td></tr>
        <tr class="grand"><td>Grand Total</td><td style="text-align:right;">₹${pricing.grandTotal}</td></tr>
      </table>
    </div>
    <div class="footer">
      Thank you for shopping with Svayam Natural! · support@svayam-natural.com
    </div>
  </div>
</body></html>`;

    const pdfBuffer = await renderHtmlToPdf(html, invoicePdfOptions());
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${order._id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("downloadInvoice error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download Bulk Shipping Invoices (read-only)
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
  const touchedInventory = [];
  let orderPersisted = false;

  try {
    const { items, shippingAddress } = req.body;
    const idempotencyKey = getIdempotencyKey(req);

    const itemsValidationError = validateOrderItemsPayload(items);
    if (itemsValidationError) {
      return res.status(400).json({ message: itemsValidationError });
    }

    const shippingValidationError = validateShippingAddress(shippingAddress);
    if (shippingValidationError) {
      return res.status(400).json({ message: shippingValidationError });
    }

    if (!idempotencyKey) {
      return res.status(400).json({
        message: 'Missing idempotency key. Please retry checkout from the latest page.',
      });
    }

    const duplicateOrder = await Order.exists({ idempotencyKey });
    if (duplicateOrder) {
      return sendDuplicateOrderResponse(res, idempotencyKey);
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
      touchedInventory.push({ productId: product._id, qty });

      orderItems.push({
        name: product.title,
        qty,
        image: product.images[0] || '/images/All-Products.jpeg',
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

    const tax = 0;
    const shipping = calculateShipping(subtotal);
    const finalTotal = subtotal + shipping;

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
      lifecycleStatus: ORDER_STATES.PENDING,
      idempotencyKey,
      paymentStatus: {
        razorpayOrderId: razorpayOrder.id,
        status: 'Pending'
      }
    });

    const createdOrder = await order.save();
    orderPersisted = true;

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
    if (!orderPersisted && touchedInventory.length > 0) {
      await Promise.all(
        touchedInventory.map(({ productId, qty }) =>
          Product.updateOne({ _id: productId }, { $inc: { inventory: qty } })
        )
      );
    }

    if (error?.code === 11000 && error?.keyPattern?.idempotencyKey) {
      const idempotencyKey = getIdempotencyKey(req);
      return sendDuplicateOrderResponse(res, idempotencyKey);
    }

    console.error("createGuestOrder error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify guest payment
// @route   POST /api/v1/orders/guest/verify-payment
// @access  Public
export const verifyGuestPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      guestEmail,
    } = req.body;

    if (!guestEmail) {
      return res.status(400).json({ message: 'Guest email is required for payment verification' });
    }

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: 'Missing payment verification fields' });
    }

    const sign = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpaySignature !== expectedSign) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const order = await Order.findOne({ "paymentStatus.razorpayOrderId": razorpayOrderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.isPaid && order.paymentStatus?.razorpayPaymentId === razorpayPaymentId) {
      return res.status(200).json({ success: true, message: 'Payment already verified' });
    }

    if (order.isPaid && order.paymentStatus?.razorpayPaymentId && order.paymentStatus.razorpayPaymentId !== razorpayPaymentId) {
      return res.status(409).json({ message: 'Order is already paid with a different payment reference' });
    }

    const normalizedOrderEmail = (order.shippingAddress?.email || '').trim().toLowerCase();
    const normalizedGuestEmail = guestEmail.trim().toLowerCase();

    if (!normalizedOrderEmail || normalizedOrderEmail !== normalizedGuestEmail) {
      return res.status(403).json({ message: 'Guest email does not match this order' });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const payment = await instance.payments.fetch(razorpayPaymentId);

    if (payment.amount !== Math.round(order.totalAmount * 100)) {
      return res.status(400).json({ message: "Payment amount does not match order amount" });
    }

    await assertPaymentReferenceUniqueness(order._id, razorpayPaymentId);

    transitionOrder(order, ORDER_STATES.PAID, {
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    await ensureShiprocketOrder(order, 'verifyGuestPayment');
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
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
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
    if (!req.rawBody || !signature) {
      return res.status(400).json({ success: false, message: 'Missing webhook signature or raw payload' });
    }
    
    // Validate signature using raw body
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(req.rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const { event, payload } = req.body;

    if (event === 'payment.captured') {
      const payment = payload?.payment?.entity;
      if (!payment?.order_id || !payment?.id) {
        return res.status(400).json({ success: false, message: 'Invalid payment payload' });
      }

      const razorpayOrderId = payment.order_id;
      const order = await Order.findOne({ "paymentStatus.razorpayOrderId": razorpayOrderId });

      if (!order) {
        return res.status(200).json({ success: true });
      }

      if (order.isPaid && order.paymentStatus?.razorpayPaymentId === payment.id) {
        return res.status(200).json({ success: true, message: 'Webhook already processed' });
      }

      if (payment.amount !== Math.round(order.totalAmount * 100)) {
        return res.status(400).json({ success: false, message: 'Webhook amount mismatch' });
      }

      await assertPaymentReferenceUniqueness(order._id, payment.id);

      if (!order.isPaid) {
        transitionOrder(order, ORDER_STATES.PAID, {
          paymentId: payment.id,
          signature: 'webhook_verified',
        });
        await ensureShiprocketOrder(order, 'verifyWebhook');
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
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Native Bulk Print: PDF Invoices (HTML → PDF)
export const generateBulkInvoicesHTML = async (req, res) => {
  try {
    const { orderIds } = req.body;
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).send('No orders selected');
    }

    const orders = await Order.find({ _id: { $in: orderIds } }).populate('user', 'name email firstName lastName').lean();

    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

    let combinedHtml = `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      ${PDF_WEB_FONT_LINKS}
      <title>Bulk Invoices</title>
      <style>
        body { font-family: 'Noto Sans', 'Helvetica Neue', Helvetica, 'DejaVu Sans', Arial, sans-serif; color: #333; line-height: 1.55; }
        .invoice-page { padding: 22px 24px; max-width: 800px; margin: 0 auto; box-sizing: border-box; }
        .addr-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 22px; }
        .addr-col { flex: 1 1 240px; }
        .addr-col h3 { margin: 0 0 8px; border-bottom: 2px solid #e5e5e5; padding-bottom: 4px; font-size: 14px; }
        @media print {
          .page-break { page-break-after: always; clear: both; }
          body { background: #fff; margin: 0; padding: 0; }
          .no-print { display: none !important; }
        }
        table { width: 100%; border-collapse: collapse; margin-top: 14px; }
        th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #e5e5e5; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .print-bar { text-align: center; padding: 14px; background: #f5f0e6; border-bottom: 1px solid #e0ddd5; }
        .print-bar button { padding: 10px 24px; background: #1a2e1a; color: #f5f0e6; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
      </style>
    </head>
    <body>
    <div class="print-bar no-print"><button type="button" onclick="window.print()">Print / Save as PDF</button></div>`;

    orders.forEach((order, index) => {
      const pricing = computePricing(order);
      const itemsHtml = (order.orderItems || []).map((item, i) => {
        const qty = item.qty || item.quantity || 1;
        return `<tr>
          <td>${i + 1}</td>
          <td>${item.name}</td>
          <td style="text-align:center;">${qty}</td>
          <td style="text-align:right;">₹${item.price}</td>
          <td style="text-align:right;">₹${item.price * qty}</td>
        </tr>`;
      }).join('');

      const addr = order.shippingAddress || {};
      let customerName = 'Guest';
      if (order.user && typeof order.user === 'object') {
        const u = order.user;
        customerName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name || 'Guest';
      }
      const shipToName = addr.fullName || customerName;
      const addrLine = addr.address || '';
      const cityLine = [addr.city, addr.state, addr.pincode].filter(Boolean).join(', ');
      const payLabel = order.isPaid ? 'Paid' : (order.paymentStatus?.status || 'Pending');
      const shortRef = order._id ? String(order._id).slice(-10).toUpperCase() : '';

      combinedHtml += `
      <div class="invoice-page">
        <div style="display:flex; justify-content:space-between; margin-bottom:22px;">
          <div>
            <h1 style="margin:0;color:#2c5e50;">Svayam Natural</h1>
            <p style="margin:5px 0 0;color:#666;">Invoice #${shortRef}</p>
          </div>
          <div style="text-align:right;">
            <p style="margin:0">Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p style="margin:0">Payment: ${payLabel}</p>
            ${order.awbCode ? `<p style="margin:0"><strong>AWB: ${order.awbCode}</strong></p>` : ''}
          </div>
        </div>
        
        <div class="addr-row">
          <div class="addr-col">
            <h3>Bill To / Ship To</h3>
            <p style="margin:0;"><strong>${shipToName}</strong></p>
            ${addr.email ? `<p style="margin:0;">${addr.email}</p>` : ''}
            ${addrLine ? `<p style="margin:0;">${addrLine}</p>` : ''}
            ${cityLine ? `<p style="margin:0;">${cityLine}</p>` : ''}
            <p style="margin:0;">Phone: ${addr.phone || ''}</p>
          </div>
          <div class="addr-col">
            <h3>From</h3>
            ${PDF_SELLER_FROM_HTML}
          </div>
        </div>

        <table>
          <thead><tr><th>#</th><th>Item Name</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Price</th><th style="text-align:right;">Total</th></tr></thead>
          <tbody>${itemsHtml || '<tr><td colspan="5">No items found</td></tr>'}</tbody>
        </table>

        <div style="margin-top:14px; width:300px; float:right;">
          <table style="margin-top:0;">
            <tr><td>Shipping</td><td style="text-align:right;">${pricing.shipping === 0 ? 'FREE' : '₹' + pricing.shipping}</td></tr>
            <tr style="font-weight:bold; font-size:18px;"><td>Grand Total</td><td style="text-align:right;">₹${pricing.grandTotal ?? order.totalAmount}</td></tr>
          </table>
        </div>
        <div style="clear:both;"></div>
      </div>`;

      if (index < orders.length - 1) {
        combinedHtml += `<div class="page-break"></div>`;
      }
    });

    combinedHtml += `</body></html>`;

    const pdfBuffer = await renderHtmlToPdf(combinedHtml, invoicePdfOptions());
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="svayam-invoices-${stamp}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Bulk invoice generation error:', error);
    res.status(500).send('Error generating bulk invoices: ' + error.message);
  }
};

// Native Bulk Print: PDF Shipping Labels (HTML → PDF)
export const generateBulkLabelsHTML = async (req, res) => {
  try {
    const { orderIds } = req.body;
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).send('No orders selected');
    }

    const orders = await Order.find({ _id: { $in: orderIds } }).lean();
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

    let combinedHtml = `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      ${PDF_WEB_FONT_LINKS}
      <title>Bulk Shipping Labels</title>
      <style>
        body { font-family: 'Noto Sans', 'Helvetica Neue', Helvetica, 'DejaVu Sans', Arial, sans-serif; color: #000; margin: 0; padding: 20px; background: #eaebec; }
        .label-page { 
          width: 4in; height: 6in; 
          background: #fff; margin: 0 auto 20px auto; padding: 20px; 
          box-sizing: border-box; border: 1px solid #ccc;
          page-break-inside: avoid;
        }
        @media print {
          .page-break { page-break-after: always; clear: both; }
          body { background: transparent; padding: 0; margin: 0; }
          .label-page { border: none; margin: 0; padding: 15px; width: 4in; height: 6in; box-shadow: none; }
          @page { size: 4in 6in; margin: 0; }
          .no-print { display: none !important; }
        }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
        .addresses { display: flex; flex-direction: column; gap: 15px; margin-bottom: 15px; }
        .to-address { border: 2px solid #000; padding: 12px; font-size: 1.1em; }
        .from-address { font-size: 0.9em; }
        .meta { border-top: 1px solid #000; padding-top: 8px; font-size: 0.85em; }
        .print-bar { text-align: center; padding: 16px; margin-bottom: 16px; }
        .print-bar button { padding: 10px 24px; background: #1a2e1a; color: #f5f0e6; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
      </style>
    </head>
    <body>
    <div class="print-bar no-print"><button type="button" onclick="window.print()">Print / Save as PDF</button></div>`;

    orders.forEach((order, index) => {
      const address = order.shippingAddress || {};
      const date = new Date(order.createdAt).toLocaleDateString();
      const shortRef = order._id ? String(order._id).slice(-10).toUpperCase() : '';
      const cityLine = [address.city, address.state, address.pincode].filter(Boolean).join(', ');
      const itemCount = (order.orderItems || []).reduce((s, it) => s + (it.qty || it.quantity || 1), 0);
      const trackingDetails = order.awbCode ? `<div style="margin-top: 10px; padding: 10px; border: 2px dashed #000; text-align: center;"><strong>AWB: ${order.awbCode}</strong><br>Courier: ${order.courierName || 'Shiprocket'}</div>` : '';

      combinedHtml += `
      <div class="label-page">
        <div class="header">
          <h2 style="margin:0; font-size: 22px; text-transform: uppercase; letter-spacing: 2px;">PREPAID</h2>
          <p style="margin:4px 0 0; font-weight: bold;">ORDER #: ${shortRef}</p>
        </div>
        
        <div class="addresses">
          <div class="to-address">
            <strong style="font-size:0.9em; color:#555;">SHIP TO:</strong><br>
            <span style="font-size:1.15em; font-weight:bold;">${address.fullName || 'Guest'}</span><br>
            ${address.address ? `${address.address}<br>` : ''}
            ${cityLine ? `${cityLine}<br>` : ''}
            <br>
            <strong>Phone:</strong> ${address.phone || ''}
            ${trackingDetails}
          </div>
          
          <div class="from-address">
            <strong style="color:#555;">FROM:</strong><br>
            ${PDF_SELLER_FROM_LABEL_HTML}
            ${PDF_LABEL_RETURN_NOTE}
          </div>
        </div>

        <div class="meta">
          <strong>Items:</strong> ${itemCount || 0} units<br>
          <strong>Date:</strong> ${date}
        </div>
      </div>`;

      if (index < orders.length - 1) {
        combinedHtml += `<div class="page-break"></div>`;
      }
    });

    combinedHtml += `</body></html>`;

    const pdfBuffer = await renderHtmlToPdf(combinedHtml, shippingLabelsPdfOptions());
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="svayam-shipping-labels-${stamp}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Bulk labels generation error:', error);
    res.status(500).send('Error generating bulk labels: ' + error.message);
  }
};

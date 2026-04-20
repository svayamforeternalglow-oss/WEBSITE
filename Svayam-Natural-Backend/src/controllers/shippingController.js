import mongoose from 'mongoose';
import Order from '../models/Order.js';
import shiprocket from '../services/shiprocketService.js';
import { getOrderState, ORDER_STATES, transitionOrder } from '../services/orderStateMachine.js';

// @desc    Track order
// @route   GET /api/v1/shipping/track/:orderId
// @access  Public
export const trackOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user) {
      const authenticatedUser = req.user;
      if (!authenticatedUser) {
        return res.status(401).json({ success: false, message: 'Please login to track this order' });
      }

      const isOwner = order.user.toString() === authenticatedUser._id.toString();
      const isAdmin = authenticatedUser.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
      }
    } else {
      const providedEmail = (req.query.email || '').trim().toLowerCase();
      const orderEmail = (order.shippingAddress?.email || '').trim().toLowerCase();

      if (!providedEmail) {
        return res.status(400).json({ success: false, message: 'Email is required for guest tracking' });
      }

      if (!orderEmail || providedEmail !== orderEmail) {
        return res.status(403).json({ success: false, message: 'Order ID and email do not match' });
      }
    }

    // If we have an AWB code, try to get live tracking from Shiprocket
    let liveTracking = null;
    if (order.awbCode && shiprocket.isEnabled) {
      try {
        liveTracking = await shiprocket.trackShipment(order.awbCode);
      } catch (err) {
        console.error('Shiprocket tracking error:', err.message);
      }
    }

    // Build timeline based on status dates
    const timeline = [
      {
        status: 'pending',
        message: 'Order placed successfully',
        timestamp: order.createdAt
      }
    ];

    if (order.isPaid || order.paymentStatus?.status === 'Completed') {
      timeline.push({
        status: 'confirmed',
        message: 'Payment confirmed. Order is being processed.',
        timestamp: order.paidAt || order.createdAt
      });
    }

    if (order.trackingStatus === 'Shipped' || order.shippedAt) {
      timeline.push({
        status: 'shipped',
        message: 'Order has been shipped.',
        timestamp: order.shippedAt || new Date()
      });
    }

    if (order.trackingStatus === 'Delivered' || order.deliveredAt) {
      timeline.push({
        status: 'delivered',
        message: 'Order has been delivered successfully.',
        timestamp: order.deliveredAt || new Date()
      });
    }

    const responseData = {
      order: {
        orderId: order._id.toString(),
        status: getOrderState(order).toLowerCase(),
        tracking: {
          carrier: order.courierName || 'Standard Delivery',
          trackingNumber: order.awbCode || order.trackingNumber || '',
          trackingUrl: order.awbCode ? `https://shiprocket.co/tracking/${order.awbCode}` : '',
          estimatedDelivery: order.estimatedDelivery 
            ? new Date(order.estimatedDelivery).toISOString()
            : order.shippedAt 
              ? new Date(order.shippedAt.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString() 
              : null,
          liveTracking: liveTracking?.tracking_data || null,
        },
        timeline,
        items: order.orderItems.map(item => ({
          name: item.name,
          quantity: item.qty,
          price: item.price
        })),
        shippingAddress: {
          firstName: order.shippingAddress.fullName || 'Customer',
          lastName: '',
          city: order.shippingAddress.city || '',
          state: order.shippingAddress.state || '',
          pincode: order.shippingAddress.pincode || ''
        }
      }
    };

    res.json({ success: true, data: responseData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create shipment for order (uses Shiprocket when enabled)
// @route   POST /api/v1/shipping/create/:orderId
// @access  Private/Admin
export const createShipment = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!order.isPaid && order.paymentStatus?.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Cannot create shipment for unpaid order' });
    }

    const currentState = getOrderState(order);
    console.info('[Shipping] createShipment requested', {
      orderId: order._id.toString(),
      currentState,
      isPaid: order.isPaid,
      paymentStatus: order.paymentStatus?.status || 'Unknown',
      shiprocketEnabled: shiprocket.isEnabled,
    });

    if (currentState === ORDER_STATES.SHIPPED || currentState === ORDER_STATES.DELIVERED) {
      return res.status(400).json({ success: false, message: 'Shipment already created for this order' });
    }

    if (currentState === ORDER_STATES.PAID) {
      transitionOrder(order, ORDER_STATES.PROCESSING);
    }

    if (getOrderState(order) !== ORDER_STATES.PROCESSING) {
      return res.status(400).json({
        success: false,
        message: 'Order must be in Processing state before shipment creation',
      });
    }

    // Create Shiprocket order (or mock)
    const srResult = await shiprocket.createOrder(order);
    
    // Store Shiprocket IDs
    order.shiprocketOrderId = srResult.order_id?.toString() || '';
    order.shiprocketShipmentId = srResult.shipment_id?.toString() || '';
    console.info('[Shipping] Shiprocket order created', {
      orderId: order._id.toString(),
      shiprocketOrderId: order.shiprocketOrderId || null,
      shiprocketShipmentId: order.shiprocketShipmentId || null,
    });

    // Generate AWB (assign courier)
    let awbResult = null;
    if (srResult.shipment_id) {
      try {
        awbResult = await shiprocket.generateAWB(srResult.shipment_id);
        const awbData = awbResult?.response?.data;
        if (awbData?.awb_code) {
          order.awbCode = awbData.awb_code;
          order.courierName = awbData.courier_name || 'Courier';
        } else {
          return res.status(502).json({
            success: false,
            message: 'AWB generation failed. Keep order in Processing and retry shipment.',
          });
        }
      } catch (err) {
        console.error('[Shipping] AWB generation error', {
          orderId: order._id.toString(),
          shiprocketShipmentId: order.shiprocketShipmentId || null,
          statusCode: err.statusCode || null,
          code: err.code || null,
          message: err.message,
        });
        return res.status(502).json({
          success: false,
          message: `AWB generation failed: ${err.message}. Keep order in Processing and retry shipment.`,
        });
      }
    }

    if (!order.awbCode) {
      console.error('[Shipping] AWB missing after Shiprocket assignment', {
        orderId: order._id.toString(),
        shiprocketShipmentId: order.shiprocketShipmentId || null,
      });
      return res.status(502).json({
        success: false,
        message: 'Shipment is not ready yet. AWB missing.',
      });
    }

    // Auto-generate label and invoice documents (non-blocking for shipment state).
    if (!order.labelUrl) {
      try {
        const labelResult = await shiprocket.generateLabel(order.shiprocketShipmentId);
        const labelUrl = shiprocket.extractDocumentUrl(labelResult, ['label_url']);
        if (labelUrl) {
          order.labelUrl = labelUrl;
        }
      } catch (labelErr) {
        console.error('[Shipping] Label generation error', {
          orderId: order._id.toString(),
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
        console.error('[Shipping] Invoice generation error', {
          orderId: order._id.toString(),
          shiprocketOrderId: order.shiprocketOrderId || null,
          statusCode: invoiceErr.statusCode || null,
          code: invoiceErr.code || null,
          message: invoiceErr.message,
        });
      }
    }

    transitionOrder(order, ORDER_STATES.SHIPPED);
    order.trackingNumber = order.awbCode;

    await order.save();
    console.info('[Shipping] Shipment created successfully', {
      orderId: order._id.toString(),
      shiprocketOrderId: order.shiprocketOrderId || null,
      shiprocketShipmentId: order.shiprocketShipmentId || null,
      awbCode: order.awbCode || null,
    });

    // Send shipping email
    try {
      const User = (await import('../models/User.js')).default;
      const emailService = await import('../services/emailService.js');
      
      let emailToSend = '';
      if (order.user) {
        const user = await User.findById(order.user);
        if (user && user.email) emailToSend = user.email;
      } else if (order.shippingAddress && order.shippingAddress.email) {
        emailToSend = order.shippingAddress.email;
      }

      if (emailToSend) {
        await emailService.sendShippingUpdateEmail(emailToSend, order);
      }
    } catch(err) {
      console.error("Email error: ", err);
    }

    res.json({ 
      success: true, 
      message: 'Shipment created successfully', 
      data: {
        order,
        shiprocket: {
          orderId: order.shiprocketOrderId,
          shipmentId: order.shiprocketShipmentId,
          awbCode: order.awbCode,
          courierName: order.courierName,
          labelUrl: order.labelUrl || '',
          invoiceUrl: order.shiprocketInvoiceUrl || '',
        }
      }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// @desc    Get shipping label for order
// @route   GET /api/v1/shipping/label/:orderId
// @access  Private/Admin
export const getShippingLabel = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!order.shiprocketShipmentId) {
      return res.status(400).json({ success: false, message: 'No shipment found. Create shipment first.' });
    }

    // If we already have a label URL, return it
    if (order.labelUrl) {
      return res.json({ success: true, data: { labelUrl: order.labelUrl } });
    }

    const result = await shiprocket.generateLabel(order.shiprocketShipmentId);
    const labelUrl = shiprocket.extractDocumentUrl(result, ['label_url']);
    
    if (labelUrl) {
      order.labelUrl = labelUrl;
      await order.save();
    }

    res.json({ success: true, data: { labelUrl } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get shipping invoice for order
// @route   GET /api/v1/shipping/invoice/:orderId
// @access  Private/Admin
export const getShippingInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!order.shiprocketOrderId) {
      return res.status(400).json({ success: false, message: 'No Shiprocket order found. Create shipment first.' });
    }

    if (order.shiprocketInvoiceUrl) {
      return res.json({ success: true, data: { invoiceUrl: order.shiprocketInvoiceUrl } });
    }

    const result = await shiprocket.generateInvoice(order.shiprocketOrderId);
    const invoiceUrl = shiprocket.extractDocumentUrl(result, ['invoice_url']);

    if (invoiceUrl) {
      order.shiprocketInvoiceUrl = invoiceUrl;
      await order.save();
    }

    res.json({ success: true, data: { invoiceUrl } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate manifest for multiple shipments
// @route   POST /api/v1/shipping/manifest
// @access  Private/Admin
export const generateManifest = async (req, res) => {
  try {
    const { shipmentIds } = req.body;
    if (!shipmentIds || shipmentIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No shipment IDs provided' });
    }

    const result = await shiprocket.generateManifest(shipmentIds);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

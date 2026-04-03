import Order from '../models/Order.js';
import shiprocket from '../services/shiprocketService.js';

// @desc    Track order
// @route   GET /api/v1/shipping/track/:orderId
// @access  Public
export const trackOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    
    let order;
    if (orderId.length === 24) {
      order = await Order.findById(orderId);
    } else {
      const orders = await Order.find({});
      order = orders.find(o => o._id.toString().endsWith(orderId));
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
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
        status: order.trackingStatus ? order.trackingStatus.toLowerCase() : 'pending',
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

    // Create Shiprocket order (or mock)
    const srResult = await shiprocket.createOrder(order);
    
    // Store Shiprocket IDs
    order.shiprocketOrderId = srResult.order_id?.toString() || '';
    order.shiprocketShipmentId = srResult.shipment_id?.toString() || '';

    // Generate AWB (assign courier)
    let awbResult = null;
    if (srResult.shipment_id) {
      try {
        awbResult = await shiprocket.generateAWB(srResult.shipment_id);
        const awbData = awbResult?.response?.data;
        if (awbData) {
          order.awbCode = awbData.awb_code || '';
          order.courierName = awbData.courier_name || 'Courier';
        }
      } catch (err) {
        console.error('AWB generation error:', err.message);
        // Fallback to mock AWB
        order.awbCode = `AWB-${Math.floor(Math.random() * 1000000000)}`;
        order.courierName = 'Standard Delivery';
      }
    }

    // If no AWB was set, use mock
    if (!order.awbCode) {
      order.awbCode = `AWB-${Math.floor(Math.random() * 1000000000)}`;
      order.courierName = 'Standard Delivery';
    }

    order.trackingStatus = 'Shipped';
    order.trackingNumber = order.awbCode;
    order.shippedAt = Date.now();

    await order.save();

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
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    const labelUrl = result?.label_url || '';
    
    if (labelUrl) {
      order.labelUrl = labelUrl;
      await order.save();
    }

    res.json({ success: true, data: { labelUrl } });
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

import Order from '../models/Order.js';

// @desc    Track order
// @route   GET /api/v1/shipping/track/:orderId
// @access  Public
export const trackOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    
    // Support searching by MongoDB _id or checking if the client sent the last 10 chars
    let order;
    if (orderId.length === 24) {
      order = await Order.findById(orderId);
    } else {
      // Very simple way to search by partial ID if necessary, but usually the frontend should send full ID
      const orders = await Order.find({});
      order = orders.find(o => o._id.toString().endsWith(orderId));
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
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

    // Map to frontend expectation
    const responseData = {
      order: {
        orderId: order._id.toString(),
        status: order.trackingStatus ? order.trackingStatus.toLowerCase() : 'pending',
        tracking: {
          carrier: 'Standard Delivery',
          trackingNumber: order.trackingNumber || '',
          trackingUrl: '',
          estimatedDelivery: order.estimatedDelivery 
            ? new Date(order.estimatedDelivery).toISOString()
            : order.shippedAt 
              ? new Date(order.shippedAt.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString() 
              : null
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

// @desc    Create shipment for order
// @route   POST /api/v1/shipping/create/:orderId
// @access  Private/Admin
export const createShipment = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Mock shipment creation
    order.trackingStatus = 'Shipped';
    order.shippedAt = Date.now();
    order.trackingNumber = `AWB-${Math.floor(Math.random() * 1000000000)}`;

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

    res.json({ success: true, message: 'Shipment created successfully', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

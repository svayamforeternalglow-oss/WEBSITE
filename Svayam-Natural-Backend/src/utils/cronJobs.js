import cron from 'node-cron';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { transitionOrder, ORDER_STATES, CANCELLATION_REASONS } from '../services/orderStateMachine.js';
import { ensureShiprocketOrder } from '../services/shiprocketAutomation.js';

const startCronJobs = () => {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      // Find orders that are pending and older than 30 minutes
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      const unpaidOrders = await Order.find({
        isPaid: false,
        'paymentStatus.status': 'Pending',
        createdAt: { $lt: thirtyMinutesAgo }
      });

      if (unpaidOrders.length > 0) {
        console.log(`[Cron] Found ${unpaidOrders.length} unpaid orders to cancel.`);
        
        for (const order of unpaidOrders) {
          // Cancel timed-out orders through the transition machine.
          transitionOrder(order, ORDER_STATES.CANCELLED, {
            reason: CANCELLATION_REASONS.TIMEOUT,
          });
          await order.save();

          // Restore inventory
          for (const item of order.orderItems) {
            if (item.product) {
              const qty = item.qty || item.quantity || 1;
              await Product.updateOne(
                { _id: item.product },
                { $inc: { inventory: qty } }
              );
            }
          }
          console.log(`[Cron] Cancelled order ${order._id} and restored stock.`);
        }
      }
    } catch (error) {
      console.error('[Cron] Error running unpaid order cleanup:', error);
    }
  });

  // Run every 30 minutes for paid orders missing Shiprocket IDs
  cron.schedule('*/30 * * * *', async () => {
    if (process.env.SHIPROCKET_ENABLED !== 'true') {
      return;
    }

    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const pendingShiprocket = await Order.find({
        isPaid: true,
        createdAt: { $gte: sevenDaysAgo },
        $or: [
          { shiprocketOrderId: { $exists: false } },
          { shiprocketOrderId: '' },
          { shiprocketShipmentId: { $exists: false } },
          { shiprocketShipmentId: '' },
        ],
      }).limit(25);

      if (pendingShiprocket.length === 0) {
        return;
      }

      console.log(`[Cron] Found ${pendingShiprocket.length} paid orders missing Shiprocket IDs.`);

      for (const order of pendingShiprocket) {
        const result = await ensureShiprocketOrder(order, 'cron');
        if (result?.created) {
          await order.save();
          console.log(`[Cron] Shiprocket order created for ${order._id}`);
        }
      }
    } catch (error) {
      console.error('[Cron] Shiprocket order sync failed:', error);
    }
  });

  console.log('Cron jobs initialized');
};

export default startCronJobs;

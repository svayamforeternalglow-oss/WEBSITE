import cron from 'node-cron';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { transitionOrder, ORDER_STATES, CANCELLATION_REASONS } from '../services/orderStateMachine.js';

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

  console.log('Cron jobs initialized');
};

export default startCronJobs;

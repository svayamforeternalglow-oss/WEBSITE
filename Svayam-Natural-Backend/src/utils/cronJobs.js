import cron from 'node-cron';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { transitionOrder, ORDER_STATES, CANCELLATION_REASONS } from '../services/orderStateMachine.js';
import { ensureShiprocketOrder } from '../services/shiprocketAutomation.js';
import { paidMissingShiprocketMatch } from './adminMetrics.js';

const startCronJobs = () => {
  cron.schedule('*/15 * * * *', async () => {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

      const unpaidOrders = await Order.find({
        isPaid: false,
        'paymentStatus.status': 'Pending',
        createdAt: { $lt: thirtyMinutesAgo },
      });

      if (unpaidOrders.length > 0) {
        console.log(`[Cron] Found ${unpaidOrders.length} unpaid orders to cancel.`);

        for (const order of unpaidOrders) {
          transitionOrder(order, ORDER_STATES.CANCELLED, {
            reason: CANCELLATION_REASONS.TIMEOUT,
          });
          await order.save();

          for (const item of order.orderItems) {
            if (item.product) {
              const qty = item.qty || item.quantity || 1;
              await Product.updateOne({ _id: item.product }, { $inc: { inventory: qty } });
            }
          }
          console.log(`[Cron] Cancelled order ${order._id} and restored stock.`);
        }
      }
    } catch (error) {
      console.error('[Cron] Error running unpaid order cleanup:', error);
    }
  });

  cron.schedule('*/30 * * * *', async () => {
    if (process.env.SHIPROCKET_ENABLED !== 'true') {
      return;
    }

    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const pendingShiprocket = await Order.find(paidMissingShiprocketMatch(sevenDaysAgo)).limit(25);

      if (pendingShiprocket.length === 0) {
        return;
      }

      console.log(`[Cron] Found ${pendingShiprocket.length} paid orders missing Shiprocket IDs.`);

      for (const order of pendingShiprocket) {
        const result = await ensureShiprocketOrder(order, 'cron');
        if (result?.created || result?.error || result?.skipped) {
          await order.save();
        }
        if (result?.created) {
          console.log(`[Cron] Shiprocket order created for ${order._id}`);
        } else if (result?.error) {
          console.warn(`[Cron] Shiprocket sync failed for ${order._id}: ${result.message}`);
        }
      }
    } catch (error) {
      console.error('[Cron] Shiprocket order sync failed:', error);
    }
  });

  console.log('Cron jobs initialized');
};

export default startCronJobs;

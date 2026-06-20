import cron from 'node-cron';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import { transitionOrder, ORDER_STATES, CANCELLATION_REASONS } from '../services/orderStateMachine.js';
import { ensureShiprocketOrder } from '../services/shiprocketAutomation.js';
import { paidMissingShiprocketMatch } from './adminMetrics.js';
import { generateCartDiscountCode } from './discountCodeGenerator.js';
import { getEmailsForRetry, cleanupOldAbandonedCarts } from '../services/emailQueueService.js';

const startCronJobs = () => {
  const abandonedCartHoursRaw = Number(process.env.ABANDONED_CART_HOURS);
  const abandonedCartHours = Number.isFinite(abandonedCartHoursRaw)
    ? abandonedCartHoursRaw
    : 6;

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

  // Abandoned cart email job (runs every 30 minutes)
  cron.schedule('*/30 * * * *', async () => {
    try {
      const cutoff = new Date(Date.now() - abandonedCartHours * 60 * 60 * 1000);
      
      // Find users with abandoned carts
      const candidates = await User.find({
        'savedCart.items.0': { $exists: true },
        'savedCart.updatedAt': { $lte: cutoff },
        $or: [
          { abandonedCartEmailSentAt: { $exists: false } },
          { abandonedCartEmailSentAt: null },
        ],
      }).limit(50);

      if (candidates.length === 0) {
        return;
      }

      const emailService = await import('../services/emailService.js');

      console.log(`[Cron] Found ${candidates.length} users with abandoned carts`);

      for (const user of candidates) {
        if (!user.email || !user.savedCart?.items?.length) {
          continue;
        }

        try {
          // Generate discount code for abandoned cart recovery
          const discountCode = generateCartDiscountCode({
            items: user.savedCart.items,
            subtotal: user.savedCart.items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
            abandonedAt: user.savedCart.updatedAt,
          });

          // Send email with discount offer
          await emailService.sendAbandonedCartEmail(
            user.email,
            user.savedCart,
            user.name,
            discountCode
          );

          user.abandonedCartEmailSentAt = new Date();
          await user.save();

          console.log(`[Cron] Abandoned cart email sent to ${user.email} with discount ${discountCode.code}`);
        } catch (error) {
          console.error(`[Cron] Abandoned cart email failed for ${user.email}:`, error.message || error);
        }
      }
    } catch (error) {
      console.error('[Cron] Abandoned cart job failed:', error);
    }
  });

  // Email retry job (runs every 15 minutes)
  cron.schedule('*/15 * * * *', async () => {
    try {
      const failedEmails = await getEmailsForRetry();
      
      if (failedEmails.length === 0) {
        return;
      }

      const emailService = await import('../services/emailService.js');

      console.log(`[Cron] Found ${failedEmails.length} failed emails to retry`);

      for (const cart of failedEmails) {
        try {
          if (cart.email && cart.items?.length) {
            const discountCode = cart.discountCode ? {
              code: cart.discountCode,
              percentage: cart.discountPercentage || 5,
            } : null;

            await emailService.sendAbandonedCartEmail(
              cart.email,
              cart,
              cart.user ? (await User.findById(cart.user))?.name : null,
              discountCode
            );

            console.log(`[Cron] Retried abandoned cart email for ${cart.email}`);
          }
        } catch (error) {
          console.error(`[Cron] Email retry failed for ${cart.email}:`, error.message);
        }
      }
    } catch (error) {
      console.error('[Cron] Email retry job failed:', error);
    }
  });

  // Cleanup old abandoned carts (runs once per day at 2 AM)
  cron.schedule('0 2 * * *', async () => {
    try {
      const cleanedCount = await cleanupOldAbandonedCarts();
      console.log(`[Cron] Cleanup completed. Removed ${cleanedCount} old abandoned carts.`);
    } catch (error) {
      console.error('[Cron] Cleanup job failed:', error);
    }
  });

  console.log('Cron jobs initialized');
};

export default startCronJobs;

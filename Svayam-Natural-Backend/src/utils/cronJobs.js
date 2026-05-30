import cron from 'node-cron';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import AbandonedCart from '../models/AbandonedCart.js';
import { transitionOrder, ORDER_STATES, CANCELLATION_REASONS } from '../services/orderStateMachine.js';
import { ensureShiprocketOrder } from '../services/shiprocketAutomation.js';
import { sendAbandonedCartEmail } from '../services/emailService.js';
import { paidMissingShiprocketMatch } from './adminMetrics.js';

const startCronJobs = () => {
  const cartToken = () => crypto.randomBytes(24).toString('hex');
  const frontendBaseUrl = (process.env.FRONTEND_URL || 'https://www.svayamnatural.com').replace(/\/$/, '');
  const firstEmailDelayMinutes = Number(process.env.ABANDONED_CART_FIRST_EMAIL_MINUTES || 60);
  const secondEmailDelayMinutes = Number(process.env.ABANDONED_CART_SECOND_EMAIL_MINUTES || 0);

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

  cron.schedule('*/15 * * * *', async () => {
    if (!firstEmailDelayMinutes || firstEmailDelayMinutes <= 0) {
      return;
    }

    try {
      const now = new Date();
      const firstDelayMs = firstEmailDelayMinutes * 60 * 1000;
      const secondDelayMs = secondEmailDelayMinutes * 60 * 1000;
      const maxReminders = secondEmailDelayMinutes > 0 ? 2 : 1;

      const carts = await AbandonedCart.find({
        lastActivityAt: { $lte: new Date(Date.now() - firstDelayMs) },
        reminderCount: { $lt: maxReminders },
        items: { $exists: true, $ne: [] },
      })
        .populate('user', 'name email')
        .limit(50);

      if (carts.length === 0) {
        return;
      }

      for (const cart of carts) {
        if (!cart.user || !cart.user.email) {
          continue;
        }

        const hasRecentOrder = await Order.exists({
          user: cart.user._id,
          createdAt: { $gte: cart.lastActivityAt },
        });

        if (hasRecentOrder) {
          await AbandonedCart.deleteOne({ _id: cart._id });
          continue;
        }

        const shouldSendFirst = cart.reminderCount === 0;
        const shouldSendSecond =
          secondEmailDelayMinutes > 0 &&
          cart.reminderCount === 1 &&
          cart.firstReminderAt &&
          now.getTime() - new Date(cart.firstReminderAt).getTime() >= secondDelayMs;

        if (!shouldSendFirst && !shouldSendSecond) {
          continue;
        }

        if (!cart.recoveryToken) {
          cart.recoveryToken = cartToken();
        }

        const recoveryUrl = `${frontendBaseUrl}/cart?recover=${cart.recoveryToken}`;

        await sendAbandonedCartEmail({
          email: cart.user.email,
          name: cart.user.name,
          recoveryUrl,
          items: cart.items,
          subtotal: cart.subtotal,
          currency: cart.currency,
          reminderNumber: cart.reminderCount + 1,
        });

        cart.reminderCount += 1;
        if (cart.reminderCount === 1) {
          cart.firstReminderAt = now;
        } else {
          cart.secondReminderAt = now;
        }
        cart.tokenExpiresAt = new Date();
        await cart.save();
      }
    } catch (error) {
      console.error('[Cron] Abandoned cart email job failed:', error);
    }
  });

  console.log('Cron jobs initialized');
};

export default startCronJobs;

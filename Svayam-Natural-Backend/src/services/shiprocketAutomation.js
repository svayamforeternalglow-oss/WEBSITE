import shiprocket from './shiprocketService.js';

const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 800;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const recordSyncOutcome = (order, outcome) => {
  order.shiprocketSyncAt = new Date();
  if (outcome.created) {
    order.shiprocketSyncStatus = 'synced';
    order.shiprocketSyncError = '';
  } else if (outcome.error) {
    order.shiprocketSyncStatus = 'failed';
    order.shiprocketSyncError = (outcome.message || 'Shiprocket sync failed').slice(0, 500);
  } else if (outcome.skipped) {
    order.shiprocketSyncStatus = 'skipped';
    order.shiprocketSyncError = outcome.reason || '';
  }
};

/**
 * Create Shiprocket order for a paid Mongo order (non-throwing).
 * Used after payment verify, cron, and admin resync.
 */
export const ensureShiprocketOrder = async (order, context = 'unknown') => {
  if (!order) {
    return { skipped: true, reason: 'missing_order' };
  }

  const orderId = order?._id?.toString?.() || String(order?._id || 'unknown');

  if (!shiprocket.isEnabled) {
    console.warn(
      `[Shiprocket] Skipping order creation (${context}). SHIPROCKET_ENABLED is not "true".`,
      { orderId }
    );
    const result = { skipped: true, reason: 'disabled' };
    recordSyncOutcome(order, result);
    return result;
  }

  if (order.shiprocketOrderId || order.shiprocketShipmentId) {
    const result = { skipped: true, reason: 'already_created' };
    recordSyncOutcome(order, result);
    return result;
  }

  let lastError = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const srResult = await shiprocket.createOrder(order);
      order.shiprocketOrderId = srResult.order_id?.toString() || order.shiprocketOrderId || '';
      order.shiprocketShipmentId = srResult.shipment_id?.toString() || order.shiprocketShipmentId || '';

      if (!order.shiprocketOrderId && !order.shiprocketShipmentId) {
        console.warn('[Shiprocket] Create order response missing IDs', { orderId, attempt });
        lastError = new Error('Shiprocket response missing order/shipment IDs');
        if (attempt < MAX_ATTEMPTS) {
          await sleep(RETRY_DELAY_MS * attempt);
          continue;
        }
        const fail = { error: true, message: lastError.message };
        recordSyncOutcome(order, fail);
        return fail;
      }

      const success = {
        created: true,
        shiprocketOrderId: order.shiprocketOrderId,
        shiprocketShipmentId: order.shiprocketShipmentId,
        attempt,
      };
      recordSyncOutcome(order, success);
      return success;
    } catch (err) {
      lastError = err;
      console.error(`[Shiprocket] Create order failed (${context}) attempt ${attempt}/${MAX_ATTEMPTS}`, {
        orderId,
        statusCode: err.statusCode || null,
        code: err.code || null,
        message: err.message,
      });
      if (attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  const fail = { error: true, message: lastError?.message || 'Shiprocket sync failed' };
  recordSyncOutcome(order, fail);
  return fail;
};

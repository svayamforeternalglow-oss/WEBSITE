import shiprocket from './shiprocketService.js';

export const ensureShiprocketOrder = async (order, context = 'unknown') => {
  if (!order) {
    return { skipped: true, reason: 'missing_order' };
  }

  const orderId = order?._id?.toString?.() || String(order?._id || 'unknown');

  if (!shiprocket.isEnabled) {
    console.warn(`[Shiprocket] Skipping order creation (${context}). SHIPROCKET_ENABLED is not "true".`, { orderId });
    return { skipped: true, reason: 'disabled' };
  }

  if (order.shiprocketOrderId || order.shiprocketShipmentId) {
    return { skipped: true, reason: 'already_created' };
  }

  try {
    const srResult = await shiprocket.createOrder(order);
    order.shiprocketOrderId = srResult.order_id?.toString() || order.shiprocketOrderId || '';
    order.shiprocketShipmentId = srResult.shipment_id?.toString() || order.shiprocketShipmentId || '';

    if (!order.shiprocketOrderId && !order.shiprocketShipmentId) {
      console.warn('[Shiprocket] Create order response missing IDs', { orderId });
    }

    return {
      created: true,
      shiprocketOrderId: order.shiprocketOrderId,
      shiprocketShipmentId: order.shiprocketShipmentId,
    };
  } catch (err) {
    console.error(`[Shiprocket] Create order failed (${context})`, {
      orderId,
      statusCode: err.statusCode || null,
      code: err.code || null,
      message: err.message,
    });

    return { error: true, message: err.message };
  }
};

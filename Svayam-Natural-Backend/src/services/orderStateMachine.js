export const ORDER_STATES = Object.freeze({
  PENDING: 'Pending',
  PAID: 'Paid',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
});

export const CANCELLATION_REASONS = Object.freeze({
  TIMEOUT: 'timeout',
  ADMIN_CANCELLED: 'admin_cancelled',
  CUSTOMER_CANCELLED: 'customer_cancelled',
  PAYMENT_FAILED: 'payment_failed',
  REFUND: 'refund',
  OTHER: 'other',
});

const ALLOWED_TRANSITIONS = Object.freeze({
  [ORDER_STATES.PENDING]: new Set([ORDER_STATES.PAID, ORDER_STATES.CANCELLED]),
  [ORDER_STATES.PAID]: new Set([ORDER_STATES.PROCESSING, ORDER_STATES.REFUNDED]),
  [ORDER_STATES.PROCESSING]: new Set([ORDER_STATES.SHIPPED]),
  [ORDER_STATES.SHIPPED]: new Set([ORDER_STATES.DELIVERED]),
  [ORDER_STATES.DELIVERED]: new Set([]),
  [ORDER_STATES.CANCELLED]: new Set([]),
  [ORDER_STATES.REFUNDED]: new Set([]),
});

const TRACKING_TO_STATE = {
  pending: ORDER_STATES.PENDING,
  processing: ORDER_STATES.PROCESSING,
  shipped: ORDER_STATES.SHIPPED,
  'out for delivery': ORDER_STATES.SHIPPED,
  delivered: ORDER_STATES.DELIVERED,
  cancelled: ORDER_STATES.CANCELLED,
};

const createTransitionError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = 'INVALID_ORDER_TRANSITION';
  return error;
};

const normalizeTrackingStatus = (trackingStatus) => {
  if (!trackingStatus || typeof trackingStatus !== 'string') {
    return null;
  }

  return trackingStatus.trim().toLowerCase();
};

export const getOrderState = (order) => {
  if (order?.lifecycleStatus) {
    return order.lifecycleStatus;
  }

  if (order?.paymentStatus?.status === 'Refunded') {
    return ORDER_STATES.REFUNDED;
  }

  const normalizedTrackingStatus = normalizeTrackingStatus(order?.trackingStatus);
  if (normalizedTrackingStatus && TRACKING_TO_STATE[normalizedTrackingStatus]) {
    return TRACKING_TO_STATE[normalizedTrackingStatus];
  }

  if (order?.isPaid || order?.paymentStatus?.status === 'Completed') {
    return ORDER_STATES.PAID;
  }

  return ORDER_STATES.PENDING;
};

export const canTransition = (fromState, toState) => {
  if (!ALLOWED_TRANSITIONS[fromState]) {
    return false;
  }

  return ALLOWED_TRANSITIONS[fromState].has(toState);
};

const applyPaidTransition = (order, options) => {
  if (!order.paymentStatus) {
    order.paymentStatus = {};
  }

  order.isPaid = true;
  order.paidAt = order.paidAt || new Date();
  order.paymentStatus.status = 'Completed';

  if (options?.paymentId) {
    order.paymentStatus.razorpayPaymentId = options.paymentId;
  }

  if (options?.signature) {
    order.paymentStatus.razorpaySignature = options.signature;
  }
};

const applyCancelledTransition = (order, options) => {
  order.trackingStatus = 'Cancelled';
  order.cancellation_reason = options?.reason || CANCELLATION_REASONS.OTHER;

  if (order.paymentStatus?.status === 'Pending') {
    order.paymentStatus.status = 'Failed';
  }
};

const applyRefundedTransition = (order, options) => {
  if (!order.paymentStatus) {
    order.paymentStatus = {};
  }

  order.paymentStatus.status = 'Refunded';

  if (options?.refundId) {
    order.paymentStatus.razorpayRefundId = options.refundId;
  }

  if (typeof options?.refundAmount === 'number') {
    order.paymentStatus.refundAmount = options.refundAmount;
  }

  order.trackingStatus = 'Cancelled';
  order.cancellation_reason = options?.reason || CANCELLATION_REASONS.REFUND;
};

export const transitionOrder = (order, toState, options = {}) => {
  if (!order) {
    throw createTransitionError('Order is required for state transition', 500);
  }

  const fromState = getOrderState(order);

  if (fromState === toState) {
    order.lifecycleStatus = toState;
    return { fromState, toState, changed: false };
  }

  if (!canTransition(fromState, toState)) {
    throw createTransitionError(`Invalid order transition: ${fromState} -> ${toState}`);
  }

  if (toState === ORDER_STATES.PROCESSING && !order.isPaid && order.paymentStatus?.status !== 'Completed') {
    throw createTransitionError('Cannot move order to Processing before payment is completed');
  }

  if (toState === ORDER_STATES.SHIPPED && !order.isPaid && order.paymentStatus?.status !== 'Completed') {
    throw createTransitionError('Cannot ship an unpaid order');
  }

  if (toState === ORDER_STATES.REFUNDED && !order.isPaid && order.paymentStatus?.status !== 'Completed') {
    throw createTransitionError('Cannot refund an unpaid order');
  }

  switch (toState) {
    case ORDER_STATES.PAID:
      applyPaidTransition(order, options);
      break;
    case ORDER_STATES.PROCESSING:
      order.trackingStatus = 'Processing';
      break;
    case ORDER_STATES.SHIPPED:
      order.trackingStatus = 'Shipped';
      order.shippedAt = order.shippedAt || new Date();
      break;
    case ORDER_STATES.DELIVERED:
      order.trackingStatus = 'Delivered';
      order.deliveredAt = order.deliveredAt || new Date();
      break;
    case ORDER_STATES.CANCELLED:
      applyCancelledTransition(order, options);
      break;
    case ORDER_STATES.REFUNDED:
      applyRefundedTransition(order, options);
      break;
    default:
      break;
  }

  order.lifecycleStatus = toState;
  return { fromState, toState, changed: true };
};

/** Shared admin reporting filters — read-only aggregations only. */

const EXCLUDED_LIFECYCLE = ['Cancelled', 'Refunded', 'Returned'];

/**
 * Mongo match: order counts as paid for revenue/metrics.
 * isPaid OR payment completed; exclude cancelled/refunded/returned lifecycle.
 */
export const paidOrderMatch = () => ({
  $and: [
    {
      $or: [
        { isPaid: true },
        { 'paymentStatus.status': { $regex: /^completed$/i } },
      ],
    },
    { lifecycleStatus: { $nin: EXCLUDED_LIFECYCLE } },
    { 'paymentStatus.status': { $not: { $regex: /^refunded$/i } } },
  ],
});

/** Date field for revenue bucketing: paidAt when set, else createdAt. */
export const revenueDateExpression = () => ({
  $ifNull: ['$paidAt', '$createdAt'],
});

export const parseStatsDays = (query, defaultDays = 30) => {
  const raw = query?.days ?? query?.period;
  if (raw === 'daily' || raw === undefined || raw === '') {
    return defaultDays;
  }
  const n = parseInt(String(raw), 10);
  return Number.isFinite(n) && n > 0 && n <= 365 ? n : defaultDays;
};

export const statsWindow = (days) => {
  const windowEnd = new Date();
  const windowStart = new Date(windowEnd);
  windowStart.setDate(windowStart.getDate() - days);
  windowStart.setHours(0, 0, 0, 0);
  return { windowStart, windowEnd, days };
};

export const dateRangeMatch = (windowStart, windowEnd, dateExpr = revenueDateExpression()) => ({
  $expr: {
    $and: [
      { $gte: [dateExpr, windowStart] },
      { $lte: [dateExpr, windowEnd] },
    ],
  },
});

/** Paid orders missing Shiprocket IDs (cron / resync). */
export const paidMissingShiprocketMatch = (since) => ({
  $and: [
    {
      $or: [
        { isPaid: true },
        { 'paymentStatus.status': { $regex: /^completed$/i } },
      ],
    },
    { lifecycleStatus: { $nin: EXCLUDED_LIFECYCLE } },
    {
      $or: [
        { shiprocketOrderId: { $exists: false } },
        { shiprocketOrderId: '' },
        { shiprocketShipmentId: { $exists: false } },
        { shiprocketShipmentId: '' },
      ],
    },
    ...(since ? [{ createdAt: { $gte: since } }] : []),
  ],
});

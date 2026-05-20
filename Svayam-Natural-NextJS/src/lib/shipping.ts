export const FREE_DELIVERY_THRESHOLD = 1500;
export const SHIPPING_FEE = 200;

export const getShippingFee = (subtotal: number) =>
  subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : SHIPPING_FEE;

export const getFreeDeliveryRemaining = (subtotal: number) =>
  Math.max(0, FREE_DELIVERY_THRESHOLD - Math.max(0, subtotal));

export const getFreeDeliveryProgress = (subtotal: number) => {
  if (FREE_DELIVERY_THRESHOLD <= 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, subtotal / FREE_DELIVERY_THRESHOLD));
};

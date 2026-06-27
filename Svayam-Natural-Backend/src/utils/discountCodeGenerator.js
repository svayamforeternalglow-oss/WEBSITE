/**
 * Discount Code Generation Utilities
 * Generates unique discount codes for abandoned cart recovery
 */

const DISCOUNT_CODE_PREFIX = 'RECOVER';
const DISCOUNT_CODE_LENGTH = 8;

/**
 * Generate a unique discount code
 * Format: RECOVER-XXXXX (5 random alphanumeric characters)
 * @returns {string} Unique discount code
 */
export const generateDiscountCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = DISCOUNT_CODE_PREFIX;
  
  for (let i = 0; i < DISCOUNT_CODE_LENGTH; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return code;
};

/**
 * Get discount percentage based on abandonment duration
 * @param {Date} abandonedAt - When the cart was abandoned
 * @returns {number} Discount percentage (5-15%)
 */
export const getAbandonmentDiscountPercentage = (abandonedAt) => {
  if (!abandonedAt) return 5;
  
  const hoursSinceAbandonment = (Date.now() - new Date(abandonedAt).getTime()) / (1000 * 60 * 60);
  
  // Progressive discount: 5% at 6 hours, 10% at 24 hours, 15% at 48+ hours
  if (hoursSinceAbandonment >= 48) return 15;
  if (hoursSinceAbandonment >= 24) return 10;
  if (hoursSinceAbandonment >= 6) return 5;
  
  return 5;
};

/**
 * Format discount code with dashes for readability
 * @param {string} code - Raw discount code
 * @returns {string} Formatted code (e.g., RECOVER-XXXXX)
 */
export const formatDiscountCode = (code) => {
  if (!code) return '';
  
  // Remove existing dashes
  const cleanCode = code.replace(/-/g, '');
  
  // Add dash after prefix
  if (cleanCode.startsWith(DISCOUNT_CODE_PREFIX)) {
    return `${DISCOUNT_CODE_PREFIX}-${cleanCode.substring(DISCOUNT_CODE_PREFIX.length)}`;
  }
  
  return cleanCode;
};

/**
 * Generate discount code details for a cart
 * @param {Object} cart - Cart object
 * @returns {Object} Discount code details
 */
export const generateCartDiscountCode = (cart) => {
  const code = generateDiscountCode();
  const percentage = getAbandonmentDiscountPercentage(cart?.abandonedAt);
  const discountAmount = Math.round((cart?.subtotal || 0) * (percentage / 100));
  
  return {
    code: formatDiscountCode(code),
    percentage,
    discountAmount,
    applicableUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Valid for 7 days
  };
};

export default {
  generateDiscountCode,
  getAbandonmentDiscountPercentage,
  formatDiscountCode,
  generateCartDiscountCode,
};

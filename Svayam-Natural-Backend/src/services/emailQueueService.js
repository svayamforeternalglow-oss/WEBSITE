/**
 * Email Queue and Retry Service
 * Handles email delivery with automatic retry logic and failure tracking
 */

import Cart from '../models/Cart.js';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 5 * 60 * 1000; // 5 minutes between retries
const MAX_RETRY_HOURS = 24; // Stop retrying after 24 hours

/**
 * Email send configuration
 */
export const EmailConfig = {
  MAX_RETRIES: MAX_RETRY_ATTEMPTS,
  RETRY_DELAY_MS,
  MAX_RETRY_WINDOW_HOURS: MAX_RETRY_HOURS,
};

/**
 * Track email send attempt
 * @param {string} cartId - Cart ID
 * @param {string} email - Email address
 * @param {Object} details - Send attempt details
 */
export const trackEmailAttempt = async (cartId, email, details = {}) => {
  try {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;
    
    cart.emailRetryCount = (cart.emailRetryCount || 0) + 1;
    cart.lastEmailRetryAt = new Date();
    cart.emailStatus = details.status || 'pending';
    
    if (details.status === 'sent') {
      cart.emailSentAt = new Date();
      cart.emailStatus = 'sent';
    } else if (details.status === 'failed') {
      cart.emailStatus = 'failed';
    }
    
    await cart.save();
    return cart;
  } catch (error) {
    console.error('[EmailQueue] Error tracking email attempt:', error);
    return null;
  }
};

/**
 * Check if email should be retried
 * @param {Object} cart - Cart object
 * @returns {boolean} Whether email should be retried
 */
export const shouldRetryEmail = (cart) => {
  if (!cart) return false;
  if (cart.emailStatus === 'sent' || cart.emailStatus === 'bounced') return false;
  if (cart.emailRetryCount >= MAX_RETRY_ATTEMPTS) return false;
  
  // Check if within retry window
  const lastRetry = cart.lastEmailRetryAt ? new Date(cart.lastEmailRetryAt) : null;
  const hourssinceLastRetry = lastRetry 
    ? (Date.now() - lastRetry.getTime()) / (1000 * 60 * 60)
    : Infinity;
  
  if (hourssinceLastRetry < RETRY_DELAY_MS / (1000 * 60 * 60)) {
    return false; // Not enough time has passed
  }
  
  // Check if within max retry window
  const createdAt = new Date(cart.createdAt);
  const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  if (hoursSinceCreation > MAX_RETRY_HOURS) return false;
  
  return true;
};

/**
 * Get retry statistics for a cart
 * @param {Object} cart - Cart object
 * @returns {Object} Retry statistics
 */
export const getRetryStats = (cart) => {
  return {
    attempts: cart?.emailRetryCount || 0,
    maxAttempts: MAX_RETRY_ATTEMPTS,
    lastRetryAt: cart?.lastEmailRetryAt || null,
    status: cart?.emailStatus || 'pending',
    canRetry: shouldRetryEmail(cart),
  };
};

/**
 * Queue failed emails for retry
 * @returns {Promise<Array>} Array of carts that need email retry
 */
export const getEmailsForRetry = async () => {
  try {
    const retryWindow = new Date(Date.now() - RETRY_DELAY_MS);
    
    const cartsToRetry = await Cart.find({
      $or: [
        { 
          emailStatus: 'failed',
          emailRetryCount: { $lt: MAX_RETRY_ATTEMPTS },
          lastEmailRetryAt: { $lte: retryWindow }
        },
        {
          emailStatus: 'pending',
          isAbandoned: true,
          emailRetryCount: { $eq: 0 }
        }
      ]
    })
    .limit(50)
    .sort({ lastEmailRetryAt: 1 });
    
    return cartsToRetry;
  } catch (error) {
    console.error('[EmailQueue] Error querying retry emails:', error);
    return [];
  }
};

/**
 * Send email with retry logic
 * @param {Function} emailFn - Email sending function
 * @param {string} cartId - Cart ID for tracking
 * @returns {Promise<Object>} Send result with status
 */
export const sendEmailWithRetry = async (emailFn, cartId) => {
  try {
    const result = await emailFn();
    
    await trackEmailAttempt(cartId, null, { status: 'sent' });
    
    return {
      success: true,
      status: 'sent',
      message: 'Email sent successfully',
    };
  } catch (error) {
    console.error('[EmailQueue] Email send failed:', error.message);
    
    await trackEmailAttempt(cartId, null, { status: 'failed' });
    
    return {
      success: false,
      status: 'failed',
      message: error.message,
    };
  }
};

/**
 * Clean up old abandoned carts (older than 30 days)
 * @returns {Promise<number>} Number of cleaned carts
 */
export const cleanupOldAbandonedCarts = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const result = await Cart.deleteMany({
      isAbandoned: true,
      convertedAt: { $exists: false },
      createdAt: { $lt: thirtyDaysAgo }
    });
    
    if (result.deletedCount > 0) {
      console.log(`[EmailQueue] Cleaned up ${result.deletedCount} old abandoned carts`);
    }
    
    return result.deletedCount || 0;
  } catch (error) {
    console.error('[EmailQueue] Cleanup error:', error);
    return 0;
  }
};

export default {
  trackEmailAttempt,
  shouldRetryEmail,
  getRetryStats,
  getEmailsForRetry,
  sendEmailWithRetry,
  cleanupOldAbandonedCarts,
  EmailConfig,
};

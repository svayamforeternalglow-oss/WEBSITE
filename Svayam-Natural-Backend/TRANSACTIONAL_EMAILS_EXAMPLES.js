/**
 * Example Usage of Transactional Emails
 * 
 * This file demonstrates how to use the transactional email system
 * in your application. These are example implementations.
 */

// ============================================================================
// EXAMPLE 1: Sending Order Confirmation Email (After Payment)
// ============================================================================

import { sendOrderConfirmationEmail } from '../services/emailService.js';

export const handlePaymentSuccess = async (req, res) => {
  try {
    // Payment verified, order created
    const order = {
      _id: '507f1f77bcf86cd799439011',
      orderItems: [
        {
          name: 'Abhyanga Oil',
          qty: 2,
          price: 750,
          quantity: 2
        }
      ],
      totalAmount: 1500,
      shippingAddress: {
        email: 'customer@example.com',
        fullName: 'John Doe'
      }
    };

    // Send order confirmation email
    await sendOrderConfirmationEmail(order.shippingAddress.email, order);

    return res.json({ 
      success: true, 
      message: 'Payment verified and order confirmation email sent' 
    });
  } catch (error) {
    console.error('Error:', error);
    // Note: Don't fail the payment flow if email fails
    return res.json({ 
      success: true, 
      message: 'Payment verified (email may have failed, will be retried)' 
    });
  }
};

// ============================================================================
// EXAMPLE 2: Abandoned Cart Email with Discount Code
// ============================================================================

import { sendAbandonedCartEmail } from '../services/emailService.js';
import { generateCartDiscountCode } from '../utils/discountCodeGenerator.js';
import Cart from '../models/Cart.js';

// This would normally be called by the cron job in cronJobs.js
export const sendAbandonedCartRecoveryEmail = async (userId, email) => {
  try {
    // Get user's cart
    const user = await User.findById(userId);
    
    if (!user?.savedCart?.items?.length) {
      console.log('No items in cart');
      return;
    }

    // Generate discount code
    const discountCode = generateCartDiscountCode({
      items: user.savedCart.items,
      subtotal: user.savedCart.items.reduce(
        (sum, item) => sum + (item.price * (item.quantity || 1)),
        0
      ),
      abandonedAt: user.savedCart.updatedAt,
    });

    console.log('Generated discount code:', discountCode.code);
    // Output example: { code: 'RECOVER-ABC123', percentage: 10, discountAmount: 150, applicableUntil: Date }

    // Send email with discount offer
    await sendAbandonedCartEmail(
      email,
      user.savedCart,
      user.name,
      discountCode
    );

    // Mark as sent
    user.abandonedCartEmailSentAt = new Date();
    await user.save();

    console.log('Abandoned cart email sent to', email);
  } catch (error) {
    console.error('Failed to send abandoned cart email:', error);
  }
};

// ============================================================================
// EXAMPLE 3: Using Cart Model for Advanced Tracking
// ============================================================================

import { generateCartDiscountCode } from '../utils/discountCodeGenerator.js';

export const trackAndRecoverAbandondedCart = async (req, res) => {
  try {
    // Find abandoned carts
    const abandonedCarts = await Cart.find({
      isAbandoned: true,
      emailStatus: { $in: ['pending', 'failed'] }
    }).limit(10);

    for (const cart of abandonedCarts) {
      try {
        if (cart.items.length === 0) continue;

        // Generate discount if not already generated
        if (!cart.discountCode) {
          const discount = generateCartDiscountCode(cart);
          cart.discountCode = discount.code;
          cart.discountPercentage = discount.percentage;
          await cart.save();
        }

        // Send email
        await sendAbandonedCartEmail(
          cart.email,
          cart,
          null,
          {
            code: cart.discountCode,
            percentage: cart.discountPercentage,
            applicableUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        );

        // Track successful send
        cart.emailSentAt = new Date();
        cart.emailStatus = 'sent';
        await cart.save();

      } catch (error) {
        console.error(`Failed for cart ${cart._id}:`, error.message);
      }
    }

    return res.json({ 
      success: true, 
      processed: abandonedCarts.length 
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// EXAMPLE 4: Email Retry Logic
// ============================================================================

import { getEmailsForRetry, shouldRetryEmail } from '../services/emailQueueService.js';

export const retryFailedEmails = async (req, res) => {
  try {
    // Get emails that need retry
    const failedEmails = await getEmailsForRetry();
    
    console.log(`Found ${failedEmails.length} emails to retry`);

    let successCount = 0;
    let failureCount = 0;

    for (const cart of failedEmails) {
      try {
        // Check if should retry
        if (!shouldRetryEmail(cart)) {
          console.log(`Cart ${cart._id} no longer eligible for retry`);
          continue;
        }

        // Send email
        await sendAbandonedCartEmail(
          cart.email,
          cart,
          null,
          {
            code: cart.discountCode || generateCartDiscountCode(cart).code,
            percentage: cart.discountPercentage || 5
          }
        );

        // Update status
        cart.emailRetryCount = (cart.emailRetryCount || 0) + 1;
        cart.lastEmailRetryAt = new Date();
        cart.emailStatus = 'sent';
        await cart.save();

        successCount++;

      } catch (error) {
        failureCount++;
        console.error(`Retry failed for ${cart.email}:`, error.message);
      }
    }

    return res.json({
      success: true,
      processed: failedEmails.length,
      succeeded: successCount,
      failed: failureCount
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// EXAMPLE 5: Check Email Status
// ============================================================================

export const checkEmailStatus = async (req, res) => {
  try {
    const { cartId } = req.params;

    const cart = await Cart.findById(cartId);

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    return res.json({
      cartId: cart._id,
      email: cart.email,
      emailStatus: cart.emailStatus,
      emailSentAt: cart.emailSentAt,
      emailRetryCount: cart.emailRetryCount,
      lastEmailRetryAt: cart.lastEmailRetryAt,
      isAbandoned: cart.isAbandoned,
      abandonedAt: cart.abandonedAt,
      discountCode: cart.discountCode,
      discountPercentage: cart.discountPercentage
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// EXAMPLE 6: Discount Code Utilities
// ============================================================================

import {
  generateDiscountCode,
  getAbandonmentDiscountPercentage,
  formatDiscountCode,
  generateCartDiscountCode
} from '../utils/discountCodeGenerator.js';

export const demonstrateDiscountCodes = () => {
  // Generate unique code
  const code = generateDiscountCode();
  console.log('Generated code:', code); // e.g., "RECOVERABCD1234"

  // Format with dashes
  const formatted = formatDiscountCode(code);
  console.log('Formatted code:', formatted); // e.g., "RECOVER-ABCD1234"

  // Get discount percentage based on abandonment
  const abandonedDate = new Date(Date.now() - 30 * 60 * 60 * 1000); // 30 hours ago
  const percentage = getAbandonmentDiscountPercentage(abandonedDate);
  console.log('Discount percentage:', percentage); // 10%

  // Generate full discount details
  const cart = {
    items: [{ price: 500, quantity: 2 }],
    subtotal: 1000,
    abandonedAt: new Date(Date.now() - 50 * 60 * 60 * 1000) // 50 hours ago
  };
  
  const discountDetails = generateCartDiscountCode(cart);
  console.log('Discount details:', {
    code: discountDetails.code,              // "RECOVER-XYZ123"
    percentage: discountDetails.percentage,  // 15%
    discountAmount: discountDetails.discountAmount, // 150 (15% of 1000)
    applicableUntil: discountDetails.applicableUntil // 7 days from now
  });
};

export default {
  handlePaymentSuccess,
  sendAbandonedCartRecoveryEmail,
  trackAndRecoverAbandondedCart,
  retryFailedEmails,
  checkEmailStatus,
  demonstrateDiscountCodes
};

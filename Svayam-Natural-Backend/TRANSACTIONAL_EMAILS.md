# Transactional Emails Documentation

## Overview

This document describes the transactional email system for Svayam Natural, which includes:
- **Order Confirmation Emails** - Sent when a customer completes a purchase
- **Shipping Update Emails** - Sent when an order is shipped
- **Abandoned Cart Recovery Emails** - Sent to customers who leave items in their cart

## Architecture

### Core Components

1. **emailService.js** - Email sending service with Resend API integration
2. **emailQueueService.js** - Email queue and retry logic
3. **discountCodeGenerator.js** - Generates unique discount codes for cart recovery
4. **Cart.js** - MongoDB model for tracking abandoned carts
5. **cronJobs.js** - Scheduled tasks for sending emails and cleanup

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Resend API Configuration
RESEND_API_KEY=<your-resend-api-key>
RESEND_FROM_EMAIL=noreply@svayamnatural.com

# Email Configuration
SUPPORT_EMAIL=support@svayamnatural.com
FRONTEND_URL=https://svayamnatural.com

# Abandoned Cart Configuration
ABANDONED_CART_HOURS=6  # Hours before a cart is considered abandoned
```

### Feature Flags

```bash
# Enable/disable email sending
EMAIL_ENABLED=true

# Resend API is already integrated (keys in Railway)
RESEND_API_KEY=<railway-secret>
```

## Features

### 3a: Order Confirmation Email

**Trigger:** Payment verification successful

**When Sent:**
- After payment is verified in `verifyPayment()` endpoint
- Also sent after guest payment verification in `verifyGuestPayment()`

**Content:**
- Order ID with tracking link
- Itemized list of products
- Total order amount
- Call-to-action button to track order

**Code Location:**
- **Sending:** [src/controllers/orderController.js](src/controllers/orderController.js#L410) - `verifyPayment()` and `verifyGuestPayment()`
- **Template:** [src/services/emailService.js](src/services/emailService.js) - `sendOrderConfirmationEmail()`

**Error Handling:**
- Logs email sending errors but doesn't fail the payment flow
- Errors are caught and logged without breaking the user's checkout experience

### 3b: Abandoned Cart Recovery Email

**Trigger:** Cart not updated for 6+ hours (configurable)

**When Sent:**
- Automatically sent by cron job every 30 minutes
- Only sent once per cart (tracked with `abandonedCartEmailSentAt`)
- Can be manually triggered via API

**Content:**
- Personalized greeting with customer name
- Itemized cart summary with product images
- Total cart value
- **Exclusive discount code** (5-15% based on abandonment duration)
- Countdown timer for discount validity
- Call-to-action button to complete purchase

**Discount Logic:**
- 5% discount for carts abandoned 6+ hours
- 10% discount for carts abandoned 24+ hours
- 15% discount for carts abandoned 48+ hours
- Valid for 7 days

**Code Location:**
- **Tracking:** [src/models/User.js](src/models/User.js) - `savedCart` and `abandonedCartEmailSentAt`
- **Cart Model:** [src/models/Cart.js](src/models/Cart.js) - Dedicated cart abandonment tracking
- **Cron Job:** [src/utils/cronJobs.js](src/utils/cronJobs.js) - Runs every 30 minutes
- **Email Template:** [src/services/emailService.js](src/services/emailService.js) - `sendAbandonedCartEmail()`
- **Discount Generator:** [src/utils/discountCodeGenerator.js](src/utils/discountCodeGenerator.js)

## API Endpoints & Usage

### Sending Abandoned Cart Recovery Email Manually

```javascript
// In your route or controller
import { sendAbandonedCartEmail } from '../services/emailService.js';
import { generateCartDiscountCode } from '../utils/discountCodeGenerator.js';

// Get cart data
const cart = user.savedCart;

// Generate discount code
const discountCode = generateCartDiscountCode(cart);

// Send email
await sendAbandonedCartEmail(email, cart, user.name, discountCode);
```

### Checking Email Status

```javascript
// Get cart with email status
const cart = await Cart.findById(cartId);
console.log(cart.emailStatus);      // 'pending', 'sent', 'failed', 'bounced'
console.log(cart.emailRetryCount);  // Number of retry attempts
console.log(cart.lastEmailRetryAt); // Last retry timestamp
```

### Querying Failed Emails for Retry

```javascript
import { getEmailsForRetry } from '../services/emailQueueService.js';

// Get all failed emails ready for retry
const failedEmails = await getEmailsForRetry();
```

## Email Retry Logic

### Retry Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| `MAX_RETRY_ATTEMPTS` | 3 | Maximum number of retry attempts |
| `RETRY_DELAY_MS` | 5 minutes | Delay between retry attempts |
| `MAX_RETRY_WINDOW_HOURS` | 24 | Stop retrying after 24 hours |

### Retry Flow

1. Initial send attempt
2. If failed → logs error and marks as 'failed'
3. Waits 5 minutes before first retry
4. Retries up to 3 times (total)
5. Stops retrying after 24 hours
6. Cron job checks every 15 minutes for emails needing retry

### Handling Bounced Emails

If an email address consistently bounces (via Resend webhooks):
```javascript
const cart = await Cart.findByIdAndUpdate(cartId, {
  emailStatus: 'bounced',
  isAbandoned: false // Stop trying to recover this cart
});
```

## Cron Jobs

### Job 1: Unpaid Order Cleanup (Every 15 minutes)
- Cancels orders not paid within 30 minutes
- Restores product inventory

### Job 2: Shiprocket Sync (Every 30 minutes)
- Syncs paid orders to Shiprocket
- Generates tracking numbers

### Job 3: Abandoned Cart Recovery (Every 30 minutes)
- Finds carts abandoned for 6+ hours
- Generates unique discount codes
- Sends recovery emails
- Marks as processed

### Job 4: Email Retry (Every 15 minutes)
- Checks for failed emails
- Retries based on retry policy
- Updates email status

### Job 5: Cleanup (Daily at 2 AM)
- Removes abandoned carts older than 30 days
- Cleans up converted carts

## Email Templates

### Template Structure

All emails use a consistent premium template:
- Header with Svayam Natural branding
- Main content area
- Footer with support information
- Responsive design for mobile

### Template Components

```
┌─────────────────────────────────┐
│   Header (Dark green, 0f2e1f)   │
│   Title + Preheader              │
├─────────────────────────────────┤
│   Body Content                   │
│   (Custom per email type)        │
├─────────────────────────────────┤
│   Footer (Light tan, f9f7f2)     │
│   Support info + Copyright       │
└─────────────────────────────────┘
```

### Styling

- **Brand Color:** `#0f2e1f` (dark green)
- **Accent Color:** `#c2a25d` (gold)
- **Background:** `#f5f3ef` (warm off-white)
- **Font:** System fonts for better compatibility

## Error Handling

### Email Service Validation

```javascript
// Checks before sending any email
canSend() returns false if:
- RESEND_API_KEY is missing
- RESEND_FROM_EMAIL is missing
```

### Email Sending Errors

```javascript
// Caught and logged
[Email] [order_confirmation] [error] test@example.com
  { message: "Invalid email address", code: "invalid_email" }
```

### Retry Scenarios

Email is retried when:
- Network timeout
- Resend API rate limit
- Temporary service unavailability

Email is NOT retried when:
- Invalid email address (bounced)
- Spam complaints
- Hard bounces

## Monitoring & Analytics

### Email Events Logged

Each email sends logs:
```javascript
[Email] [category] [status] email@example.com { details }
```

Categories:
- `order_confirmation` - Order confirmation emails
- `shipping_update` - Shipping update emails
- `abandoned_cart` - Cart recovery emails

Status:
- `sent` - Successfully sent
- `failed` - Send failed (will retry)
- `skipped` - Skipped due to config or business logic
- `error` - Error during send

### Metrics to Track

```javascript
// Order confirmation emails
- Total sent
- Failure rate
- Time to send after payment

// Abandoned cart emails
- Total sent
- Discount code redemption rate
- Cart recovery conversion rate
- Discount amount vs. order value gained

// Email reliability
- Retry success rate
- Bounce rate
- Complaint rate
```

## Integration with Payment Flow

### User Journey

1. User completes checkout
2. Payment processed via Razorpay
3. Payment verification in backend
4. Order confirmation email triggered
5. User gets order ID for tracking

### Guest Checkout Journey

1. Guest enters email at checkout
2. Order created with email
3. Payment processed
4. Email verified at payment verification stage
5. Order confirmation sent to provided email

## Troubleshooting

### Emails Not Sending

**Check:**
```bash
# 1. Verify environment variables
echo $RESEND_API_KEY
echo $RESEND_FROM_EMAIL

# 2. Check application logs
# Look for: "[Email] RESEND_API_KEY is missing"

# 3. Test Resend API directly
curl -X POST https://api.resend.com/emails \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"from":"noreply@svayamnatural.com","to":"test@example.com","subject":"Test","html":"<p>Test</p>"}'
```

### Abandoned Cart Email Not Sending

**Check:**
```javascript
// Verify cart data
const user = await User.findOne({ email: 'customer@example.com' });
console.log(user.savedCart); // Should have items
console.log(user.abandonedCartEmailSentAt); // Should be null

// Check cron job logs
// Should see: "[Cron] Found X users with abandoned carts"
```

### Email Retry Loop

**Check:**
```javascript
// Verify retry config
const cart = await Cart.findById(cartId);
console.log(cart.emailRetryCount); // Should be <= 3
console.log(cart.emailStatus); // Should show current status
```

## Best Practices

### When Implementing Custom Email Scenarios

1. **Always use the emailService.js functions** - Don't call Resend directly
2. **Add proper error handling** - Use try-catch and log errors
3. **Track email status** - Update Cart or User model with email metadata
4. **Test with real email** - Use your own test email in staging
5. **Monitor delivery** - Check email reputation and bounce rates

### Customer Communication

1. Set expectations in checkout ("You'll receive an order confirmation email")
2. Provide support email for email issues
3. Include unsubscribe option for abandoned cart emails (if required by law)
4. Personalize with customer name when possible

## Testing

### Local Testing

```javascript
// In cronJobs or manually trigger in endpoint
import { sendAbandonedCartEmail } from '../services/emailService.js';
import { generateCartDiscountCode } from '../utils/discountCodeGenerator.js';

const testCart = {
  items: [
    { name: 'Product', price: 500, quantity: 1, image: 'url' }
  ],
  subtotal: 500
};

const discount = generateCartDiscountCode(testCart);
await sendAbandonedCartEmail('test@example.com', testCart, 'Test', discount);
```

### Staging Testing

1. Use real Resend API key from Railway
2. Send to test email addresses
3. Verify email appearance
4. Test all links and discount codes
5. Monitor retry logic

## Future Enhancements

Potential improvements:
- [ ] SMS notifications for cart recovery
- [ ] Dynamic discount codes per customer segment
- [ ] A/B testing of email subject lines
- [ ] Email preference center for customers
- [ ] Integration with email analytics platform
- [ ] Multi-language email templates
- [ ] Browser-based email preview
- [ ] Unsubscribe link in abandoned cart emails

## Support

For issues or questions:
1. Check email logs in application
2. Review Resend API documentation
3. Contact Resend support for API issues
4. Check Railway logs for environment variable issues

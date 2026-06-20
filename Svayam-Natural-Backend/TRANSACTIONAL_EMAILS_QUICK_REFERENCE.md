# Transactional Emails - Quick Reference

## What Was Implemented

### 3a: Order Confirmation Email ✅
- **Status:** Already implemented and active
- **Trigger:** After payment verification
- **Template:** Premium HTML with order details and tracking link
- **Error Handling:** Logged but doesn't break checkout
- **Location:** [src/services/emailService.js](src/services/emailService.js#L58)

### 3b: Abandoned Cart Recovery Email ✅
- **Status:** Fully implemented with enhancements
- **Trigger:** Cron job every 30 minutes (for carts abandoned 6+ hours)
- **Template:** Premium HTML with product images, subtotal, and discount offer
- **Discount Code:** Unique 8-character code with 5-15% discount based on abandonment duration
- **Retry Logic:** Auto-retries failed emails up to 3 times over 24 hours
- **Location:** [src/services/emailService.js](src/services/emailService.js#L190)

## New Files Created

1. **[src/models/Cart.js](src/models/Cart.js)**
   - Dedicated model for cart abandonment tracking
   - Tracks email status, retry count, discount codes
   - Indexes for efficient querying

2. **[src/utils/discountCodeGenerator.js](src/utils/discountCodeGenerator.js)**
   - Generates unique discount codes (e.g., RECOVER-ABC123)
   - Progressive discounts based on abandonment duration
   - Utility functions for code formatting

3. **[src/services/emailQueueService.js](src/services/emailQueueService.js)**
   - Email queue and retry management
   - Configurable retry attempts and delays
   - Tracks email delivery status
   - Cleanup of old abandoned carts

## Modified Files

1. **[src/services/emailService.js](src/services/emailService.js)**
   - Enhanced email templates with better styling
   - Improved HTML formatting for readability
   - Better error tracking and logging
   - Support for discount code in abandoned cart emails

2. **[src/utils/cronJobs.js](src/utils/cronJobs.js)**
   - Enhanced abandoned cart cron job with discount code generation
   - Added email retry job (every 15 minutes)
   - Added cleanup job (daily at 2 AM)
   - Better logging and error handling

## Environment Variables Required

```bash
RESEND_API_KEY=<from-railway>
RESEND_FROM_EMAIL=noreply@svayamnatural.com
SUPPORT_EMAIL=support@svayamnatural.com
FRONTEND_URL=https://svayamnatural.com
ABANDONED_CART_HOURS=6
```

## Key Features

### Email Templates
- ✅ Premium design with Svayam Natural branding
- ✅ Responsive for mobile/desktop
- ✅ Personalized greetings
- ✅ Product images and details
- ✅ Clear call-to-action buttons
- ✅ Professional footer with support info

### Discount Code System
- ✅ Unique 8-character alphanumeric codes
- ✅ Progressive discounts (5%, 10%, 15%)
- ✅ 7-day validity period
- ✅ Shows savings amount to customer
- ✅ Clearly displayed in email

### Retry & Reliability
- ✅ Auto-retry failed emails (3 attempts)
- ✅ 5-minute delay between retries
- ✅ 24-hour retry window
- ✅ Email status tracking
- ✅ Bounce handling

### Cron Jobs
- ✅ Abandoned cart: Every 30 minutes
- ✅ Email retry: Every 15 minutes
- ✅ Cleanup: Daily at 2 AM
- ✅ Error logging and monitoring

## Email Sending Flow

```
┌─ Order Placed
├─ Payment Verified
├─ Order Confirmation Email Sent
│  ├─ Order ID, Items, Total
│  └─ Tracking Link
│
├─ 6+ hours pass without purchase
├─ Cart flagged as abandoned
├─ Cron job runs (every 30 min)
├─ Discount code generated
├─ Abandoned Cart Recovery Email Sent
│  ├─ Product images & details
│  ├─ Discount code (5-15% off)
│  ├─ Cart total & savings
│  └─ Complete Order button
│
└─ If email fails:
   ├─ Logged and marked as failed
   ├─ Retry job checks (every 15 min)
   ├─ Retries up to 3 times
   └─ Stops after 24 hours
```

## Testing Checklist

- [ ] Order confirmation email received after payment
- [ ] Email contains order ID and tracking link
- [ ] Abandoned cart email received after 6+ hours
- [ ] Discount code visible and correct
- [ ] Discount calculation matches (5%, 10%, or 15%)
- [ ] Email links work correctly
- [ ] Email is mobile-responsive
- [ ] Email images load properly
- [ ] Failed email retry works
- [ ] Cron jobs running (check logs)

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Emails not sending | Check RESEND_API_KEY and RESEND_FROM_EMAIL in .env |
| Abandoned cart email not received | Check if cart is marked as abandoned (6+ hours old) |
| Discount code not showing | Check emailService logs for discount generation |
| Email retry not working | Check cron job logs and emailQueueService status |
| Images not loading | Verify product image URLs are accessible |

## Monitoring Commands

```bash
# Check if Resend API is accessible
curl -X GET https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY"

# Check application logs for email events
grep "\[Email\]" app.log
grep "\[Cron\]" app.log

# Query abandoned carts
# In MongoDB shell or via Compass
db.carts.find({ isAbandoned: true, emailStatus: "pending" })
```

## API Integration Example

```javascript
// Manually trigger abandoned cart email
const { sendAbandonedCartEmail } = await import('../services/emailService.js');
const { generateCartDiscountCode } = await import('../utils/discountCodeGenerator.js');

// Get cart
const cart = await Cart.findById(cartId);

// Generate discount
const discount = generateCartDiscountCode(cart);

// Send email
await sendAbandonedCartEmail(
  cart.email,
  cart,
  cart.user ? (await User.findById(cart.user)).name : null,
  discount
);
```

## Performance Notes

- Cron jobs run in background without blocking main app
- Cart abandonment checks use indexes for fast queries
- Email sending is non-blocking (don't wait for confirmation)
- Retry mechanism spread over time to avoid API rate limits
- Cleanup job removes old data to keep database efficient

## Next Steps (Optional Enhancements)

- [ ] Add SMS notifications for cart recovery
- [ ] A/B test discount percentages
- [ ] Track discount code redemption
- [ ] Send follow-up email if first recovery email ignored
- [ ] Integrate with email analytics platform
- [ ] Multi-language email templates
- [ ] VIP customer discount tiers

---

**Documentation:** [TRANSACTIONAL_EMAILS.md](TRANSACTIONAL_EMAILS.md)  
**Last Updated:** June 2026  
**Status:** ✅ Ready for Production

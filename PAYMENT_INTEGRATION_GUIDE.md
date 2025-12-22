# Payment Integration Guide

This guide explains how to set up and test the payment system for the booking checkout page.

## Features Implemented

✅ **Cash Payment**: Users can select cash payment and complete booking, then redirect to "/"  
✅ **Online Payment**: Users can pay securely with Stripe and redirect to "/" after successful payment  
✅ **Payment Method Selection**: Clean UI for choosing between cash and online payment  
✅ **Stripe Integration**: Complete Stripe payment flow with payment intents and webhooks

## Files Created/Modified

### New Files:

- `app/api/payments/stripe/create-payment-intent/route.ts` - Creates Stripe payment intents
- `app/api/payments/stripe/webhook/route.ts` - Handles Stripe webhooks
- `components/payment/StripePaymentForm.tsx` - Stripe payment form component
- `.env.example` - Environment variables template
- `PAYMENT_INTEGRATION_GUIDE.md` - This guide

### Modified Files:

- `app/checkout/page.tsx` - Updated with payment method selection and Stripe integration
- `package.json` - Added Stripe dependencies

## Setup Instructions

### 1. Install Stripe Dependencies

The following packages are already installed:

```json
{
  "@stripe/stripe-js": "^8.6.0",
  "stripe": "^20.1.0",
  "@stripe/react-stripe-js": "^5.4.1"
}
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and add your Stripe keys:

```bash
cp .env.example .env.local
```

Add your Stripe keys to `.env.local`:

```env
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 3. Get Stripe Keys

1. Create a Stripe account at https://stripe.com
2. Go to the Stripe Dashboard
3. Navigate to Developers > API keys
4. Copy your:
   - Publishable key (starts with `pk_test_` or `pk_live_`)
   - Secret key (starts with `sk_test_` or `sk_live_`)

### 4. Setup Webhooks (Optional)

For production, set up webhooks to handle payment events:

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/payments/stripe/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## How It Works

### Cash Payment Flow:

1. User selects "Pay with Cash"
2. Clicks "Confirm Booking (Cash)"
3. Booking is created in database
4. User is redirected to "/"

### Online Payment Flow:

1. User selects "Pay Online"
2. Clicks "Pay Online"
3. Booking is created in database
4. Stripe payment intent is created
5. Payment form is displayed
6. User enters payment details
7. Payment is processed by Stripe
8. On success, user is redirected to "/"

## Testing

### Test with Stripe Test Cards

Use these test card numbers in the Stripe payment form:

**Successful Payment:**

- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- Name: Any name
- Email: Any email

**Declined Payment:**

- Card: `4000 0000 0000 0002`
- Use same details as above

**Requires Authentication:**

- Card: `4000 0025 0000 3155`
- Use same details as above

### Test Cash Payment:

1. Go to checkout page
2. Select "Pay with Cash"
3. Click "Confirm Booking (Cash)"
4. Should create booking and redirect to "/"

### Test Online Payment:

1. Go to checkout page
2. Select "Pay Online"
3. Click "Pay Online"
4. Enter test card details
5. Complete payment
6. Should redirect to "/"

## Troubleshooting

### Common Issues:

1. **"Stripe publishable key not found"**

   - Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set in `.env.local`

2. **"Failed to create payment intent"**

   - Check `STRIPE_SECRET_KEY` is set correctly
   - Ensure booking data is valid

3. **Payment form not displaying**

   - Check browser console for errors
   - Verify Stripe packages are installed
   - Ensure client secret is valid

4. **Webhook errors**
   - Check webhook secret matches Stripe dashboard
   - Verify webhook URL is accessible

### Development Tips:

1. Use Stripe test mode for development
2. Check browser network tab for API call errors
3. Use Stripe CLI for local webhook testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/payments/stripe/webhook
   ```

## Security Notes

- Never expose your secret key in client-side code
- Use environment variables for all sensitive data
- Validate all payment data on the server side
- Implement proper error handling and logging

## Production Deployment

1. Use live Stripe keys (not test keys)
2. Set up proper webhook endpoints
3. Enable HTTPS for all payment pages
4. Test thoroughly with real payments before going live
5. Monitor payment events and errors

## Support

For Stripe-specific issues:

- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

For application-specific issues:

- Check application logs
- Verify environment variables
- Test payment flows in development first

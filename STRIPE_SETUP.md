# Stripe Setup Instructions

## Step 1: Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Click "Start now"
3. Create account with your email
4. Verify your email

## Step 2: Get Your Test Keys

1. Login to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Make sure you're in **TEST MODE** (toggle in top right)
3. Go to **Developers → API keys**
4. You'll see:
   - **Publishable key**: `pk_test_...` (safe for frontend)
   - **Secret key**: `sk_test_...` (click "Reveal" to see it)

## Step 3: Add Keys to Your Site

### Method A: Via Netlify UI (Recommended)
Try this direct link:
```
https://app.netlify.com/sites/[YOUR-SITE-NAME]/configuration/env
```

Then add:
- Key: `STRIPE_SECRET_KEY`
- Value: `sk_test_...` (your secret key)

### Method B: Via netlify.toml (Testing Only)
Edit `/netlify.toml` and uncomment lines:
```toml
[build.environment]
  STRIPE_SECRET_KEY = "sk_test_your_actual_key_here"
  STRIPE_PUBLISHABLE_KEY = "pk_test_your_actual_key_here"
```

### Method C: Via Netlify CLI
If you got logged in:
```bash
netlify env:set STRIPE_SECRET_KEY "sk_test_your_key"
netlify env:set STRIPE_PUBLISHABLE_KEY "pk_test_your_key"
```

## Step 4: Update marketplace.html

Replace the placeholder key in `marketplace.html`:
```javascript
// Line 122 - replace this:
const stripe = Stripe('pk_test_51234567890');

// With your real publishable key:
const stripe = Stripe('pk_test_your_actual_publishable_key');
```

## Step 5: Deploy Changes

```bash
git add .
git commit -m "Add Stripe configuration"
git push
```

Netlify will auto-deploy when you push.

## Step 6: Test Your Marketplace

1. Go to `https://jerusalemhills.netlify.app/marketplace.html`
2. Click "Buy Now" on any product
3. You should be redirected to Stripe Checkout
4. Use test card: `4242 4242 4242 4242`
5. Any future date, any CVC

## Test Card Numbers

| Type | Number | CVC | Date |
|------|--------|-----|------|
| Success | 4242 4242 4242 4242 | Any | Any future |
| Decline | 4000 0000 0000 0002 | Any | Any future |
| 3D Secure | 4000 0025 0000 3155 | Any | Any future |

## Troubleshooting

### "Missing API Key" Error
- Check environment variables are set in Netlify
- Redeploy site after adding variables

### "Invalid Publishable Key"
- Make sure you're using `pk_test_` not `sk_test_` in frontend
- Check for typos in the key

### Checkout Won't Load
- Verify publishable key is correct
- Check browser console for errors
- Make sure you're on HTTPS (Netlify handles this)

## Going Live (Later)

When ready for real payments:
1. Complete Stripe account verification
2. Switch to LIVE MODE in Stripe Dashboard
3. Get live keys (`pk_live_...`, `sk_live_...`)
4. Update environment variables in Netlify
5. Update marketplace.html with live publishable key
6. Test with a real (small) transaction

## Webhook Setup (Optional - for order tracking)

1. In Stripe Dashboard → Webhooks
2. Add endpoint: `https://jerusalemhills.netlify.app/.netlify/functions/stripe-webhook`
3. Select events: `checkout.session.completed`
4. Copy signing secret: `whsec_...`
5. Add to Netlify env: `STRIPE_WEBHOOK_SECRET`

---

**Security Reminder**: NEVER commit secret keys to Git!
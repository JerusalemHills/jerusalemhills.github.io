# Jerusalem Hills Marketplace Documentation

## Architecture Overview

The Jerusalem Hills marketplace uses a **hybrid architecture** that combines the simplicity of GitHub Pages with the power of Netlify Functions for payment processing.

### How It Works
```
┌─────────────────┐           ┌──────────────────┐           ┌─────────────┐
│  GitHub Pages   │           │ Netlify Functions │           │   Stripe    │
│                 │           │                  │           │             │
│ jerusalemhills  │  API Call │ jerusalemhills   │  Process  │  Checkout   │
│     .com        ├──────────►│  .netlify.app    ├──────────►│   & Pay     │
│                 │           │                  │           │             │
│ - marketplace   │           │ - create-session │           │ - Secure    │
│ - success page  │           │ - webhook handler│           │ - PCI Ready │
│ - cancel page   │           │ - CORS enabled   │           │             │
└─────────────────┘           └──────────────────┘           └─────────────┘
```

## Current Setup

### Frontend (GitHub Pages)
- **URL**: `https://jerusalemhills.com/marketplace.html`
- **Hosting**: GitHub Pages (static)
- **Files**:
  - `/marketplace.html` - Product catalog and buy buttons
  - `/success.html` - Post-payment success page
  - `/cancel.html` - Payment cancelled page

### Backend (Netlify Functions)
- **API Endpoint**: `https://jerusalemhills.netlify.app/.netlify/functions/`
- **Purpose**: Process payments only (not serving the site)
- **Functions**:
  - `create-checkout-session.js` - Creates Stripe checkout
  - `stripe-webhook.js` - Handles payment confirmations

### Payment Provider (Stripe)
- **Mode**: LIVE (processing real payments)
- **Keys Configured**: ✅ Both public and secret keys set
- **Checkout**: Hosted by Stripe (PCI compliant)

## Domain Configuration

### IMPORTANT: Remove Custom Domains from Netlify

You need to **remove** the custom domains from Netlify to avoid conflicts:

1. Go to your [Netlify Domain Management](https://app.netlify.com/sites/jerusalemhills/configuration/domain)
2. Click the **X** or **Remove** button next to:
   - `jerusalemhills.com`
   - `www.jerusalemhills.com`
3. Keep only: `jerusalemhills.netlify.app`

### Why This Setup?

| Component | Location | Reason |
|-----------|----------|---------|
| Store Pages | GitHub Pages | Free hosting, custom domain already works |
| API Functions | Netlify | GitHub Pages can't run server-side code |
| Payments | Stripe | Industry standard, handles all compliance |

## Testing Your Marketplace

### Live Mode Testing (Current)
1. Visit: https://jerusalemhills.com/marketplace.html
2. Click "Buy Now" on any product
3. Enter real credit card info
4. Complete purchase
5. Check Stripe Dashboard for payment

### Test Mode (Recommended for Development)
To switch to test mode:
1. Get test keys from Stripe Dashboard (toggle to Test Mode)
2. Update Netlify environment variables:
   ```bash
   netlify env:set STRIPE_SECRET_KEY "sk_test_..."
   netlify env:set STRIPE_PUBLISHABLE_KEY "pk_test_..."
   ```
3. Update marketplace.html line 153 with test publishable key
4. Use test cards:

| Card Type | Number | CVC | Date | Result |
|-----------|--------|-----|------|--------|
| Success | 4242 4242 4242 4242 | Any | Any future | Payment succeeds |
| Decline | 4000 0000 0000 0002 | Any | Any future | Card declined |
| 3D Secure | 4000 0025 0000 3155 | Any | Any future | Requires authentication |
| Insufficient Funds | 4000 0000 0000 9995 | Any | Any future | Declined: insufficient funds |

## Environment Variables

Currently configured in Netlify:
- `STRIPE_SECRET_KEY` - Your Stripe secret key (live mode)
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `NODE_ENV` - Set to "production" for live mode

### Managing Environment Variables
```bash
# List all variables
netlify env:list

# Update a variable
netlify env:set VARIABLE_NAME "new_value"

# Get a specific variable
netlify env:get STRIPE_SECRET_KEY
```

## File Structure
```
jerusalemhills.github.io/
├── marketplace.html         # Product catalog (GitHub Pages)
├── success.html            # Payment success page
├── cancel.html             # Payment cancelled page
├── netlify/
│   └── functions/
│       ├── create-checkout-session.js  # API endpoint
│       └── stripe-webhook.js          # Payment confirmations
├── netlify.toml            # Netlify configuration
└── package.json            # Dependencies (Stripe SDK)
```

## Adding New Products

Edit the products array in `marketplace.html` (line 156):

```javascript
const products = [
    {
        id: 'prod_1',
        name: 'Product Name',
        description: 'Product description',
        price: 2500, // Price in cents ($25.00)
        currency: 'usd',
        image: 'assets/images/product.jpg',
        priceId: null // Use null for dynamic pricing
    },
    // Add more products here
];
```

## Webhook Setup (For Order Tracking)

### Configure Stripe Webhooks:
1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. **Endpoint URL**: `https://jerusalemhills.netlify.app/.netlify/functions/stripe-webhook`
4. **Events to send**: Select `checkout.session.completed`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to Netlify:
   ```bash
   netlify env:set STRIPE_WEBHOOK_SECRET "whsec_your_secret_here"
   ```

### What Webhooks Do:
- Confirm payment completion
- Trigger order fulfillment (when configured)
- Log successful transactions
- Send email notifications (future)

## Monitoring & Analytics

### Stripe Dashboard
- **Payments**: https://dashboard.stripe.com/payments
- **Events**: https://dashboard.stripe.com/events
- **Customers**: https://dashboard.stripe.com/customers
- **Webhooks**: https://dashboard.stripe.com/webhooks

### Netlify Functions
- **Function Logs**: https://app.netlify.com/sites/jerusalemhills/functions
- **Analytics**: https://app.netlify.com/sites/jerusalemhills/analytics

### Via Command Line
```bash
# View function logs
netlify functions:log create-checkout-session

# Open Netlify dashboard
netlify open

# Check deployment status
netlify status
```

## Troubleshooting

### "CORS Error" when clicking Buy
- Make sure you removed custom domains from Netlify
- Verify the API URL in marketplace.html is correct
- Check that CORS headers are set in the function

### "Missing API Key" Error
- Verify environment variables are set in Netlify
- Redeploy after changing variables:
  ```bash
  netlify deploy --prod
  ```

### Payment Not Showing in Stripe
- Check you're in the right mode (Live vs Test)
- Verify webhook is configured if using fulfillment

### SSL Certificate Errors
- Remove custom domains from Netlify (they conflict with GitHub Pages)
- Use only the netlify.app URL for API calls

## Security Configuration

### What's Automatically Secure
- ✅ SSL/TLS certificates (automatic on both GitHub Pages and Netlify)
- ✅ DDoS protection (Netlify functions)
- ✅ Payment data never touches your servers (Stripe handles all)
- ✅ PCI DSS compliance (Stripe's responsibility)
- ✅ API keys stored encrypted in Netlify
- ✅ CORS restricts API access to jerusalemhills.com only
- ✅ Functions run in isolated containers (AWS Lambda)
- ✅ Automatic security updates (serverless)

### Webhook Security
Always validate webhook signatures:
```javascript
// In stripe-webhook.js
const sig = event.headers['stripe-signature'];
if (!sig) return { statusCode: 401 };

try {
  stripe.webhooks.constructEvent(body, sig, webhookSecret);
} catch (err) {
  return { statusCode: 400, body: 'Invalid signature' };
}
```

### Rate Limiting
- Netlify auto-blocks abusive IPs
- Functions have 10-second timeout
- 125k requests/month on free tier

### Emergency Procedures

#### If API Key is Exposed:
1. **Immediately** go to Stripe Dashboard
2. Roll (regenerate) the exposed key
3. Update in Netlify: `netlify env:set STRIPE_SECRET_KEY "new_key"`
4. Redeploy: `netlify deploy --prod`

#### If Site is Compromised:
1. Rollback in Netlify (one-click in dashboard)
2. Review function logs for suspicious activity
3. Contact: support@netlify.com

### Security Best Practices

**DO:**
- ✅ Keep secrets in environment variables
- ✅ Validate all webhook signatures
- ✅ Use HTTPS everywhere
- ✅ Monitor function logs regularly
- ✅ Test with Stripe test keys first

**DON'T:**
- ❌ Put API keys in code or netlify.toml
- ❌ Log sensitive customer data
- ❌ Skip webhook validation
- ❌ Store customer payment data
- ❌ Handle passwords

## Future Enhancements

### Phase 1 (Current) ✅
- Static product catalog
- Stripe Checkout integration
- Basic payment processing

### Phase 2 (Next)
- Product management interface
- Order tracking
- Email notifications
- Customer database

### Phase 3 (Future)
- Multi-seller support with Stripe Connect
- Amazon MCF integration for fulfillment
- Inventory management
- Advanced analytics

## Quick Commands

```bash
# Deploy changes
git add . && git commit -m "Update" && git push

# Check function logs
netlify functions:log create-checkout-session --tail

# Update environment variable
netlify env:set STRIPE_SECRET_KEY "new_key_here"

# Open dashboards
netlify open  # Netlify dashboard
open https://dashboard.stripe.com  # Stripe dashboard
```

## Support & Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Netlify Functions**: https://docs.netlify.com/functions/overview/
- **GitHub Pages**: https://pages.github.com/
- **This Project**: https://github.com/JerusalemHills/jerusalemhills.github.io

---

**Last Updated**: September 2025
**Status**: LIVE - Processing Real Payments ⚠️
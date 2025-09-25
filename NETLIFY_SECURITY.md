# Netlify Security Configuration

## Security Checklist

### ✅ What Netlify Handles
- [x] SSL/TLS certificates (automatic)
- [x] DDoS protection
- [x] CDN with global distribution
- [x] Automatic security headers
- [x] Function isolation
- [x] Encrypted environment variables

### 🔒 Your Security Setup

#### 1. Environment Variables (NEVER commit these)
```bash
# These go in Netlify dashboard, NOT in code:
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
AMAZON_ACCESS_KEY=AKIA...
AMAZON_SECRET_KEY=...
```

#### 2. Function Security
```javascript
// Always validate webhooks
const sig = event.headers['stripe-signature'];
if (!sig) return { statusCode: 401 };

// Verify Stripe signature
try {
  stripe.webhooks.constructEvent(body, sig, secret);
} catch (err) {
  return { statusCode: 400, body: 'Invalid signature' };
}
```

#### 3. CORS Configuration
```javascript
// Only allow your domain
const headers = {
  'Access-Control-Allow-Origin': 'https://jerusalemhills.com',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST'
};
```

#### 4. Rate Limiting (built-in)
- Netlify auto-blocks abusive IPs
- Functions have 10-second timeout
- 125k requests/month on free tier

## What Makes This Secure?

### Payment Security
- **Stripe handles all card data** - Never touches your servers
- **PCI DSS compliant** - Stripe's responsibility
- **3D Secure ready** - Extra authentication when needed
- **Webhook signatures** - Ensures requests are from Stripe

### Infrastructure Security
- **AWS Lambda backend** - Enterprise-grade
- **Isolated execution** - Functions can't affect each other
- **No server to hack** - Serverless architecture
- **Automatic updates** - No maintenance needed

### Data Protection
- **No database** - No user data to breach
- **No passwords** - Stripe handles authentication
- **No personal info stored** - Only order IDs
- **GDPR compliant** - Minimal data processing

## Monitoring & Alerts

### Netlify Dashboard Shows:
- Function execution logs
- Error rates
- Traffic patterns
- Suspected attacks (auto-blocked)

### Set Up Notifications:
1. Go to "Site settings" → "Notifications"
2. Add email for:
   - Deploy failures
   - Form submissions
   - Function errors

## Emergency Procedures

### If API Key is Exposed:
1. **Immediately** go to Stripe/Amazon dashboard
2. Revoke the key
3. Generate new key
4. Update in Netlify environment variables

### If Site is Compromised:
1. Netlify Support: support@netlify.com
2. Rollback to previous deploy (one click)
3. Review function logs for suspicious activity

## Security Comparison

| Risk | GitHub Pages | Netlify | Your Exposure |
|------|--------------|---------|---------------|
| DDoS | Basic | Advanced | Protected |
| SSL | Yes | Yes | Protected |
| Secrets | Can't store | Encrypted | Protected |
| PCI compliance | N/A | Via Stripe | None |
| Server patches | N/A | Automatic | None |
| Code injection | Low | Low | Low |

## Best Practices

### DO:
✅ Keep secrets in environment variables
✅ Validate all webhook signatures
✅ Use HTTPS everywhere
✅ Monitor function logs
✅ Test with Stripe test keys first

### DON'T:
❌ Put API keys in code
❌ Log sensitive data
❌ Skip webhook validation
❌ Store customer data
❌ Handle passwords

## Quick Security Test

After setup, verify:
```bash
# This should FAIL (no key in code):
curl https://jerusalemhills.com/netlify/functions/create-checkout-session

# This should work (with proper request):
curl -X POST https://jerusalemhills.com/netlify/functions/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"priceId": "price_test"}'
```

## Support Contacts

- **Netlify Support**: support@netlify.com
- **Netlify Status**: status.netlify.com
- **Stripe Security**: security@stripe.com
- **Report vulnerabilities**: security@netlify.com

---

**Bottom Line**: Netlify + Stripe + Amazon MCF is MORE secure than handling payments yourself. You're leveraging enterprise security without the complexity.
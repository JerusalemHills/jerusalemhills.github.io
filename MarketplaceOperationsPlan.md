# Jerusalem Hills Marketplace Integration Plan

**Prepared for internal planning and stakeholder reference**
**Last Updated**: October 2025

---

## 1. Overview

Jerusalem Hills combines an **online community and marketplace** using Amazon's fulfillment and affiliate systems, supported by Stripe for digital or direct-sale items. The site remains fully static, minimizing infrastructure complexity.

**Key Features**:
- Marketplace with affiliate and own-branded products
- Community content (games, news, forum, articles, videos)
- Zero-logistics fulfillment via Amazon
- Secure payments via Stripe for digital/direct sales
- Minimal infrastructure (static website, serverless functions)

---

## 2. Platform Model

Four Amazon programs operate in parallel, under one account login but separate dashboards:

| Program                  | Purpose                               | Who Handles Logistics       |
|--------------------------|---------------------------------------|-----------------------------|
| **Amazon Associates**    | Affiliate links for commission        | Amazon                      |
| **Seller Central + FBA** | Warehouse and fulfillment for owned products | Amazon                      |
| **Merch on Demand**      | Print-on-demand apparel              | Amazon (production & shipping) |
| **KDP**                  | Print-on-demand books                | Amazon (printing & shipping)   |
| **Stripe Checkout**      | Direct payments for digital goods or community contributions | Jerusalem Hills (payment clearing only) |

**All four Amazon programs**:
- Can be managed under the same Amazon login (email)
- Have separate dashboards, reports, and payout schedules
- Require separate registration/setup
- Do NOT automatically share inventory or sales data

---

## 3. Integration With Website

**Site**: `https://jerusalemhills.com`
**Repo**: `https://github.com/JerusalemHills/jerusalemhills.github.io`

The static site lists products via HTML affiliate cards linking directly to Amazon, and optionally uses Stripe Checkout for non-Amazon sales.

**User Journey**:
1. Browse products on JerusalemHills.com
2. Click product card → redirected to Amazon (for Amazon products) OR Stripe Checkout (for direct sales)
3. Purchase securely on Amazon/Stripe
4. Return to JerusalemHills.com success page

**No customer data** is collected or stored on the Jerusalem Hills website.

---

## 4. Amazon Associates Setup

### Registration Steps:
1. Register at [affiliate-program.amazon.com](https://affiliate-program.amazon.com)
2. Provide your website URL: `https://jerusalemhills.com`
3. Obtain your **Associate ID** (e.g., `jerusalemhills-20`)
4. Use Amazon's **SiteStripe** tool to generate affiliate links

### Implementation:
Embed product cards in HTML with affiliate links:

```html
<div class="product-card">
  <img src="https://images-na.ssl-images-amazon.com/images/I/sample.jpg" alt="Product">
  <h4>Jerusalem Stone Mezuzah</h4>
  <p>Authentic handcrafted mezuzah from Israel.</p>
  <a href="https://www.amazon.com/dp/ASIN/?tag=jerusalemhills-20"
     target="_blank"
     class="buy-button">Buy on Amazon</a>
</div>
```

### Product Categories:
- **Judaica & Cultural Art** (mezuzahs, menorahs, artwork)
- **Home & Lifestyle** (kitchenware, décor, Dead Sea products)
- **Games & Education** (board games, puzzles, educational materials)
- **Books & Learning Tools** (religious texts, Hebrew learning, cultural history)

### Tracking & Analytics:
Use different tracking IDs for granular analytics:
- `jerusalemhills-judaica-20`
- `jerusalemhills-games-20`
- `jerusalemhills-books-20`

Monitor performance in the Associates dashboard:
- Clicks per product
- Conversion rates
- Earnings per category

---

## 5. Using FBA (Fulfilled by Amazon)

If Jerusalem Hills produces or curates **physical products**:

### Setup:
1. Open a **Seller Central account** at [sellercentral.amazon.com](https://sellercentral.amazon.com)
2. Choose **FBA (Fulfilled by Amazon)**
3. Ship products in bulk to Amazon's warehouses

### Amazon Handles:
✅ Storage
✅ Order processing
✅ Packaging
✅ Delivery
✅ Returns and customer service

### Benefits:
- No need for local warehousing or shipping logistics
- **Prime eligibility** (increases visibility and trust)
- Seamless integration with affiliate listings — your products can appear alongside affiliate items

### Fees:
- ~$39.99/month for Pro Seller plan
- Referral fees (category-dependent, typically 8-15%)
- FBA fulfillment fees (based on size/weight)

---

## 6. Merch on Demand (Branded Apparel)

Use [Merch on Demand](https://merch.amazon.com/landing) for branded T-shirts, hoodies, mugs, tote bags.

### How It Works:
1. Upload Jerusalem Hills designs (artwork, logos, community motifs)
2. Amazon lists items automatically on Amazon.com
3. No inventory — Amazon prints and ships per order
4. You earn **royalties** directly from sales

### Integration:
List these on your site like affiliate products, linking to your Amazon Merch product page.

---

## 7. KDP (Books, Journals, Magazines)

Use [KDP (Kindle Direct Publishing)](https://kdp.amazon.com) for any printed publications.

### Process:
1. Upload interior (PDF) and cover designs
2. Books appear on Amazon within 72 hours
3. You receive royalties per sale
4. Suitable for:
   - Community-authored works
   - Judaica studies
   - Cultural publications
   - Jerusalem travel guides

---

## 8. Disclosure & Compliance

Amazon requires explicit disclosure. Add this statement to your footer and marketplace pages:

> **"As an Amazon Associate, Jerusalem Hills earns from qualifying purchases."**

### Additional Requirements:
- Product prices should NOT be displayed unless dynamically fetched via Amazon API (or kept approximate)
- Affiliate links must use your Associate ID
- Comply with Amazon's [Operating Agreement](https://affiliate-program.amazon.com/help/operating/agreement)

---

## 9. Stripe Integration (Hybrid Model)

Stripe Checkout complements Amazon programs by processing direct payments for items **not handled via Amazon** — such as:
- Digital downloads
- Community contributions/donations
- Non-affiliate vendor products
- Premium memberships

### Current Setup:
**API Endpoint**: `https://jerusalemhills.netlify.app/.netlify/functions/create-checkout-session`

**Files**:
- `/marketplace.html` - Product catalog with buy buttons
- `/netlify/functions/create-checkout-session.js` - Creates Stripe checkout session
- `/netlify/functions/stripe-webhook.js` - Handles payment confirmations

**How It Works**:
1. User clicks "Buy Now" on a direct-sale product
2. Netlify function creates Stripe checkout session
3. User redirected to Stripe-hosted checkout page
4. Payment processed securely by Stripe
5. User returns to success/cancel page

### Independence:
- Amazon handles fulfillment and customer care for Amazon products
- Stripe handles funds clearing for direct sales
- Both systems operate **independently**
- No user data retention on Jerusalem Hills servers

---

## 10. Future Growth Path

### Phase 1 (Current) ✅
- Static product catalog
- Amazon affiliate links
- Stripe checkout for direct sales

### Phase 2 (Next Steps)
- Dynamic affiliate listings through [Amazon Product Advertising API](https://webservices.amazon.com/paapi5/documentation/)
- Firebase for lightweight user interactions (favorites, comments)
- Expanded Stripe integration for in-house digital products
- Email notifications for orders

### Phase 3 (Advanced)
- Multi-seller support with [Stripe Connect](https://stripe.com/connect)
- Amazon MCF (Multi-Channel Fulfillment) integration
- Inventory management system
- Advanced analytics dashboard
- Community-driven marketing campaigns

---

## 11. Account Relationship Summary

| Program         | Function               | Same Login? | Shared Earnings? | Shared Inventory? |
|-----------------|------------------------|-------------|------------------|-------------------|
| Associates      | Affiliate links        | ✅ Yes       | 🚫 Separate      | 🚫 No             |
| Seller Central  | Physical product sales | ✅ Yes       | 🚫 Separate      | ✅ If FBA         |
| Merch on Demand | Print-on-demand merch  | ✅ Yes       | 🚫 Separate      | 🚫 No             |
| KDP             | Print-on-demand books  | ✅ Yes       | 🚫 Separate      | 🚫 No             |

---

## 12. Key Advantages

✅ **Zero inventory handling** (Amazon manages everything)
✅ **Automated fulfillment, delivery, and customer support** (Amazon)
✅ **Multiple income channels** (affiliate, royalties, direct sales)
✅ **Simple static web structure** — easy maintenance
✅ **Scalable and compliant e-commerce model**
✅ **No PCI compliance burden** (Stripe handles payment data)
✅ **Prime eligibility** for FBA products (increased trust)
✅ **Print-on-demand** (no upfront inventory costs)

---

## 13. Implementation Checklist

### Amazon Associates
- [ ] Register at affiliate-program.amazon.com
- [ ] Obtain Associate ID
- [ ] Add disclosure statement to site footer
- [ ] Create product cards with affiliate links
- [ ] Set up tracking IDs for different categories

### FBA (If Selling Physical Products)
- [ ] Register Seller Central account
- [ ] Choose FBA fulfillment
- [ ] Create product listings
- [ ] Ship inventory to Amazon warehouses
- [ ] Monitor sales and inventory levels

### Merch on Demand
- [ ] Apply for Merch on Demand
- [ ] Upload Jerusalem Hills designs
- [ ] Create product listings
- [ ] Add merch links to website

### KDP
- [ ] Register KDP account
- [ ] Upload book manuscripts and covers
- [ ] Set pricing and distribution
- [ ] Add book links to website

### Stripe (Already Configured)
- [x] Netlify functions deployed
- [x] Stripe keys configured
- [x] CORS headers set
- [x] Webhook endpoint created
- [ ] Test mode verification
- [ ] Live mode verification

---

## 14. Monitoring & Analytics

### Amazon Associates Dashboard
Monitor:
- Click-through rates (CTR)
- Conversion rates
- Earnings per category
- Top-performing products

### Seller Central Dashboard (If Using FBA)
Monitor:
- Inventory levels
- Order fulfillment status
- Customer feedback
- Return rates

### Stripe Dashboard
Monitor:
- Payment success rates
- Failed payments
- Revenue trends
- Customer locations

### Website Analytics (Google Analytics)
Track:
- Product card clicks
- Affiliate link clicks
- Checkout funnel conversion
- Bounce rates on marketplace pages

---

## 15. Summary

Amazon provides complete fulfillment infrastructure; Stripe provides secure payment clearing for digital sales. This hybrid system enables a **zero-logistics, low-maintenance marketplace** combining:

- **Affiliate marketing** (commission-based)
- **Print-on-demand** (no inventory risk)
- **Digital sales** (high-margin)
- **Community engagement** (organic traffic driver)

All within a cohesive static web framework that requires minimal technical maintenance and scales effortlessly.

---

**Status**: Planning Phase
**Next Action**: Register Amazon Associates account and obtain Associate ID
**Priority**: High

---

## Support & Resources

- **Amazon Associates**: https://affiliate-program.amazon.com
- **Seller Central**: https://sellercentral.amazon.com
- **Merch on Demand**: https://merch.amazon.com
- **KDP**: https://kdp.amazon.com
- **Stripe Documentation**: https://stripe.com/docs
- **Netlify Functions**: https://docs.netlify.com/functions/overview/
- **This Project**: https://github.com/JerusalemHills/jerusalemhills.github.io

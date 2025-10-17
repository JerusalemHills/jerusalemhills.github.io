# Jerusalem Hills Operations Guide

**Last Updated**: October 2025

This guide consolidates all operational information for Jerusalem Hills website and marketplace.

---

## Table of Contents

1. [Quick Commands](#quick-commands)
2. [Deployment](#deployment)
3. [Marketplace Operations](#marketplace-operations)
4. [Performance & Optimization](#performance--optimization)
5. [Progressive Web App (PWA)](#progressive-web-app-pwa)
6. [Monitoring & Analytics](#monitoring--analytics)
7. [Troubleshooting](#troubleshooting)

---

## Quick Commands

### Development
```bash
# Local development server
python3 -m http.server 8000
# Visit http://localhost:8000

# Netlify Functions development
netlify dev
# Visit http://localhost:8888
```

### Asset Optimization
```bash
# Optimize images
./optimize-images.sh

# Minify CSS/JS
npm run minify
```

### Deployment
```bash
# Deploy to GitHub Pages (automatic on push to master)
git add .
git commit -m "Your message"
git push origin master

# Deploy Netlify Functions
netlify deploy --prod
```

### Environment Variables (Netlify)
```bash
# List all variables
netlify env:list

# Set a variable
netlify env:set VARIABLE_NAME "value"

# Get a variable
netlify env:get STRIPE_SECRET_KEY
```

---

## Deployment

### Pre-Deployment Checklist

#### Security & Configuration
- [ ] Remove test API keys
- [ ] Verify live Stripe keys configured
- [ ] Check CORS headers allow jerusalemhills.com
- [ ] Verify webhook endpoints configured
- [ ] SSL certificates valid (GitHub Pages & Netlify)
- [ ] Environment variables set in Netlify

#### Content & SEO
- [ ] All images optimized (WebP, compressed)
- [ ] Meta tags updated (title, description, OG tags)
- [ ] Canonical URLs set correctly
- [ ] sitemap.xml updated
- [ ] robots.txt configured
- [ ] Google Analytics ID set
- [ ] AdSense IDs configured (if using)

#### Functionality
- [ ] All navigation links working
- [ ] Shared header loading on all pages
- [ ] YouTube carousel loading videos
- [ ] Marketplace buy buttons functional
- [ ] Success/cancel pages working
- [ ] Mobile menu responsive
- [ ] Hebrew keyboard toggle working

#### Performance
- [ ] Lighthouse score >90 (desktop), >85 (mobile)
- [ ] Images lazy-loaded
- [ ] CSS/JS minified
- [ ] Service worker registered
- [ ] PWA manifest valid

#### Testing
- [ ] Test Stripe checkout (test mode)
- [ ] Verify email notifications
- [ ] Test on mobile devices
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] 404 page working

### Deployment Workflow

**GitHub Pages** (Static Files):
1. Push to `master` branch
2. GitHub Actions auto-deploy
3. Site live at https://jerusalemhills.com (5-10 min)

**Netlify Functions** (Serverless API):
1. Link GitHub repo to Netlify OR use CLI
2. Set environment variables in Netlify dashboard
3. Deploy: `netlify deploy --prod`

**Important**: Never push `.env` file to Git (included in `.gitignore`)

---

## Marketplace Operations

### Architecture Overview

```
GitHub Pages (Static)          Netlify (Serverless)         Stripe/Amazon
├─ index.html            ───▶  /.netlify/functions/  ───▶  Payment Processing
├─ marketplace.html            create-checkout-session
├─ success.html                stripe-webhook
└─ cancel.html                                        ───▶  Amazon Affiliate Links
```

### Revenue Streams

| Stream | Platform | Logistics | Status |
|--------|----------|-----------|--------|
| **Affiliate Sales** | Amazon Associates | Amazon | Setup Pending |
| **Physical Products** | Amazon FBA | Amazon | Setup Pending |
| **Branded Apparel** | Merch on Demand | Amazon | Setup Pending |
| **Books** | Amazon KDP | Amazon | Setup Pending |
| **Digital Sales** | Stripe | Self | ✅ LIVE |

---

### Amazon Integration

#### Amazon Associates (Affiliate Program)

**Setup**:
1. Register at [affiliate-program.amazon.com](https://affiliate-program.amazon.com)
2. Provide website URL: `https://jerusalemhills.com`
3. Obtain Associate ID (e.g., `jerusalemhills-20`)
4. Use SiteStripe to generate affiliate links

**Implementation**:
```html
<div class="product-card">
  <img src="product-image.jpg" alt="Product">
  <h4>Product Name</h4>
  <p>Description</p>
  <a href="https://www.amazon.com/dp/ASIN/?tag=jerusalemhills-20"
     target="_blank">Buy on Amazon</a>
</div>
```

**Required Disclosure**:
> "As an Amazon Associate, Jerusalem Hills earns from qualifying purchases."

Place in footer and on marketplace pages.

**Categories**:
- Judaica & Cultural Art
- Home & Lifestyle
- Games & Education
- Books & Learning

**Tracking IDs** (for analytics):
- `jerusalemhills-judaica-20`
- `jerusalemhills-games-20`
- `jerusalemhills-books-20`

---

#### Amazon FBA (Fulfilled by Amazon)

**When to Use**: Selling physical inventory

**Setup**:
1. Register at [sellercentral.amazon.com](https://sellercentral.amazon.com)
2. Choose FBA fulfillment
3. Create product listings
4. Ship inventory to Amazon warehouses

**Amazon Handles**:
- Storage
- Packaging
- Shipping
- Returns
- Customer service

**Fees**:
- ~$39.99/month Pro Seller plan
- Referral fees (8-15% category-dependent)
- FBA fulfillment fees (size/weight based)

---

#### Merch on Demand

**Purpose**: Print-on-demand branded apparel

**Setup**:
1. Apply at [merch.amazon.com](https://merch.amazon.com)
2. Upload designs (logos, artwork)
3. Amazon auto-lists on Amazon.com
4. Earn royalties per sale

**Products**: T-shirts, hoodies, mugs, tote bags

---

#### Amazon KDP (Kindle Direct Publishing)

**Purpose**: Print-on-demand books

**Setup**:
1. Register at [kdp.amazon.com](https://kdp.amazon.com)
2. Upload manuscript (PDF) and cover
3. Set pricing and distribution
4. Books live on Amazon within 72 hours

**Use Cases**:
- Community publications
- Judaica studies
- Jerusalem travel guides
- Cultural history books

---

### Stripe Integration (Direct Sales)

**Current Setup**:
- **API Endpoint**: `https://jerusalemhills.netlify.app/.netlify/functions/create-checkout-session`
- **Mode**: LIVE (processing real payments)
- **Keys**: Configured in Netlify environment variables

**Functions**:
- `create-checkout-session.js` - Creates Stripe checkout session
- `stripe-webhook.js` - Handles payment confirmations

**Environment Variables** (Netlify):
- `STRIPE_SECRET_KEY` - Secret key (live mode)
- `STRIPE_PUBLISHABLE_KEY` - Public key
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret

**Webhook Setup**:
1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://jerusalemhills.netlify.app/.netlify/functions/stripe-webhook`
3. Select event: `checkout.session.completed`
4. Copy signing secret and add to Netlify

---

### Adding Products

#### Stripe Products (marketplace.html)

Edit products array (line ~741):

```javascript
const products = [
    {
        id: 'prod_unique_id',
        name: 'Product Name',
        category: 'judaica',
        categoryName: 'Judaica',
        description: 'Product description',
        price: 12500, // Price in cents ($125.00)
        currency: 'usd',
        image: '/path/to/image.jpg',
        badge: 'New Arrival', // or null
        inStock: true
    },
];
```

#### Amazon Affiliate Products

Add product card with affiliate link:

```html
<div class="card">
  <img src="product.jpg" alt="Product">
  <h4>Product Name</h4>
  <p class="price">$XX.XX</p>
  <a href="https://amazon.com/dp/ASIN/?tag=jerusalemhills-20">Buy on Amazon</a>
</div>
```

---

## Performance & Optimization

### Image Optimization

**Before Deployment**:
```bash
./optimize-images.sh
```

**Best Practices**:
- Use WebP format for modern browsers
- Provide fallback formats (JPEG/PNG)
- Compress images (80-85% quality)
- Use responsive images with srcset
- Lazy load below-the-fold images

**Example**:
```html
<img src="image.webp"
     alt="Description"
     loading="lazy"
     onerror="this.src='image.jpg'">
```

---

### CSS/JS Minification

```bash
npm run minify
# Or
./minify-assets.sh
```

---

### Lazy Loading

Images below the fold use `loading="lazy"`:

```html
<img src="image.jpg" alt="Description" loading="lazy">
```

YouTube iframes use lazy loading:
```html
<iframe src="..." loading="lazy"></iframe>
```

---

## Progressive Web App (PWA)

### Current PWA Status

Jerusalem Hills is **currently configured as a Progressive Web App** with the following features:

✅ **Implemented**:
- Service Worker for offline functionality
- Web App Manifest for installability
- HTTPS hosting (via GitHub Pages)
- Offline fallback page
- Asset caching strategy
- Push notification support (framework ready)

⚠️ **Needs Improvement**:
- Manifest file missing key metadata (name, icons incomplete)
- Service worker cache list may be outdated
- Install prompt not explicitly handled
- No install button in UI

---

### What Makes a True PWA?

A Progressive Web App must meet these core requirements:

1. **HTTPS** - Secure connection (✅ provided by GitHub Pages)
2. **Service Worker** - JavaScript worker for offline/caching (✅ implemented)
3. **Web App Manifest** - JSON file with app metadata (⚠️ incomplete)
4. **Responsive Design** - Works on all screen sizes (✅ implemented)
5. **App-like Experience** - Full-screen, installable (⚠️ partial)

---

### Implementation Checklist

#### ✅ Already Implemented

**Service Worker** (`/service-worker.js`):
- Caches essential files on install
- Intercepts network requests (cache-first strategy)
- Serves `/offline.html` when network unavailable
- Removes old caches on activation
- Push notification handlers ready

**Offline Page** (`/offline.html`):
- Clean UI with retry button
- Auto-reload when connection restored
- Lists cached features available offline

**HTTPS**:
- GitHub Pages provides automatic HTTPS
- Required for service worker registration

#### ⚠️ Needs Configuration

**Web App Manifest** (`/img/site.webmanifest`):

Current state (incomplete):
```json
{
  "name": "",
  "short_name": "",
  "icons": [
    {"src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png"}
  ],
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "display": "standalone"
}
```

**Required fixes**:
```json
{
  "name": "Jerusalem Hills",
  "short_name": "JHills",
  "description": "Celebrating Jerusalem's heritage through community, culture, and commerce",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#91D9F8",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/img/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/img/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

**Service Worker Cache List** (`/service-worker.js` line 3-25):

Current cache may reference old files. Update `urlsToCache` array to match current file structure:
```javascript
const urlsToCache = [
  '/',
  '/index.html',
  '/marketplace.html',
  '/offline.html',
  '/styles-new.css',
  '/script-new.js',
  '/img/1.svg',
  '/components/header.html',
  '/js/load-header.js',
  '/js/mobile-nav.js',
  '/js/analytics.js',
  '/favicon.ico',
  '/img/favicon-32x32.png',
  '/img/favicon-16x16.png',
  '/img/apple-touch-icon.png',
  '/img/android-chrome-192x192.png',
  '/img/android-chrome-512x512.png',
  '/img/site.webmanifest'
];
```

---

### PWA Installation

#### How Users Install

**Desktop (Chrome/Edge)**:
1. Visit https://jerusalemhills.com
2. Click install icon in address bar (⊕ or computer icon)
3. Confirm "Install Jerusalem Hills"
4. App opens in standalone window

**Mobile (Chrome/Safari)**:
1. Visit site in browser
2. **Android**: Tap "Add to Home Screen" from menu
3. **iOS**: Tap Share → "Add to Home Screen"
4. App icon appears on home screen

#### Adding Install Prompt (Optional Enhancement)

Add install button to UI for better discoverability:

```javascript
// In main JS file
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent default mini-infobar
  e.preventDefault();
  deferredPrompt = e;

  // Show install button in UI
  const installBtn = document.getElementById('install-button');
  installBtn.style.display = 'block';

  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response: ${outcome}`);
      deferredPrompt = null;
      installBtn.style.display = 'none';
    }
  });
});
```

---

### Testing PWA Functionality

#### Lighthouse Audit
```bash
# In Chrome DevTools:
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Progressive Web App" category
4. Click "Generate report"
5. Target score: 90+ (currently estimated: 75-80)
```

#### Manual Testing

**Service Worker**:
1. Visit site: https://jerusalemhills.com
2. Open DevTools → Application → Service Workers
3. Verify "jerusalem-hills-v2" is activated and running
4. Check "Offline" box in DevTools → Network tab
5. Reload page - should show offline.html

**Manifest**:
1. DevTools → Application → Manifest
2. Verify all fields populated correctly
3. Check icons load properly

**Installation**:
1. Desktop: Click install icon in address bar
2. Mobile: Add to home screen
3. Launch installed app
4. Verify runs in standalone mode (no browser UI)

**Offline Mode**:
```bash
# Test cached pages work offline:
1. Visit homepage and marketplace
2. Turn off WiFi/enable airplane mode
3. Try navigating - cached pages should load
4. Try uncached page - should show offline.html
```

---

### PWA Maintenance

#### Updating Cached Files

When adding new pages or changing file names:

1. Edit `/service-worker.js`
2. Update `CACHE_NAME` version (e.g., 'v2' → 'v3')
3. Update `urlsToCache` array with new files
4. Deploy changes
5. Old cache automatically deleted on activation

Example:
```javascript
// Change version to invalidate old cache
const CACHE_NAME = 'jerusalem-hills-v3'; // Was v2

// Add new files
const urlsToCache = [
  '/',
  '/new-page.html',  // NEW
  // ... rest of files
];
```

#### Clearing User Caches

If users report stale content:

**User Instructions**:
1. Open site
2. Open browser DevTools (F12)
3. Go to Application → Storage
4. Click "Clear site data"
5. Reload page

**Or via browser settings**:
- Chrome: Settings → Privacy → Clear browsing data → Cached images and files

---

### PWA Best Practices

**Do**:
- ✅ Keep service worker cache list updated
- ✅ Increment cache version when updating files
- ✅ Test offline functionality before deployment
- ✅ Provide meaningful offline experience
- ✅ Use HTTPS everywhere (required for PWA)

**Don't**:
- ❌ Cache dynamic API responses in service worker
- ❌ Cache authentication tokens
- ❌ Forget to update manifest when branding changes
- ❌ Block users from accessing site if service worker fails

---

### Push Notifications (Future Enhancement)

Service worker includes push notification handlers (lines 93-122).

**To Enable**:
1. Get VAPID keys from push service (e.g., Firebase Cloud Messaging)
2. Request notification permission from user
3. Subscribe user to push notifications
4. Send notifications via server/Netlify function

**Example Implementation**:
```javascript
// Request permission
const permission = await Notification.requestPermission();
if (permission === 'granted') {
  // Subscribe to push service
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
  });
  // Send subscription to server
}
```

---

### Troubleshooting

**Service Worker Not Registering**:
- Check browser console for errors
- Verify HTTPS enabled (required)
- Ensure `/service-worker.js` path correct
- Clear browser cache and retry

**Install Prompt Not Showing**:
- Desktop: Manifest must be valid and all criteria met
- Mobile: May take 2+ visits for Chrome to show prompt
- iOS: No automatic prompt, user must manually "Add to Home Screen"

**Offline Page Not Showing**:
- Check `/offline.html` exists
- Verify included in service worker cache list
- Test with DevTools offline mode

**Icons Not Appearing**:
- Verify icon files exist at paths in manifest
- Check icon sizes match manifest (192x192, 512x512)
- Use PNG format (required for Android)
- iOS needs `apple-touch-icon.png` in `<head>`

**Stale Content After Update**:
- Increment `CACHE_NAME` version in service worker
- Service worker will auto-delete old cache
- Users may need to close all tabs and reopen

---

### SEO Best Practices

**Meta Tags** (all pages):
```html
<meta name="description" content="Page description (150-160 chars)">
<meta name="keywords" content="keyword1, keyword2, keyword3">
<link rel="canonical" href="https://jerusalemhills.com/page.html">

<!-- Open Graph -->
<meta property="og:title" content="Page Title">
<meta property="og:description" content="Description">
<meta property="og:image" content="https://jerusalemhills.com/image.jpg">
<meta property="og:url" content="https://jerusalemhills.com/page.html">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Page Title">
<meta name="twitter:description" content="Description">
<meta name="twitter:image" content="https://jerusalemhills.com/image.jpg">
```

**Sitemap**: `/sitemap.xml` (update when adding pages)

**Robots**: `/robots.txt` (controls crawler access)

---

## Monitoring & Analytics

### Google Analytics

**Configuration**: `/js/analytics.js`

**Measurement ID**: Replace `G-XXXXXXXXXX` with actual ID

**Events Tracked**:
- Page views (automatic)
- E-commerce events (configured)
- Custom events (as needed)

---

### Stripe Dashboard

Monitor:
- [Payments](https://dashboard.stripe.com/payments)
- [Events](https://dashboard.stripe.com/events)
- [Customers](https://dashboard.stripe.com/customers)
- [Webhooks](https://dashboard.stripe.com/webhooks)

---

### Netlify Functions

**Function Logs**:
```bash
netlify functions:log create-checkout-session --tail
```

**Dashboard**: https://app.netlify.com/sites/jerusalemhills

---

### Amazon Associates Dashboard

Monitor:
- Click-through rates (CTR)
- Conversion rates
- Earnings per category
- Top-performing products

---

### Google Search Console

- Verify at [search.google.com/search-console](https://search.google.com/search-console)
- Monitor search performance
- Fix indexing issues
- Submit sitemap

---

## Troubleshooting

### Shared Header Not Showing

**Symptoms**: Header missing on page load

**Causes**:
1. JavaScript loading before DOM ready
2. Incorrect script placement
3. Missing header-placeholder div

**Fix**:
1. Ensure `<div id="header-placeholder"></div>` exists in body
2. Load script AFTER placeholder:
   ```html
   <div id="header-placeholder"></div>
   <script src="/js/load-header.js"></script>
   ```
3. Check browser console for errors

---

### YouTube Carousel Not Loading

**Symptoms**: Videos not appearing

**Causes**:
1. Invalid API key
2. Incorrect playlist ID
3. API quota exceeded
4. CORS issues

**Fix**:
1. Verify API key: `AIzaSyB5_m5vWCLhVcPKlItsT62fMB_bk2YyHIs`
2. Verify playlist ID: `PLZkWvmItga8Uke86j0__CT5IxPACfvCFy`
3. Check browser console for errors
4. Verify YouTube API is enabled in Google Cloud Console

---

### Stripe Payment Failing

**Symptoms**: "Buy Now" button doesn't work or shows error

**Causes**:
1. CORS error (incorrect API endpoint)
2. Missing API keys
3. Webhook not configured
4. Test mode vs live mode mismatch

**Fix**:
1. Verify API URL: `https://jerusalemhills.netlify.app/.netlify/functions/create-checkout-session`
2. Check environment variables in Netlify:
   ```bash
   netlify env:list
   ```
3. Verify keys match mode (test vs live)
4. Check Netlify function logs for errors

---

### CORS Errors

**Symptoms**: API calls blocked by browser

**Cause**: Incorrect CORS headers

**Fix**:
Ensure Netlify function includes:
```javascript
headers: {
  'Access-Control-Allow-Origin': 'https://jerusalemhills.com',
  'Access-Control-Allow-Headers': 'Content-Type'
}
```

---

### Images Not Loading

**Symptoms**: Broken image icons

**Causes**:
1. Incorrect file path
2. Missing image file
3. Case-sensitive filename mismatch

**Fix**:
1. Verify file exists: `ls -la /path/to/image.jpg`
2. Check path matches exactly (case-sensitive)
3. Use onerror fallback:
   ```html
   <img src="image.jpg" onerror="this.src='fallback.jpg'">
   ```

---

### Mobile Menu Not Working

**Symptoms**: Hamburger menu doesn't open

**Causes**:
1. JavaScript not loaded
2. Header component not initialized
3. Lucide icons not rendering

**Fix**:
1. Check `/js/mobile-nav.js` is loaded
2. Verify header loaded: `document.dispatchEvent(new CustomEvent('headerLoaded'))`
3. Initialize Lucide icons: `lucide.createIcons()`

---

## Security

### API Key Management

**DO**:
- ✅ Store keys in Netlify environment variables
- ✅ Use test keys for development
- ✅ Rotate keys if exposed

**DON'T**:
- ❌ Commit keys to Git
- ❌ Put keys in client-side code
- ❌ Share keys in documentation

---

### Emergency Procedures

**If API Key Exposed**:
1. Immediately go to Stripe Dashboard
2. Roll (regenerate) the exposed key
3. Update in Netlify: `netlify env:set STRIPE_SECRET_KEY "new_key"`
4. Redeploy: `netlify deploy --prod`

**If Site Compromised**:
1. Rollback deployment in Netlify dashboard
2. Review function logs for suspicious activity
3. Change all API keys
4. Contact: support@netlify.com

---

## Support & Resources

### Documentation
- **This Guide**: OPERATIONS.md
- **Project Overview**: README.md
- **AI Assistant Guide**: CLAUDE.md

### External Resources
- **GitHub Repo**: https://github.com/JerusalemHills/jerusalemhills.github.io
- **Live Site**: https://jerusalemhills.com
- **Stripe Docs**: https://stripe.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Amazon Associates**: https://affiliate-program.amazon.com

### Dashboards
- **Netlify**: https://app.netlify.com/sites/jerusalemhills
- **Stripe**: https://dashboard.stripe.com
- **Google Analytics**: https://analytics.google.com
- **Google Search Console**: https://search.google.com/search-console

---

**Maintained by**: Jerusalem Hills Development Team
**Last Major Update**: October 2025

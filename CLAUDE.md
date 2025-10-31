# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 PROJECT TODO LIST

**Primary Reference:** `COMPREHENSIVE_TODO_MASTER.md`

Use this comprehensive master file for all task planning and progress tracking. It consolidates 280+ tasks from all project documentation including:
- Implementation plans
- Feature roadmaps  
- Bug fixes and enhancements
- Performance optimizations
- Testing requirements

All todo items are categorized by priority and include detailed implementation guidance.

## Project Overview

Jerusalem Hills is a **static e-commerce and community platform** celebrating Jerusalem's heritage. The architecture uses GitHub Pages for static hosting with Netlify Functions for serverless payment processing via Stripe.

**Tech Stack:**
- Frontend: Vanilla HTML5, CSS3, JavaScript (no frameworks)
- Backend: Netlify Functions (Node.js serverless)
- Payments: Stripe Checkout API
- Hosting: GitHub Pages (static) + Netlify (serverless API)
- Deployment: Git push to `master` branch auto-deploys

## Development Commands

### Local Development
```bash
# Static file server (for HTML/CSS/JS development)
python3 -m http.server 8000
# Visit http://localhost:8000

# Netlify Functions development (for Stripe integration testing)
netlify dev
# Visit http://localhost:8888
```

### Asset Optimization
```bash
# Optimize images (converts to WebP, compresses, creates responsive sizes)
./optimize-images.sh

# Minify CSS/JS assets
npm run minify
# Or use the shell script:
./minify-assets.sh
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

## Architecture & Key Files

### Hybrid Static/Dynamic Architecture
```
GitHub Pages (Static)          Netlify (Serverless)         Stripe (External)
├─ index.html            ───▶  /.netlify/functions/  ───▶  Checkout API
├─ marketplace.html            create-checkout-session.js
├─ success.html                stripe-webhook.js
└─ cancel.html
```

### Critical Integration Points

**1. Stripe Checkout Flow** (`marketplace.html` + `netlify/functions/create-checkout-session.js`):
- Frontend: Product cards with "Buy Now" buttons call the serverless function
- Function: Creates Stripe checkout session with product details
- Redirect: Customer redirected to Stripe-hosted checkout
- Return: Success → `success.html`, Cancel → `cancel.html`

**2. Environment Configuration** (`.env.example`, `netlify.toml`):
- Stripe keys must be set in Netlify dashboard (never commit secrets)
- Google Analytics ID configured in `/js/analytics.js`
- AdSense IDs in `/js/adsense-config.js`

**3. Service Worker** (`service-worker.js`):
- PWA functionality for offline access
- Caches static assets for performance
- Serves `offline.html` when network unavailable

### Directory Structure
```
/
├── index.html                    # Main homepage with card-based design
├── marketplace.html              # E-commerce storefront (Stripe integration)
├── success.html, cancel.html     # Payment flow pages
├── games/
│   ├── backgammon/              # Full backgammon implementation
│   │   ├── backgammon.html
│   │   └── scripts/backgammon.js
│   ├── tetris/tetris.html
│   └── snake/snake.html
├── css/
│   └── styles.css               # Main stylesheet (shared across pages)
├── js/
│   ├── main.js                  # Core JS (Google Maps, PWA registration)
│   ├── analytics.js             # Google Analytics 4 integration
│   ├── adsense-config.js        # Ad configuration
│   └── search.js                # Site-wide search functionality
├── netlify/
│   └── functions/               # Serverless payment processing
│       ├── create-checkout-session.js
│       └── stripe-webhook.js
├── netlify.toml                 # Netlify configuration & headers
└── service-worker.js            # PWA offline support
```

## Important Patterns & Conventions

### No Build Step Philosophy
This project intentionally **avoids build tools** for simplicity and GitHub Pages compatibility. All code runs directly in browsers:
- Use vanilla JavaScript (ES6+ is fine, supported by modern browsers)
- CSS is hand-written (no preprocessors)
- Images optimized via shell scripts, not webpack

### Stripe Payment Integration
When working with marketplace features:
1. Product data is hardcoded in `marketplace.html` (static catalog)
2. Checkout button triggers fetch to `/.netlify/functions/create-checkout-session`
3. Function uses `STRIPE_SECRET_KEY` from Netlify env vars
4. Never commit Stripe keys - use `.env.example` as template

**Test Mode:**
- Use Stripe test keys (pk_test_..., sk_test_...)
- Test card: 4242 4242 4242 4242, any future date, any CVC

### Responsive Design Breakpoints
```css
/* Mobile first - base styles are mobile */
@media (min-width: 480px)  { /* Small tablets */ }
@media (min-width: 768px)  { /* Tablets */ }
@media (min-width: 1024px) { /* Desktop */ }
```

### PWA Features
- Service worker caches assets for offline use
- Manifest.json defines app metadata
- Install prompt available on mobile devices

## Common Development Tasks

### Adding a New Product to Marketplace
1. Edit `marketplace.html`
2. Add product card HTML in the products grid section
3. Include product image in `/img/` or `/assets/images/`
4. Set `data-price-id` attribute (Stripe Price ID) OR use dynamic pricing in checkout function
5. Ensure "Buy Now" button has class `buy-button` for event listener

### Modifying Navigation
- Navigation is **duplicated** in each HTML file (no shared header component)
- To change nav globally, update all HTML files or create a script to inject shared header
- Mobile menu logic in `/js/mobile-nav.js`

### Performance Optimization
Before deploying major changes:
```bash
./optimize-images.sh           # Optimize new images
npm run minify                # Minify JS/CSS
# Test with: Google PageSpeed Insights
# Target: 90+ desktop, 85+ mobile
```

### Testing Netlify Functions Locally
```bash
# Install Netlify CLI if not installed
npm install -g netlify-cli

# Run dev server with functions
netlify dev

# Functions available at:
# http://localhost:8888/.netlify/functions/create-checkout-session
```

## Deployment Workflow

### GitHub Pages (Static Files)
1. Push to `master` branch
2. GitHub Pages auto-deploys (5-10 min)
3. Site live at https://jerusalemhills.com

### Netlify Functions (Serverless API)
1. Link GitHub repo to Netlify OR use CLI
2. Set environment variables in Netlify dashboard:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
3. Deploy: `netlify deploy --prod`

**CRITICAL:** Never push `.env` file to Git (included in `.gitignore`)

## Security & Compliance

### Sensitive Data
- All payment data handled by Stripe (PCI compliant)
- No credit cards stored on our servers
- Secrets managed via Netlify environment variables

### CORS Configuration
Netlify functions include CORS headers allowing `https://jerusalemhills.com`:
```javascript
'Access-Control-Allow-Origin': 'https://jerusalemhills.com'
```
Update this if domain changes.

### Content Security Policy
Defined in `netlify.toml` - allows Stripe scripts and checkout iframe:
```
script-src 'self' 'unsafe-inline' https://js.stripe.com
frame-src 'self' https://checkout.stripe.com
```

## Key Files Reference

### Configuration Files
- `netlify.toml` - Netlify build settings, headers, redirects
- `package.json` - npm scripts for minification
- `.gitignore` - Excludes node_modules, .env, .netlify
- `CNAME` - Domain configuration for GitHub Pages

### Documentation
- `README.md` - Comprehensive project documentation
- `DEPLOYMENT_CHECKLIST.md` - Pre-launch checklist
- `MARKETPLACE_DOCUMENTATION.md` - Stripe integration details

### Scripts
- `optimize-images.sh` - Image compression (WebP conversion, resizing)
- `minify-assets.sh` - CSS/JS minification
- `verify_domain.sh` - Domain verification helper

## Games Architecture

The backgammon game (`/games/backgammon/`) is a **fully functional local multiplayer implementation**:
- Pure JavaScript game logic (no external game libraries)
- Drag-and-drop interface for piece movement
- Mobile-friendly touch controls
- Future enhancement: GunDB for online multiplayer

Other games (Tetris, Snake) are simpler implementations for demonstration purposes.

## Analytics & Tracking

### Google Analytics 4
- Configured in `/js/analytics.js`
- Automatically tracks page views and e-commerce events
- **Before production:** Replace `G-XXXXXXXXXX` with real measurement ID

### AdSense
- Ad slots configured in `/js/adsense-config.js`
- **Before production:** Replace placeholder slot IDs with actual AdSense slots

## Troubleshooting

### Stripe Checkout Not Working
1. Check Netlify environment variables are set
2. Verify CORS headers in function response
3. Check browser console for errors
4. Test with Stripe test mode first

### Images Not Optimizing
```bash
# Install dependencies if missing
sudo apt-get install imagemagick webp

# Run optimization
./optimize-images.sh
```

### Service Worker Cache Issues
```javascript
// Clear cache in browser console:
caches.keys().then(keys => keys.forEach(key => caches.delete(key)))
```

### Netlify Functions 500 Error
- Check Netlify function logs in dashboard
- Ensure `stripe` npm package installed (`npm install`)
- Verify environment variables are set correctly

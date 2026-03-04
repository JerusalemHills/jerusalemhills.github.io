# 🎯 COMPREHENSIVE TODO MASTER - JERUSALEM HILLS PLATFORM

**Last Updated:** March 4, 2026
**Total Items:** 350+ consolidated tasks
**Current Status:** 🚀 Revenue-first strategy — integrated from mkt-research business plan
**Primary Reference:** `mkt-research/decisions/jh-proposed-updates.md`, `mkt-research/todo.md`, `mkt-research/README.md`

> **New direction: Personalized products, crypto payments, and e-commerce growth are the #1 priority. Community features (games, forum, multiplayer) continue on a maintenance track.**

---

## 📊 **RECENT COMPLETIONS** ✅

### October-November 2025 Major Achievements
- ✅ **Hebrew Virtual Keyboard Fixed**: Permutations game now properly inserts Hebrew letters
- ✅ **Font Size Improvements**: All games now have 20-30% larger, more readable text
- ✅ **Games Card Link Fixed**: Main page now correctly links to games index instead of backgammon
- ✅ **Mobile Hamburger Menu**: Fixed functionality across all devices
- ✅ **PWA Implementation**: Enhanced Kids Zone with separate installable app
- ✅ **Live Views Page**: Emergency alerts and webcams integration
- ✅ **Hebrew Wordle**: Complete implementation with frequency-based words
- ✅ **Kids Zone Historical Map**: Professional quality with enhanced geography
- ✅ **Jerusalem Hills Kids Logo**: Beautiful SVG recreation from PNG source
- ✅ **Forum Enhancement**: Live content integration replacing placeholders
- ✅ **Legal Compliance**: Comprehensive international disclaimers and protection
- ✅ **Accessibility Enhancements**: Comprehensive screen reader support, ARIA labels, keyboard navigation
- ✅ **Mobile Touch Controls**: Advanced touch gestures, drag-and-drop, vibration feedback for all games

---

## 🔥 **WEEK 1 — IMMEDIATE PRIORITIES**

### Quick Wins (< 1 hour total)
- [ ] **QUICK WIN**: Fix GA placeholder ID (5 min, proper tracking)
- [ ] **QUICK WIN**: Submit sitemap to Google (10 min, huge SEO impact)
- [ ] **QUICK WIN**: Add Bing Webmaster verification (15 min, SEO)
- [ ] **QUICK WIN**: Enable Stripe USDC stablecoin payments in Stripe Dashboard (config change, no code — saves 1.4% per transaction)
  - Settings → Payment Methods → enable USDC, USDP, USDG
  - Select networks: Base, Polygon, Ethereum (Solana optional)
  - Test in dev: verify USDC option appears on Stripe Checkout

### Week 1 Deliverables
- [ ] **INFRA**: Sign up for Gooten account (free) — get API key, set webhook endpoint
- [ ] **INFRA**: Sign up for Cloudinary account (free tier: 25GB) — get API credentials for upload-from-URL
- [ ] **INFRA**: Start shared product infrastructure (details in next section)
- [ ] **NAV**: Create `/personalized/index.html` landing page with 3 product cards
- [ ] **NAV**: Add "Personalized Gifts" to site navigation between Marketplace and Forum (including mobile hamburger menu)
- [ ] **NAV**: Add featured personalized products section to homepage (`index.html`)
- [ ] **NAV**: Add "Custom & Personalized" category to marketplace filters (`marketplace.html`)

---

## 🎁 **PERSONALIZED PRODUCTS — SHARED INFRASTRUCTURE** (Priority: Critical — Week 1)

> All three products share checkout, export, preview, and fulfillment. Build once.

### Canvas Export (`/personalized/js/shared/canvas-export.js`)
- [ ] **INFRA**: Build `exportCanvasToImage(canvas, dpi, format)` — returns base64 PNG at 300 DPI (print) / 150 DPI (digital)
- [ ] **INFRA**: Build `generatePDF(imageUrl, metadata)` — wraps image in PDF with title/date/attribution
- [ ] **INFRA**: Cloudinary upload function — send base64 to Cloudinary free tier, get permanent URL for POD fulfillment

### Checkout (`/personalized/js/shared/checkout.js`)
- [ ] **INFRA**: Build digital vs physical price selection (digital $20-30, physical $45-90) with radio buttons
- [ ] **INFRA**: On checkout: capture all customization state (date, location, name, styles)
- [ ] **INFRA**: POST to `/create-checkout-session` with `metadata: { productType, customization: {...}, fulfillmentMethod: "digital"|"physical" }`

### Preview (`/personalized/js/shared/preview.js`)
- [ ] **INFRA**: Real-time canvas preview as user changes inputs
- [ ] **INFRA**: Debounce canvas re-render to 300ms to avoid lag on rapid input changes
- [ ] **INFRA**: Responsive canvas size: 70vw on desktop, 95vw on mobile

### Netlify Functions — Modify Existing
- [ ] **INFRA**: Modify `create-checkout-session.js` — accept `productType`, `customization` (JSON), `fulfillmentMethod`; embed in Stripe session metadata
- [ ] **INFRA**: Modify `stripe-webhook.js` — on `checkout.session.completed`: if digital → call `send-email.js` with download link; if physical → call `create-gooten-order.js`

### Netlify Functions — Create New
- [ ] **INFRA**: Create `send-email.js` — order confirmation + time-limited download link (7 days). Uses Mailgun/SendGrid/Formspree free tier
- [ ] **INFRA**: Create `create-gooten-order.js` — POST to `https://api.gooten.com/orders` with image URL + shipping address + product SKU. Return Gooten order ID
- [ ] **INFRA**: Create `gooten-webhook.js` — receive shipping/tracking updates from Gooten, send customer tracking email

---

## ⭐ **STAR MAP GENERATOR** (Priority: Critical — Week 1-2)

> Proven $50M+/yr Etsy category. Jewish-occasion angle (Bar Mitzvah, Chuppah, baby naming) has virtually no competition.

### Data
- [ ] **STAR MAP**: Download Yale Bright Star Catalog, convert to `/personalized/data/star-catalog.json`
  - ~9,000 stars at magnitude ≤ 6.5 (naked-eye visible)
  - Format: `[{ra, dec, magnitude, name, spectralType}, ...]`

### Core Generator (`/personalized/js/star-map-generator.js`)
- [ ] **STAR MAP**: Implement Julian date calculation from user's date input
- [ ] **STAR MAP**: Implement Greenwich Sidereal Time → Local Sidereal Time (based on longitude)
- [ ] **STAR MAP**: Implement equatorial → horizontal coordinate transform (RA/Dec + LST + latitude → Alt/Az)
- [ ] **STAR MAP**: Implement stereographic projection (Alt/Az → 2D canvas coordinates)
- [ ] **STAR MAP**: Render stars sized by magnitude (brighter = larger circle), colored by spectral type
- [ ] **STAR MAP**: Add optional constellation lines connecting named star groups
- [ ] **STAR MAP**: Add optional Milky Way band as light gradient across projection

### Location & UX
- [ ] **STAR MAP**: Integrate Nominatim geocoding API (city name → lat/long, free, no key required)
  - `https://nominatim.openstreetmap.org/search?city={city}&format=json`
  - Fallback: manual lat/long input if city not found

### Customizer Page (`/personalized/star-map.html`)
- [ ] **STAR MAP**: Create customizer page — left panel: date picker, location search, title/subtitle, color scheme (dark/navy-gold/light/minimal), frame shape (circular/rectangular)
- [ ] **STAR MAP**: Right panel: sticky canvas preview (70% width desktop, full width mobile)
- [ ] **STAR MAP**: Bottom: "Buy Digital ($25)" and "Buy Physical ($45-90)" buttons with size selector for physical

### Integration
- [ ] **STAR MAP**: Wire up checkout — digital $25, physical varies by size (8x10 $45, 12x16 $65, 16x20 $85)
- [ ] **STAR MAP**: Test full flow: configure → preview → pay → receive (Stripe test mode, card 4242 4242 4242 4242)

---

## 📜 **BIBLE CODE NAME ART GENERATOR** (Priority: Critical — Week 2-3)

> Zero direct competitors. Port ~20% of bible-codes.github.io codebase. Unique offering for Jewish gift market.

### Data & Transliteration
- [ ] **BIBLE CODE**: Create `/personalized/data/transliteration.json` — ~200 common English→Hebrew name mappings (`{"David": "דוד", "Sarah": "שרה", ...}`) + rule-based phonetic fallback
- [ ] **BIBLE CODE**: Copy `torahNoSpaces.txt` from bible-codes repo to `/personalized/data/` (304,805 consonantal characters)

### Port from bible-codes.github.io
- [ ] **BIBLE CODE**: Port ELS search algorithm (KMP + Boyer-Moore) from `js/search-algorithms.js`
  - Simplify: single-term search only, fixed skip range ±500
  - Function: `searchELS(term, torah, skipRange)` → array of `{position, skip, verseRef}`
- [ ] **BIBLE CODE**: Port matrix renderer from `engines/matrix.js`
  - Rectangular grid, highlight found name in color, 5-10 chars context, verse reference at bottom
- [ ] **BIBLE CODE**: Port canvas rendering + PNG export from `index.html` (`downloadMatrixPNG`)

### Generator (`/personalized/js/bible-code-generator.js`)
- [ ] **BIBLE CODE**: Build main generator — takes name (English or Hebrew) + options → transliterate → search → render matrix → return canvas + verse attribution

### Name-Not-Found Handling
- [ ] **BIBLE CODE**: Try alternate transliterations (e.g., "Joseph" → "Yosef")
- [ ] **BIBLE CODE**: Try shorter forms ("Joseph" → "Jose")
- [ ] **BIBLE CODE**: Honest message if not found: "Unfortunately, '[NAME]' was not found in the Torah." + offer family name search. Never fake a result

### Customizer Page (`/personalized/bible-code.html`)
- [ ] **BIBLE CODE**: Create customizer page — name input with English/Hebrew selector, submit button, canvas preview of matrix (or not-found message)
- [ ] **BIBLE CODE**: If found: "Buy Digital ($20)" and "Buy Physical ($50-90)"
- [ ] **BIBLE CODE**: Wire up checkout, test full flow with known names (David, Sarah, Noah) and unknown names

---

## ✡️ **HEBREW NAME ART GENERATOR** (Priority: Critical — Week 3-4)

> Simplest product. Shares transliteration with Bible Code. Low Etsy competition for Hebrew calligraphy.

### Generator (`/personalized/js/hebrew-name-generator.js`)
- [ ] **HEBREW NAME**: Build generator — transliterate name → large Hebrew letters (200px+ font, centered) + decorative SVG elements based on style preset
- [ ] **HEBREW NAME**: Implement style presets: Classic (gold on navy), Modern minimalist (black on white), Watercolor (soft colors), Jerusalem Stone (warm earth tones)
- [ ] **HEBREW NAME**: Add decorative SVG elements: pomegranates, olive branches, Jerusalem skyline, Hamsa
- [ ] **HEBREW NAME**: Display English name + meaning below Hebrew in smaller font

### Fonts & Customizer
- [ ] **HEBREW NAME**: Load Google Fonts: Frank Ruhl Libre, Noto Serif Hebrew, Amatic SC Hebrew (with system font fallback)
- [ ] **HEBREW NAME**: Create `/personalized/hebrew-name.html` customizer — name input, style preset radio buttons with color swatches, text color picker, live preview
- [ ] **HEBREW NAME**: Bottom: "Buy Digital ($18)" and "Buy Physical ($40-70)"
- [ ] **HEBREW NAME**: Wire up checkout, test with non-ASCII names (ü, é, ñ), verify legibility in all styles

---

## 📸 **PRODUCT PHOTOGRAPHY & MOCKUPS** (Priority: Critical — Week 4)

- [ ] **MOCKUPS**: Self-order 1-2 physical prints of each product via Gooten (fastest shipping)
- [ ] **MOCKUPS**: Photograph in lifestyle settings — at least 3 angles per product: close-up, framed, lifestyle/scene
- [ ] **MOCKUPS**: Create digital mockup images for Etsy listings (Photoshop/Canva — product in different sizes/frames)
- [ ] **MOCKUPS**: Create hero images for `/personalized/` landing page and thumb images for product cards

---

## 💰 **PAYMENT & CRYPTO** (Priority: High — Week 1-2)

### Stripe Stablecoins
- [ ] **PAYMENTS**: Enable USDC/USDP/USDG in Stripe Dashboard (Base, Polygon, Ethereum networks)
- [ ] **PAYMENTS**: Verify `create-checkout-session.js` automatically shows stablecoin option (no code change if using Stripe Checkout)
- [ ] **PAYMENTS**: Test end-to-end stablecoin payment in Stripe sandbox

### Coinbase Commerce (Week 2)
- [ ] **PAYMENTS**: Create Coinbase Commerce account, get API key
- [ ] **PAYMENTS**: Set up webhook endpoint: `/.netlify/functions/coinbase-webhook`
- [ ] **PAYMENTS**: Add "Pay with Crypto" button alongside "Buy Now" on customizer pages and `marketplace.html`
- [ ] **PAYMENTS**: On payment confirmation, Coinbase webhook triggers same fulfillment flow
- [ ] **PAYMENTS**: Test BTC payment end-to-end in Coinbase sandbox

---

## 🔗 **BIBLE-CODES.GITHUB.IO CROSS-PROMOTION** (Priority: High — Week 2)

> ~1K existing users. Lowest-friction upsell: user already validated search, now offer print.

- [ ] **CROSS-PROMO**: Add "Want this as a print?" CTA after ELS search results on bible-codes.github.io
  - Link: `https://jerusalemhills.com/personalized/bible-code.html?term={searchTerm}`
  - Pre-populate customizer form via URL param
- [ ] **CROSS-PROMO**: Add Ko-fi donation button (floating or in footer/header)
- [ ] **CROSS-PROMO**: Add GitHub Sponsors link in README and footer

---

## 📧 **EMAIL CAPTURE SYSTEM** (Priority: High — Week 5-6)

> Prerequisite for Judaica expansion. Target: 500 subscribers by Q1, 4,000 by Q4.

- [ ] **EMAIL**: Create `/netlify/functions/subscribe.js` — accept email + interest tags, store in email service
- [ ] **EMAIL**: Add email capture form to `/personalized/index.html` ("Get notified about new designs + Jewish holiday gift guides")
- [ ] **EMAIL**: Add email capture to homepage footer or hero section
- [ ] **EMAIL**: Add email capture to `marketplace.html` after product grid
- [ ] **EMAIL**: Set up free-tier email service (Buttondown, Mailchimp, or Brevo)
- [ ] **EMAIL**: Create welcome email sequence with interest segmentation (holiday gifts, educational, personalized art)

---

## 🛍️ **ETSY CROSS-LISTINGS** (Priority: High — Week 5-8)

> Etsy has 96M active buyers. jerusalemhills.com has ~zero organic traffic. Etsy = discovery engine; JH = high-margin destination.

### Store Setup
- [ ] **ETSY**: Create Etsy seller account (email verification, bank account, tax ID)
- [ ] **ETSY**: Set up shop branding — banner with Jerusalem Hills logo, about section, shop policies (1-3 day processing, 3-7 day shipping, returns accepted)
- [ ] **ETSY**: Opt out of Offsite Ads (under $10K/yr; 15% fee too high at low volume)

### Listings
- [ ] **ETSY**: Create star map listing — title (70 chars), 13 tags (custom star map, Jewish wedding gift, bar mitzvah, etc.), 10 product images, digital $25 / physical from $45, set as "Made to order (personalized)"
- [ ] **ETSY**: Create Bible code name art listing — highlight uniqueness ("Only modern web-based Torah codes product"), digital $20 / physical $50
- [ ] **ETSY**: Create Hebrew name art listing — highlight "Baby gift, bar mitzvah, personalized Hebrew art", digital $18 / physical $40
- [ ] **ETSY**: Set processing time expectations ("1-3 business days")
- [ ] **ETSY**: Enable free shipping threshold if order > $75 (Etsy algorithm rewards free shipping)

### Operations
- [ ] **ETSY**: Document manual fulfillment workflow: Etsy order → generate on JH.com tools → fulfill (digital: upload to Etsy order; physical: submit to Gooten with Etsy tracking)
- [ ] **ETSY**: Create card insert for physical shipments directing customers to jerusalemhills.com (saves ~11% Etsy fees on repeat orders)
- [ ] **ETSY**: Research eRank/EverBee for keyword optimization (free tier, refine tags)

---

## 📋 **DIGITAL PLANNERS ON MARKETPLACE** (Priority: Medium — Week 6-8)

> Digital-only products on JH.com marketplace. 95.9% margin via Stripe vs 88.7% via Etsy.

- [ ] **PLANNERS**: Add "Digital Downloads" category to marketplace
- [ ] **PLANNERS**: Update `create-checkout-session.js` to support instant-download digital products (not just personalized)
- [ ] **PLANNERS**: Update `stripe-webhook.js` to auto-deliver PDF download link for planner purchases
- [ ] **PLANNERS**: Host planner PDFs on Cloudinary
- [ ] **PLANNERS**: List Torah study planner ($8.99), ADHD planner ($7.99), nurse shift planner ($6.99) on marketplace

---

## 🛒 **E-COMMERCE EXPANSION** (Priority: Medium — Phase 3+)

### Shopping Cart (Week 15+)
- [ ] **CART**: Create `/js/cart.js` — localStorage-based cart with add/remove/quantity
- [ ] **CART**: Modify `marketplace.html` — "Add to Cart" replaces direct checkout
- [ ] **CART**: Add "Add to Cart" option to `/personalized/*.html` alongside direct buy
- [ ] **CART**: Create `/cart.html` — cart page with summary and checkout
- [ ] **CART**: Modify `create-checkout-session.js` to accept array of line items

### Admin/Fulfillment Dashboard (Week 13+)
- [ ] **ADMIN**: Create `/admin/index.html` — password-protected admin dashboard (simple localStorage auth)
- [ ] **ADMIN**: Create `/admin/js/orders.js` — fetch orders from Stripe API, display with fulfillment status (paid, generating, shipped, delivered)
- [ ] **ADMIN**: Create `/netlify/functions/get-orders.js` — proxy to Stripe API for order listing
- [ ] **ADMIN**: Create `/netlify/functions/update-order.js` — mark orders fulfilled, add tracking number

### Judaica Expansion (Parked — conditional on $3K/mo revenue)
- [ ] **EXPANSION**: Shopify store setup (only when volume justifies, $39/mo)
- [ ] **EXPANSION**: Amazon Associates affiliate catalog on JH.com (test demand without inventory)
- [ ] **EXPANSION**: Identify top affiliate performers → source/private-label
- [ ] **EXPANSION**: Additional Judaica product streams (ritual goods, lifecycle gifts, home decor)
- [ ] **EXPANSION**: Launch social media presence (Instagram, Facebook, Pinterest)
- [ ] **EXPANSION**: Email marketing campaigns (holiday gift guides, seasonal)
- [ ] **EXPANSION**: Subscription bundles (educational kits, holiday sets)

---

## 🏢 **BUSINESS FOUNDATION** (Priority: High — Week 1)

- [ ] **LEGAL**: File LLC (Wyoming — $100-200, no state income tax) at sos.wyo.gov
- [ ] **LEGAL**: Obtain EIN from IRS (free, online, instant) at irs.gov (Form SS-4)
- [ ] **LEGAL**: Set up registered agent ($50-100/yr) or self-register
- [ ] **LEGAL**: Open business bank account (Mercury or Relay, free)
- [ ] **LEGAL**: Configure Stripe under business entity (upload LLC docs, set business address)

---

## 📈 **DECISION RULES**

> From `mkt-research/README.md` — signals that trigger strategic pivots:

| Signal | Action |
|--------|--------|
| Personalized products > $500/mo | Double down on products, defer other work |
| Any stream > $2K/mo | Investigate doubling down |
| Total revenue > $3K/mo | Activate Judaica expansion plan |
| G1 Pro tier converting | Expand Bible Codes features |

---

## 🎮 **GAMES DEVELOPMENT** (Priority: Low — Community Track)

### Core Game Implementations
- [ ] **GAMES**: Create Jerusalem-themed memory matching game
- [ ] **GAMES**: Implement 2048-style number puzzle game (proven engagement)
- [ ] **GAMES**: Add Solitaire card game implementation
- [ ] **GAMES**: Implement Candy Crush style match-3 game
- [ ] **GAMES**: Create Sudoku puzzle game with multiple difficulty levels
- [ ] **GAMES**: Implement Word Search puzzle with Hebrew/English options
- [ ] **GAMES**: Add Crossword puzzle game with Jerusalem themes
- [ ] **GAMES**: Create Mahjong tile matching game
- [ ] **GAMES**: Implement Bubble Shooter game
- [ ] **GAMES**: Add Chess game with AI opponent (complex - use Lichess embed first)
- [ ] **GAMES**: Implement Poker game (low priority - legal concerns)
- [ ] **GAMES**: Add Jerusalem Heritage Quiz/Trivia game with cultural content

### Torah Codes Implementation (From IMPLEMENTATION_PLAN.md)
- [ ] **GAMES**: Complete Hebrew text processing utilities (`hebrew-utils.js`)
- [ ] **GAMES**: Implement gematria calculation system (`gematria.js`)
- [ ] **GAMES**: Create ELS data structures and objects (`els-objects.js`)
- [ ] **GAMES**: Build core ELS search algorithm (`els-engine.js`)
- [ ] **GAMES**: Implement Canvas-based matrix visualization (`els-visualizer.js`)
- [ ] **GAMES**: Prepare Hebrew text data in JSON format (Torah books)
- [ ] **GAMES**: Add progress tracking for long searches
- [ ] **GAMES**: Implement zoom and pan functionality for visualizations
- [ ] **GAMES**: Add color coding for different ELS matches
- [ ] **GAMES**: Create responsive design for mobile devices

### Game Enhancement Systems
- [ ] **GAMES**: Implement game difficulty levels and progression system
- [ ] **GAMES**: Add comprehensive game statistics and scoring system
- [ ] **GAMES**: Implement game achievements and badges system
- [ ] **GAMES**: Create game category navigation with filtering
- [ ] **GAMES**: Enhanced backgammon with AI opponent and strategy hints
- [ ] **GAMES**: Add game tutorials and help systems
- [ ] **GAMES**: Implement game save/load functionality
- [ ] **GAMES**: Add game replay and review modes
- [ ] **GAMES**: Create game tournaments and events system

### Technical & Infrastructure
- [ ] **GAMES**: Fix marketplace image placeholders
- [ ] **GAMES**: Test Stripe integration thoroughly in test mode
- [ ] **GAMES**: Create comprehensive games landing page with proper categories

---

## 🔗 **MULTIPLAYER FUNCTIONALITY** (Priority: Low — Community Track)

- [ ] **MULTIPLAYER**: Implement multiplayer backgammon with shareable link functionality
- [ ] **MULTIPLAYER**: Add real-time game state synchronization for backgammon
- [ ] **MULTIPLAYER**: Create game room system with unique URLs for multiplayer games
- [ ] **MULTIPLAYER**: Implement WebSocket or WebRTC for real-time multiplayer communication
- [ ] **MULTIPLAYER**: Add player invitation system via email/link sharing
- [ ] **MULTIPLAYER**: Create lobby system for finding game partners
- [ ] **MULTIPLAYER**: Implement spectator mode for ongoing games
- [ ] **MULTIPLAYER**: Add online multiplayer to other games via GunDB

---

## 💬 **FORUM ENHANCEMENTS** (Priority: Low — Community Track)

### Content Moderation
- [ ] **FORUM**: Implement enhanced content moderation with bad word filtering
- [ ] **FORUM**: Add link validation and domain blocking
- [ ] **FORUM**: Implement community flagging system
- [ ] **FORUM**: Add rate limiting per session

### User Experience
- [ ] **FORUM**: Add emoji reactions to posts
- [ ] **FORUM**: Implement reply threading system
- [ ] **FORUM**: Add search within forum posts
- [ ] **FORUM**: Create export/share individual discussions

### Gaming Integration
- [ ] **FORUM**: Create forum leaderboard section for game high scores
- [ ] **FORUM**: Implement score submission system for games
- [ ] **FORUM**: Add player name/stagename input for high score submissions
- [ ] **FORUM**: Create persistent high score storage in forum

### Advanced Features
- [ ] **FORUM**: Implement topic categorization and search functionality
- [ ] **FORUM**: Add user reputation system based on community interaction
- [ ] **FORUM**: Create forum analytics and activity monitoring
- [ ] **FORUM**: Add multi-language support (Hebrew, Arabic, English)
- [ ] **FORUM**: Implement machine learning content filtering
- [ ] **FORUM**: Create community events announcement system

---

## 👤 **USER PROFILES & PRIVACY** (Priority: Low — Community Track)

- [ ] **USER PROFILES**: Implement localStorage-based anonymous user profiles
- [ ] **USER PROFILES**: Create user profile system with zero personal data collection
- [ ] **USER PROFILES**: Add profile export/import functionality for user data portability
- [ ] **USER PROFILES**: Implement game preferences and settings storage
- [ ] **USER PROFILES**: Add achievement tracking and progress saving
- [ ] **USER PROFILES**: Create custom avatar system with kid-friendly options
- [ ] **USER PROFILES**: Session-based reputation system without persistent storage

---

## 👶 **KIDS ZONE EXPANSION** (Priority: Low — Community Track)

### Sound System Implementation (From SOUND_EFFECTS_PLAN.md)
- [ ] **KIDS ZONE**: Create `/kids/assets/sounds/` directory
- [ ] **KIDS ZONE**: Download and optimize sound files (< 20KB each)
- [ ] **KIDS ZONE**: Create `sound-manager.js` utility script
- [ ] **KIDS ZONE**: Implement sound triggers for Math Quest game
- [ ] **KIDS ZONE**: Add sound effects to Word Builder game
- [ ] **KIDS ZONE**: Implement audio for Memory Match game
- [ ] **KIDS ZONE**: Add sound toggle buttons to all games
- [ ] **KIDS ZONE**: Test sound system across browsers and devices

### Educational Content Expansion
- [ ] **KIDS ZONE**: Enhance historical map with more interactive features
- [ ] **KIDS ZONE**: Add educational quizzes for different age groups
- [ ] **KIDS ZONE**: Create interactive Torah learning activities
- [ ] **KIDS ZONE**: Implement parental controls and time limits
- [ ] **KIDS ZONE**: Add Hebrew alphabet learning games
- [ ] **KIDS ZONE**: Create Jerusalem virtual tour for kids
- [ ] **KIDS ZONE**: Add holiday-themed educational content
- [ ] **KIDS ZONE**: Implement progress tracking for educational activities

### Additional Math Games
- [ ] **KIDS ZONE**: Add Subtraction Quest game
- [ ] **KIDS ZONE**: Implement Multiplication Tables game
- [ ] **KIDS ZONE**: Add Division Challenge game

### Geography & Science Games
- [ ] **KIDS ZONE**: Create Israel Map geography game
- [ ] **KIDS ZONE**: Add World Capitals Quiz
- [ ] **KIDS ZONE**: Implement Flag Matching Game
- [ ] **KIDS ZONE**: Add Animal Classification educational game
- [ ] **KIDS ZONE**: Create Solar System Explorer
- [ ] **KIDS ZONE**: Add Simple Physics Puzzles

---

## 🛒 **MARKETPLACE ENHANCEMENTS** (Priority: Low — Community Track)

- [ ] **MARKETPLACE**: Add product search and filtering functionality
- [ ] **MARKETPLACE**: Implement product reviews and ratings system
- [ ] **MARKETPLACE**: Create vendor application and onboarding process
- [ ] **MARKETPLACE**: Add inventory management system
- [ ] **MARKETPLACE**: Implement order tracking and customer notifications
- [ ] **MARKETPLACE**: Create product categories and organization
- [ ] **MARKETPLACE**: Add wishlist and favorites functionality
- [ ] **MARKETPLACE**: Implement promotional codes and discount system
- [ ] **MARKETPLACE**: Add shipping calculator for international orders
- [ ] **MARKETPLACE**: Create multi-vendor marketplace capabilities
- [ ] **MARKETPLACE**: Implement vendor portal system

---

## ⚡ **PERFORMANCE & TECHNICAL** (Priority: Medium — Supports Revenue)

### Performance Optimization
- [ ] **PERFORMANCE**: Optimize image loading with lazy loading
- [ ] **PERFORMANCE**: Implement CDN for static assets
- [ ] **PERFORMANCE**: Add comprehensive minification for CSS and JavaScript
- [ ] **PERFORMANCE**: Optimize font loading and reduce FOUT
- [ ] **PERFORMANCE**: Implement caching strategies for API calls
- [ ] **PERFORMANCE**: Add performance monitoring and analytics
- [ ] **PERFORMANCE**: Target <2 second load times (currently ~3s)
- [ ] **PERFORMANCE**: Optimize Hebrew text processing for Torah Codes
- [ ] **PERFORMANCE**: Implement Web Workers for intensive computations

### PWA
- [ ] **PWA**: Optimize service worker for better offline functionality
- [ ] **PWA**: Add push notification system for forum updates
- [ ] **PWA**: Implement background sync for forum posts
- [ ] **PWA**: Create installable PWA prompts for mobile users
- [ ] **PWA**: Add offline game modes that work without internet
- [ ] **PWA**: Implement data syncing when connection returns
- [ ] **PWA**: Enhanced Kids Zone PWA with separate installation
- [ ] **PWA**: Add app-like styling and safe area handling

### Mobile
- [ ] **MOBILE**: Improve touch controls for all games
- [ ] **MOBILE**: Add haptic feedback for supported devices
- [ ] **MOBILE**: Optimize layouts for tablet devices
- [ ] **MOBILE**: Implement swipe gestures for navigation
- [ ] **MOBILE**: Add mobile-specific UI enhancements
- [ ] **MOBILE**: Test and verify mobile hamburger menu functionality
- [ ] **MOBILE**: Optimize Hebrew keyboard for mobile input

### Security
- [ ] **SECURITY**: Implement rate limiting for API endpoints
- [ ] **SECURITY**: Add CSRF protection for all forms
- [ ] **SECURITY**: Implement content security policy headers
- [ ] **SECURITY**: Add input validation and sanitization
- [ ] **SECURITY**: Create security audit and penetration testing
- [ ] **SECURITY**: Monthly security review and dependency updates
- [ ] **SECURITY**: Monitor payment activity for suspicious behavior
- [ ] **SECURITY**: Ensure HTTPS for all Torah Codes data loading

### Infrastructure
- [ ] **INFRASTRUCTURE**: Set up automated backup system
- [ ] **INFRASTRUCTURE**: Implement staging environment for testing
- [ ] **INFRASTRUCTURE**: Add automated deployment pipeline
- [ ] **INFRASTRUCTURE**: Implement monitoring and alerting system
- [ ] **INFRASTRUCTURE**: Set up database optimization and indexing
- [ ] **INFRASTRUCTURE**: Review Netlify Functions deployment
- [ ] **INFRASTRUCTURE**: CDN integration for global content delivery

---

## 📈 **MARKETING & SEO** (Priority: Medium — Supports Revenue)

- [ ] **MARKETING**: Submit updated sitemap to Google Search Console
- [ ] **MARKETING**: Add Bing Webmaster Tools verification
- [ ] **MARKETING**: Create social media integration
- [ ] **MARKETING**: Implement referral program system
- [ ] **MARKETING**: Add email newsletter subscription
- [ ] **MARKETING**: Create community outreach tools
- [ ] **MARKETING**: Implement SEO optimization across all pages
- [ ] **MARKETING**: Update sitemap for all new pages including personalized products
- [ ] **MARKETING**: SEO optimization for Hebrew content

---

## ♿ **ACCESSIBILITY (WCAG 2.1 AA)** (Priority: Low — Community Track)

- [ ] **ACCESSIBILITY**: Add screen reader support for all games
- [ ] **ACCESSIBILITY**: Implement keyboard navigation for all features
- [ ] **ACCESSIBILITY**: Add high contrast mode option
- [ ] **ACCESSIBILITY**: Implement text size adjustment controls
- [ ] **ACCESSIBILITY**: Add audio descriptions for visual content
- [ ] **ACCESSIBILITY**: Ensure WCAG 2.1 AA compliance across all pages
- [ ] **ACCESSIBILITY**: Add Hebrew text accessibility for visually impaired
- [ ] **ACCESSIBILITY**: Implement voice input for Hebrew speech recognition

---

## 📝 **CONTENT & DOCS** (Priority: Low — Community Track)

- [ ] **CONTENT**: Create comprehensive help documentation
- [ ] **CONTENT**: Add multilingual support (Hebrew/English/Arabic)
- [ ] **CONTENT**: Create educational blog section
- [ ] **CONTENT**: Add news aggregation for Jerusalem/Israel events
- [ ] **CONTENT**: Implement content management system for easy updates
- [ ] **CONTENT**: Create seasonal and holiday-themed content
- [ ] **CONTENT**: Historical timeline extension beyond Mediterranean
- [ ] **CONTENT**: Interactive lessons with guided educational content
- [ ] **CONTENT**: Hebrew/Arabic language learning games
- [ ] **CONTENT**: International sister city connections
- [ ] **CONTENT**: Torah commentary integration with codes search
- [ ] **CONTENT**: Educational content tutorials and methodology

### Documentation
- [ ] **DOCUMENTATION**: Update README.md with recent legal and forum enhancements
- [ ] **DOCUMENTATION**: Update OPERATIONS.md with forum management procedures
- [ ] **DOCUMENTATION**: Review and update CLAUDE.md with current AI instructions
- [ ] **DOCUMENTATION**: Quarterly content review for historical accuracy
- [ ] **DOCUMENTATION**: Legal compliance check and international law review
- [ ] **DOCUMENTATION**: Create user guides for Torah Codes functionality
- [ ] **DOCUMENTATION**: Update deployment checklist with new features

---

## 🧪 **TESTING** (Priority: Medium — Supports Revenue)

- [ ] **TESTING**: Multi-browser sync test for forum functionality
- [ ] **TESTING**: Session isolation test for privacy verification
- [ ] **TESTING**: Mobile compatibility test for all games
- [ ] **TESTING**: Network failure test for offline/online transitions
- [ ] **TESTING**: Privacy verification (no cookies, no localStorage)
- [ ] **TESTING**: Hebrew text processing unit tests
- [ ] **TESTING**: ELS algorithm correctness testing
- [ ] **TESTING**: Performance benchmarks for large text processing
- [ ] **TESTING**: Memory usage monitoring for Torah Codes
- [ ] **TESTING**: Cross-browser Hebrew font support testing
- [ ] **TESTING**: Personalized products end-to-end checkout testing
- [ ] **TESTING**: Crypto payment flow testing (Stripe USDC + Coinbase Commerce)

---

## 🚀 **ADVANCED FEATURES (FUTURE)** (Priority: Low)

- [ ] **ADVANCED**: Machine learning pattern recognition for Torah Codes
- [ ] **ADVANCED**: 3D matrix visualization for Torah Codes
- [ ] **ADVANCED**: GraphQL API for more efficient data fetching
- [ ] **ADVANCED**: Multi-term simultaneous search for Torah Codes
- [ ] **ADVANCED**: Statistical analysis comparing results against random text
- [ ] **ADVANCED**: Community database for user-submitted Torah Codes findings
- [ ] **ADVANCED**: AI opponent implementation for complex games
- [ ] **ADVANCED**: Real-time collaborative editing for forum posts
- [ ] **ADVANCED**: Blockchain integration for game leaderboards
- [ ] **ADVANCED**: Virtual reality tour of historical Jerusalem

---

## 📋 **EXECUTION TIMELINE**

```
WEEK 1    LLC + EIN + business bank account
          Stripe USDC enabled on JH
          Shared product infrastructure started
          Personalized products landing page + nav
          Gooten + Cloudinary accounts
          Fix GA placeholder, submit sitemap

WEEK 2    Star map generator shipped
          Bible-codes.github.io cross-promo CTA + donations
          Coinbase Commerce button on JH

WEEK 3    Bible code name art generator shipped

WEEK 4    Hebrew name art generator shipped
          Product mockup photos taken
          All 3 products tested end-to-end

WEEK 5-6  Etsy store + all 3 listings live
          Email capture system on JH
          Card inserts designed for physical shipments

WEEK 6-8  Digital planners listed on JH marketplace
          eRank/EverBee keyword optimization for Etsy
          Performance optimization (minify, lazy load)

WEEK 13+  Admin/fulfillment dashboard (if order volume justifies)

WEEK 15+  Shopping cart (if product catalog large enough)

ONGOING   Community track: games, Kids Zone, forum, multiplayer
          (work on these when revenue tasks are blocked or complete)
```

---

## 📈 **SUCCESS METRICS**

### Revenue Targets (Primary)
- 🎯 **Personalized Products**: Generating consistent sales within Phase 1
- 🎯 **Email List**: 500 subscribers by Q1, 4,000 by Q4
- 🎯 **Etsy Store**: Active with reviews and repeat customers
- 🎯 **Crypto Payments**: Processing stablecoin/token payments at lower fees
- 🎯 **Marketplace Revenue**: $1000+/mo

### Community Targets (Secondary)
- 🎯 **Performance**: <2 second load times
- 🎯 **Forum**: 50+ active participants
- 🎯 **Kids Zone**: 100+ daily users
- 🎯 **Uptime**: 99%

### Analytics
- [ ] **ANALYTICS**: Fix Google Analytics placeholder (replace G-XXXXXXXXXX)
- [ ] **ANALYTICS**: Implement detailed user behavior tracking
- [ ] **ANALYTICS**: Add game completion and engagement metrics
- [ ] **ANALYTICS**: Create admin dashboard for site statistics
- [ ] **ANALYTICS**: Implement A/B testing framework
- [ ] **ANALYTICS**: Add conversion tracking for marketplace and personalized products
- [ ] **ANALYTICS**: Real-time analytics and live visitor metrics
- [ ] **ANALYTICS**: Weekly analytics review process

---

## 🎯 **SUCCESS DEFINITION**

### Technical Excellence
- ✅ **Legal Compliance**: 100% - Comprehensive international coverage
- ✅ **Mobile Compatibility**: 100% - All features work on mobile
- ✅ **Privacy Protection**: 100% - Zero data collection architecture

### Platform Vision
Jerusalem Hills is evolving into a **revenue-generating platform** built on personalized Judaica products, while maintaining its community and educational roots:

1. **Revenue Generation**: Personalized products, digital planners, crypto-friendly payments, Etsy cross-listings
2. **International Community**: With respect for every soul and cultural sensitivity
3. **Educational Mission**: High-quality content for all ages with proper disclaimers
4. **Commercial Viability**: Multi-channel e-commerce (JH.com + Etsy + future Shopify)
5. **Legal Compliance**: International standards with comprehensive protection
6. **Technical Excellence**: Modern, responsive, accessible platform

---

**Total Consolidated Items: 350+**
**Sources: mkt-research/todo.md + mkt-research/decisions/jh-proposed-updates.md + mkt-research/README.md + MASTER_TODO_STATUS.md + PROJECT_TODOS.md + FORUM_IMPLEMENTATION_PLAN.md + SOUND_EFFECTS_PLAN.md + games/backgammon/IMPROVEMENTS.md + games/bcodes/IMPLEMENTATION_PLAN.md + TodoWrite system**

*"Content for educational purposes with respect for every soul • Community feedback welcome"*

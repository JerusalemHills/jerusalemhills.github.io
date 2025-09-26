# Jerusalem Hills 🏔️

> Your gateway to Jerusalem's heritage, culture, and marketplace

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fjerusalemhills.com)](https://jerusalemhills.com)
[![GitHub Pages](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-blue)](https://pages.github.com/)
[![Netlify Functions](https://img.shields.io/badge/API-Netlify%20Functions-00C7B7)](https://www.netlify.com/)

## 🌟 Overview

Jerusalem Hills is a modern e-commerce and community platform celebrating Jerusalem's rich heritage. We connect people with authentic Jerusalem products, local services, and cultural experiences.

### ✨ Features

- **🛍️ Marketplace** - Authentic Jerusalem crafts and products with secure Stripe checkout
- **📱 Mobile-First Design** - Fully responsive, optimized for all devices
- **💳 Secure Payments** - PCI-compliant payment processing via Stripe
- **🔍 SEO Optimized** - Google Search Console verified, sitemap included
- **📊 Analytics Ready** - Google Analytics 4 integration
- **🚀 Performance Optimized** - Lazy loading, minified assets, optimized images

## 🏗️ Architecture

```
┌─────────────────┐           ┌──────────────────┐           ┌─────────────┐
│  GitHub Pages   │           │ Netlify Functions │           │   Stripe    │
│                 │           │                  │           │             │
│ jerusalemhills  │  API Call │ jerusalemhills   │  Process  │  Checkout   │
│     .com        ├──────────►│  .netlify.app    ├──────────►│   & Pay     │
│                 │           │                  │           │             │
└─────────────────┘           └──────────────────┘           └─────────────┘
```

- **Frontend**: Static site hosted on GitHub Pages
- **API**: Serverless functions on Netlify for payment processing
- **Payments**: Stripe Checkout (no PCI compliance burden)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git
- GitHub account
- Netlify account (for API functions)
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JerusalemHills/jerusalemhills.github.io.git
   cd jerusalemhills.github.io
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (for local development)
   ```bash
   # Create .env file for Netlify functions
   cp .env.example .env
   # Add your Stripe keys
   ```

4. **Run locally**
   ```bash
   # Serve the site
   python3 -m http.server 8000
   # Visit http://localhost:8000
   ```

## 📦 Project Structure

```
jerusalemhills.github.io/
├── index.html              # Homepage
├── marketplace.html        # Product marketplace
├── contact.html           # Contact page
├── success.html           # Payment success page
├── cancel.html            # Payment cancelled page
├── img/                   # Images and assets
├── js/                    # JavaScript files
│   ├── analytics.js       # Google Analytics setup
│   └── *.js              # Other scripts
├── netlify/
│   └── functions/         # Serverless API functions
│       └── create-checkout-session.js
├── dl/                    # Private data (gitignored)
└── docs/                  # Documentation
```

## 🛠️ Development

### Key Scripts

```bash
# Optimize images
./optimize-images-simple.py

# Minify JavaScript
npm run minify:js

# Deploy to production
git push origin master  # Auto-deploys via GitHub Pages
```

### Performance Optimization

1. **Images**: Use the optimization script or [TinyPNG](https://tinypng.com)
2. **JavaScript**: Already minified with terser
3. **CSS**: Inline critical CSS, lazy-load non-critical
4. **Monitoring**: Check performance at [PageSpeed Insights](https://pagespeed.web.dev)

## 🔧 Configuration

### Google Analytics

Edit `/js/analytics.js`:
```javascript
const GA_MEASUREMENT_ID = 'G-YOUR_ID_HERE';
```

### Stripe Integration

Set in Netlify environment variables:
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key

### Domain Setup

- Primary: `jerusalemhills.com` (GitHub Pages)
- API: `jerusalemhills.netlify.app` (Netlify Functions)

## 📊 Current Status

- ✅ **Production Ready** - Live and processing payments
- ✅ **Mobile Optimized** - Fully responsive design
- ✅ **SEO Ready** - Meta tags, sitemap, Search Console
- ✅ **Analytics** - GA4 configured (needs ID)
- ✅ **Security** - HTTPS, secure payments, no sensitive data exposure

## 🔒 Security

- Never commit API keys or sensitive data
- Use environment variables for secrets
- Keep private data in `/dl/` (gitignored)
- All payments handled by Stripe (PCI compliant)

## 📚 Documentation

- [Marketplace Documentation](MARKETPLACE_DOCUMENTATION.md)
- [Performance Optimization Guide](PERFORMANCE_OPTIMIZATION.md)
- [Website Fix-up Plan](WEBSITE_FIXUP_PLAN.md)
- [Google Services Configuration](GOOGLE_SERVICES_CONFIG.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary. All rights reserved.

## 📧 Contact

- **Email**: JerusalemHills.com@gmail.com
- **Website**: [jerusalemhills.com](https://jerusalemhills.com)

## 🙏 Acknowledgments

- Built with ❤️ in Jerusalem
- Powered by GitHub Pages and Netlify
- Payments by Stripe

---

---

## 🚧 Current Development (In Progress)

### Jerusalem Theme Implementation
- ✅ **Central Theme System** (`/css/theme.css`)
  - Jerusalem color palette (Gold, Stone, Olive, Sky, Purple)
  - Unified typography system
  - Consistent spacing and components
  - Micro-animations and transitions

- 🔄 **Index Page Redesign** (`/css/index-redesign.css`)
  - Card-based layout for better organization
  - Categories: Marketplace, Community, Culture, Services
  - Featured products carousel
  - Community activity feed

- ✅ **Jerusalem Time/Weather Widget** (`/js/jerusalem-widget.js`)
  - Live Jerusalem time display
  - Weather information (mock data for now)
  - Fixed position widget

- 🔄 **Backgammon Game** (`/games/backgammon/`)
  - Local multiplayer implementation
  - Jerusalem-themed design
  - Drag-and-drop gameplay
  - Score tracking

### Next Steps
- Complete backgammon game logic
- Implement P2P connectivity with PeerJS
- Add GunDB for decentralized data
- Complete index.html migration to new design

**Last Updated**: September 2025
**Version**: 2.1.0
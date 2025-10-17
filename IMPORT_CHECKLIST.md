# Import Checklist: propose_index.html → index.html

## Critical Items to Import from Current index.html

### 1. SEO & Meta Tags ✅
From index.html lines 4-42:

```html
<!-- Google Analytics 4 -->
<script src="/js/analytics.js"></script>

<!-- SEO Meta Tags -->
<meta name="description" content="Discover Jerusalem Hills...">
<meta name="keywords" content="Jerusalem Hills, Jerusalem heritage...">
<meta name="author" content="Jerusalem Hills">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://jerusalemhills.com/">

<!-- Open Graph Meta Tags -->
<meta property="og:title" content="Jerusalem Hills...">
<meta property="og:description" content="...">
<meta property="og:image" content="https://jerusalemhills.com/img/header-bg-city-wall.jpg">
<meta property="og:url" content="https://jerusalemhills.com/">
<meta property="og:type" content="website">

<!-- Twitter Card Meta Tags -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="...">
<meta name="twitter:image" content="...">

<!-- Theme Colors -->
<meta name="theme-color" content="#4F46E5">
<meta name="apple-mobile-web-app-title" content="Jerusalem Hills">
```

### 2. Google Verification & AdSense ✅
From index.html lines 41-42:

```html
<meta name="google-site-verification" content="ZSCfkxbfCgbfz-qO3-L3cVpifny1S6dygLdSklzsgCU" />
<meta name="google-adsense-account" content="ca-pub-1738161253720" />
```

### 3. Favicon References ✅
From index.html lines 51-56:

```html
<link rel="icon" href="/img/favicon.ico" type="image/x-icon">
<link rel="icon" href="/img/favicon-16x16.png" sizes="16x16" type="image/png">
<link rel="icon" href="/img/favicon-32x32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
<link rel="manifest" href="/img/site.webmanifest">
```

### 4. External Scripts ✅
From index.html lines 44-49:

```html
<script src="js/hebcal.js"></script>
<script src="js/rss-feed-config.js"></script>
<script src="js/rain.js"></script>
<script src="js/ticker.js"></script>
<script src="https://unpkg.com/lucide@latest"></script>
```

**NOTE:** propose_index.html already has:
- `hebcal.js` ✅
- `lucide` ✅
- Missing: `rss-feed-config.js`, `rain.js`, `ticker.js`

### 5. Additional JavaScript Files (Footer) ✅
From index.html lines 2138-2142:

```html
<script src="/js/adsense-config.js"></script>
<script src="/js/lazy-load.js"></script>
<script src="/js/search.js"></script>
<script src="/js/mobile-nav.js"></script>
```

## Actions Required

### Step 1: Add Missing Meta Tags to propose_index.html
Add to `<head>` section:
- [ ] Google Analytics script
- [ ] SEO meta description, keywords, author, robots, canonical
- [ ] Open Graph meta tags (all)
- [ ] Twitter Card meta tags (all)
- [ ] Theme color and app name meta tags
- [ ] Google site verification
- [ ] Google AdSense account

### Step 2: Verify Favicon Links
- [ ] Confirm all favicon files exist in `/img/` directory
- [ ] Add missing favicon references if needed

### Step 3: Add External Scripts
- [ ] Add missing scripts: `rss-feed-config.js`, `rain.js`, `ticker.js`
- [ ] Verify `hebcal.js` is properly loaded
- [ ] Verify Lucide icons are working

### Step 4: Add Footer Scripts
- [ ] Add `/js/adsense-config.js`
- [ ] Add `/js/lazy-load.js`
- [ ] Add `/js/search.js`
- [ ] Add `/js/mobile-nav.js`

### Step 5: Backup Current index.html
```bash
cp index.html index.html.backup-$(date +%Y%m%d-%H%M%S)
```

### Step 6: Replace index.html
```bash
cp propose_index.html index.html
cp propose_styles.css styles.css  # Or link correctly
cp propose_script.js script.js    # Or link correctly
```

## Files Involved

### Files to Import/Merge:
1. `propose_index.html` → `index.html` (main HTML)
2. `propose_styles.css` → New CSS file or merge with existing
3. `propose_script.js` → New JS file or merge with existing

### Files to Keep:
- `/js/analytics.js` (Google Analytics 4)
- `/js/hebcal.js` (Hebrew calendar)
- `/js/rss-feed-config.js` (RSS feeds configuration)
- `/js/rain.js` (Rain animation effect)
- `/js/ticker.js` (News ticker functionality)
- `/js/adsense-config.js` (AdSense configuration)
- `/js/lazy-load.js` (Lazy loading images)
- `/js/search.js` (Site search functionality)
- `/js/mobile-nav.js` (Mobile navigation)

### New Files Created:
- `propose_index.html`
- `propose_styles.css`
- `propose_script.js`

## Testing Checklist

After deployment:
- [ ] Test Google Analytics tracking
- [ ] Verify Google Search Console verification
- [ ] Test AdSense ads display
- [ ] Verify all favicons load correctly
- [ ] Test Hebrew calendar display
- [ ] Test RSS news ticker
- [ ] Test world clocks with weather
- [ ] Test mobile hamburger menu
- [ ] Test Hebrew virtual keyboard
- [ ] Test all navigation links
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Verify Open Graph tags (share on social media)
- [ ] Test search functionality
- [ ] Test lazy loading images

## Important Notes

1. **Google Analytics**: Ensure GA4 measurement ID is correct in `/js/analytics.js`
2. **AdSense**: Verify AdSense publisher ID `ca-pub-1738161253720` is correct
3. **Canonical URL**: Ensure canonical URL points to `https://jerusalemhills.com/`
4. **Weather API**: Uses free Open-Meteo API (no API key required)
5. **RSS Feeds**: Uses CORS proxies for Jerusalem Post feeds
6. **Backgammon Image**: Falls back to `img/pic01.jpg` if preview image not found

## Domain-Specific Items

- Domain: `jerusalemhills.com`
- Google Site Verification Code: `ZSCfkxbfCgbfz-qO3-L3cVpifny1S6dygLdSklzsgCU`
- AdSense Publisher ID: `ca-pub-1738161253720`
- Canonical URL: `https://jerusalemhills.com/`

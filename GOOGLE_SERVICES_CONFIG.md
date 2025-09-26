# Google Services Configuration

## ✅ Services Connected

### Google Ads
- **Status**: Connected
- **Account**: Configured (see private notes)
- **Google Business Profile**: Linked
- **Email**: jerusalemhills.com@gmail.com

### YouTube Channel
- **Status**: Active
- **Channel**: Jerusalem Hills
- **Integration**: Ready for video embeds

### Google Analytics 4
- **Status**: Ready (awaiting Measurement ID)
- **Configuration**: `/js/analytics.js`
- **To activate**: Replace `G-XXXXXXXXXX` with your actual GA4 ID

### Google Search Console
- **Status**: Verified
- **Verification**: Meta tag in index.html
- **Sitemap**: `/sitemap.xml` ready for submission

## 📝 Setup Instructions

### 1. Google Analytics 4
```javascript
// Edit /js/analytics.js
const GA_MEASUREMENT_ID = 'G-YOUR_ID_HERE';
```

### 2. YouTube Video Embeds
```html
<!-- Add to any page -->
<iframe width="560" height="315"
  src="https://www.youtube.com/embed/VIDEO_ID"
  frameborder="0"
  allowfullscreen>
</iframe>
```

### 3. Google Ads Integration
- Conversion tracking ready
- Add Google Ads conversion tag when campaigns start

## 🔒 Security Notes

- Never commit API keys or sensitive IDs to the repository
- Keep account numbers and private data in local files only
- Use environment variables for sensitive configuration in production

## 📊 Performance Tracking

Once GA4 is configured, you'll be able to track:
- Page views and user engagement
- E-commerce conversions from marketplace
- YouTube video engagement
- Ad campaign performance

---

**Note**: Keep sensitive account details in private local files, not in the repository.
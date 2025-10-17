# Jerusalem Hills - Production Deployment Checklist

## 🚀 Pre-Deployment Configuration

### 1. Update Google IDs
- [ ] Replace `G-XXXXXXXXXX` with actual Google Analytics 4 ID in:
  - [ ] `/js/cookie-consent.js` (line ~10)
  - [ ] All HTML files (search for "G-XXXXXXXXXX")
- [ ] Replace AdSense slot IDs in `/js/adsense-config.js`:
  ```javascript
  homepage_banner: 'YOUR_ACTUAL_SLOT_ID',
  sidebar_vertical: 'YOUR_ACTUAL_SLOT_ID',
  in_article: 'YOUR_ACTUAL_SLOT_ID',
  footer_horizontal: 'YOUR_ACTUAL_SLOT_ID',
  mobile_anchor: 'YOUR_ACTUAL_SLOT_ID'
  ```

### 2. Contact Form Setup
- [ ] Sign up for Formspree (or alternative) at https://formspree.io
- [ ] Update form action in `/contact.html` (line ~263):
  ```html
  action="https://formspree.io/f/YOUR_FORM_ID"
  ```

### 3. Domain Configuration
- [ ] Verify CNAME file contains: `jerusalemhills.com`
- [ ] Ensure DNS A records point to GitHub Pages:
  ```
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153
  ```

## 🎯 Performance Optimization

### 4. Run Optimization Scripts
```bash
# Optimize images (40-60% size reduction)
./optimize_images.sh

# Minify CSS and JavaScript
./minify_assets.sh

# Update HTML to use minified files
./update_html_references.sh
```

### 5. Test Performance
- [ ] Run Google PageSpeed Insights: https://pagespeed.web.dev
- [ ] Target scores:
  - [ ] Mobile: 85+
  - [ ] Desktop: 90+
- [ ] Check Core Web Vitals:
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1

## ✅ Functionality Testing

### 6. Cross-Browser Testing
Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### 7. Feature Testing
- [ ] **Search**: Type in search box, verify results appear
- [ ] **Mobile Menu**: Test hamburger menu on mobile
- [ ] **Lazy Loading**: Scroll and verify images load smoothly
- [ ] **Cookie Consent**: Clear cookies, verify banner appears
- [ ] **Contact Form**: Submit test message
- [ ] **Games**: Test at least 2 games work
- [ ] **Service Worker**: Go offline, verify offline page appears

### 8. Link Validation
- [ ] Run link checker: `npx broken-link-checker https://jerusalemhills.com --recursive`
- [ ] Fix any broken links
- [ ] Verify all navigation works

## 🔒 Security & Compliance

### 9. Security Headers
Add to `.htaccess` or configure in hosting:
```apache
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"
Header set Referrer-Policy "strict-origin-when-cross-origin"
```

### 10. Legal Compliance
- [ ] Privacy Policy updated with your email
- [ ] Terms of Service includes your business details
- [ ] Cookie consent working properly
- [ ] GDPR compliance verified

## 📊 Analytics & Monitoring

### 11. Set Up Monitoring
- [ ] Google Search Console verified
- [ ] Google Analytics 4 configured
- [ ] Set up uptime monitoring (UptimeRobot, etc.)
- [ ] Configure error tracking (Sentry, etc.)

### 12. Create Analytics Goals
- [ ] Contact form submissions
- [ ] Game plays
- [ ] Marketplace clicks
- [ ] Ad clicks (if applicable)

## 🎨 Final Content Review

### 13. Content Checklist
- [ ] All placeholder text replaced
- [ ] Contact information correct
- [ ] Business hours accurate
- [ ] Social media links working
- [ ] Copyright year current

### 14. SEO Final Check
- [ ] All pages have unique meta descriptions
- [ ] Open Graph images exist and load
- [ ] Sitemap.xml is current
- [ ] Robots.txt configured properly

## 📱 Mobile App Considerations

### 15. PWA Features
- [ ] manifest.json configured
- [ ] Service worker registered
- [ ] Offline page working
- [ ] App icons in all sizes

## 🚢 Deployment Steps

### 16. Final Deployment
1. [ ] Commit all changes:
   ```bash
   git add -A
   git commit -m "Production deployment - all optimizations complete"
   git push origin master
   ```

2. [ ] Wait 5-10 minutes for GitHub Pages to update

3. [ ] Clear browser cache and test live site

4. [ ] Submit to search engines:
   - [ ] Google Search Console
   - [ ] Bing Webmaster Tools

## 📈 Post-Launch Monitoring (First 48 Hours)

### 17. Monitor Key Metrics
- [ ] Page load times
- [ ] Error rates
- [ ] 404 errors
- [ ] JavaScript errors in console
- [ ] Mobile usability issues
- [ ] Ad loading performance

### 18. User Feedback
- [ ] Monitor contact form submissions
- [ ] Check for user-reported issues
- [ ] Review analytics for unusual patterns
- [ ] Test all critical user paths

## 🎯 Success Criteria

The deployment is successful when:
- ✅ All pages load in < 3 seconds
- ✅ No JavaScript errors in console
- ✅ Mobile menu works on all devices
- ✅ Search returns relevant results
- ✅ Contact form sends messages
- ✅ Cookie consent appears and works
- ✅ Games are playable
- ✅ Ads load (when configured)
- ✅ Analytics tracking visitors
- ✅ No broken links

## 📝 Emergency Rollback Plan

If critical issues arise:
```bash
# Revert to previous version
git log --oneline  # Find previous stable commit
git revert HEAD    # Or specific commit
git push origin master
```

## 🎉 Launch Announcement

Once everything is verified:
1. [ ] Announce on social media
2. [ ] Send email to subscribers
3. [ ] Update any marketing materials
4. [ ] Celebrate! 🎊

---

**Remember**: Take backups before major changes and test thoroughly on staging before production deployment.
# Google AdSense Limited Ads Setup Guide

## 🔴 Step-by-Step Instructions to Enable Limited Ads

Limited Ads allow you to serve non-personalized advertisements without using cookies for ad personalization. This reduces privacy concerns and eliminates the need for cookie consent banners (in most cases).

---

## Part 1: Enable Limited Ads in AdSense Dashboard

### Step 1: Sign In to AdSense
1. Go to [https://adsense.google.com](https://adsense.google.com)
2. Sign in with your Google account (the one linked to your AdSense account)

### Step 2: Navigate to Brand Safety Settings
1. In the left sidebar, click **"Privacy & messaging"** or **"Brand safety"**
   - If you don't see this, try clicking **"Blocking controls"** → **"Content"**
2. Look for **"Ad serving"** section
3. Find the **"Limited ads"** toggle

### Step 3: Enable Limited Ads
1. Toggle **"Limited ads"** to **ON** (blue/enabled state)
2. Read the notification that appears:
   - Limited ads serve non-personalized ads
   - Revenue may be lower (~40-60% reduction typical)
   - Ads are contextual (based on page content, not user tracking)
3. Click **"Save"** or **"Confirm"**

### Step 4: Verify Settings
1. The Limited Ads toggle should now be blue/enabled
2. You should see a message like: "Limited ads: On - Non-personalized ads will be served"

---

## Part 2: Update Your Website Code

### Option A: Automatic Implementation (Recommended)

If you already have AdSense code on your site, you just need to add the `data-npa="1"` parameter.

#### Find Your Existing AdSense Code

Your ad code currently looks something like this:

```html
<!-- Current AdSense Auto Ads Code -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
     crossorigin="anonymous"></script>
```

#### Update to Limited Ads Version

**Method 1: Add data-npa to script tag**

Edit `/js/adsense-config.js` or wherever you load AdSense:

```javascript
// AdSense Non-Personalized Ads Configuration
(function() {
    'use strict';

    // Only load AdSense if NOT in Kids Zone
    if (window.location.pathname.startsWith('/kids/')) {
        console.log('AdSense: Disabled in Kids Zone (COPPA compliance)');
        return;
    }

    // Load AdSense script with non-personalized ads parameter
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX';
    script.crossOrigin = 'anonymous';

    // IMPORTANT: Set non-personalized ads parameter
    script.setAttribute('data-npa', '1');

    document.head.appendChild(script);

    console.log('AdSense: Loaded with Limited Ads (non-personalized)');
})();
```

**Method 2: Add data-npa to each ad unit**

For each `<ins class="adsbygoogle">` tag in your HTML:

```html
<!-- Before (Personalized Ads) -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="1234567890"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>

<!-- After (Limited Ads) -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="1234567890"
     data-ad-format="auto"
     data-full-width-responsive="true"
     data-npa="1"></ins>  <!-- Non-Personalized Ads -->

<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

---

## Part 3: Testing Limited Ads

### Test 1: Check for Cookies (Important!)

1. **Open your site in Chrome:**
   - Visit: https://jerusalemhills.com
   - Open Developer Tools (F12 or Ctrl+Shift+I)
   - Go to **Application** tab → **Cookies** → `https://jerusalemhills.com`

2. **Verify NO advertising cookies:**
   - ❌ Should NOT see: `__gads`, `__gpi`, `_gcl_au`
   - ⚠️ May see: `_gpi` (Google Publisher Identifier for fraud detection only)
   - ✅ Should NOT see any tracking/personalization cookies

### Test 2: Verify Ads Are Serving

1. **Visit your site in incognito mode** (Ctrl+Shift+N)
2. Look for ad placeholders or ads appearing on your pages
3. Ads should load but will be contextual (based on page content, not your browsing history)

### Test 3: Check Browser Console

1. Open Developer Tools → Console
2. Look for AdSense-related messages
3. Should see: "AdSense: Loaded with Limited Ads (non-personalized)"
4. Should NOT see errors about blocked scripts

### Test 4: AdSense Dashboard Monitoring

1. Go to AdSense dashboard → Reports
2. Monitor these metrics over 7-30 days:
   - **Impressions** - Should continue (might increase slightly)
   - **CTR (Click-Through Rate)** - May decrease slightly
   - **RPM (Revenue Per Thousand)** - Expected to drop 40-60%
   - **Total Earnings** - Monitor trend

---

## Part 4: Exclude Kids Zone from Ads (Critical!)

### Why This Matters
- **COPPA Compliance**: Children's Online Privacy Protection Act prohibits tracking children under 13
- **Kids Zone Privacy**: We promise no ads, no tracking in the Kids Zone

### Implementation

Edit `/js/adsense-config.js`:

```javascript
// AdSense Configuration with Kids Zone Protection
(function() {
    'use strict';

    // CRITICAL: Block AdSense in Kids Zone
    const isKidsZone = window.location.pathname.startsWith('/kids/');

    if (isKidsZone) {
        console.log('🚫 AdSense: Disabled in Kids Zone (COPPA compliance)');
        return; // Exit immediately - no ads in Kids Zone
    }

    // Load AdSense for other pages
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX';
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-npa', '1'); // Non-personalized ads

    document.head.appendChild(script);

    console.log('✅ AdSense: Loaded with Limited Ads (non-personalized)');
})();
```

### Test Kids Zone Protection

1. Visit: https://jerusalemhills.com/kids/
2. Open browser console
3. Should see: "🚫 AdSense: Disabled in Kids Zone (COPPA compliance)"
4. Check cookies - should be ZERO cookies from kids zone pages
5. Verify no ads appear anywhere in Kids Zone

---

## Part 5: Update Privacy Policy & TOS

### ✅ Already Completed
Your Privacy Policy and Terms of Service have been updated to reflect:
- Cookie-less Analytics (Google Analytics)
- Limited Ads (AdSense non-personalized)
- Stripe payment processing
- Kids Zone enhanced privacy

No further action needed on legal docs.

---

## Part 6: Revenue Impact & Expectations

### What to Expect

| Metric | Before Limited Ads | After Limited Ads | Change |
|--------|-------------------|-------------------|--------|
| **CPM (Cost Per Mille)** | $5-$10 | $2-$4 | ↓ 40-60% |
| **Impressions** | Baseline | Similar or +5% | → or ↑ |
| **CTR** | Baseline | -10% to -20% | ↓ 10-20% |
| **Total Revenue** | $100 | $40-$60 | ↓ 40-60% |

### Why Revenue Drops
- **No User Targeting**: Ads can't use browsing history
- **Contextual Only**: Ads based on page content only
- **Lower Advertiser Demand**: Fewer advertisers bid on non-personalized ads
- **No Remarketing**: Can't show ads to users who visited before

### Tradeoffs

**✅ Benefits:**
- Privacy-first reputation
- No cookie consent banners needed
- Faster page loads (less tracking scripts)
- COPPA compliant (safe for Kids Zone)
- Better user experience

**❌ Costs:**
- 40-60% revenue reduction
- Less effective ad targeting
- Lower advertiser interest

### Mitigation Strategies

If revenue drops too much, consider:

1. **Marketplace Focus**: Drive more Stripe sales (higher margins)
2. **Premium Content**: Paid memberships or subscriptions
3. **Sponsored Content**: Manual partnerships with relevant businesses
4. **Donations**: Patreon, Buy Me a Coffee, etc.
5. **Affiliate Marketing**: Product recommendations with affiliate links
6. **Hybrid Model**: Limited Ads on main site, remove entirely from Kids Zone

---

## Part 7: Compliance & Legal

### GDPR (EU Users)

**Do you need cookie consent with Limited Ads?**

**Probably Not, but it depends:**

- ✅ **No consent needed for:**
  - Cookie-less Analytics (already implemented)
  - Strictly necessary cookies (Stripe checkout)
  - Non-personalized ads (if no cookies used)

- ⚠️ **May still need consent for:**
  - Fraud prevention cookies (`_gpi` if used)
  - Analytics aggregation (even without cookies)

**Safest Approach for EU:**
- Show simple banner only for EU users (geolocation detection)
- Banner says: "We use minimal technical data for fraud prevention. Learn more."
- Link to Privacy Policy
- No "Accept/Decline" buttons needed (just informational)

### COPPA (US Children's Privacy)

**Status: ✅ Fully Compliant**

- Kids Zone: Zero ads, zero tracking, zero cookies
- AdSense disabled in `/kids/` directory
- Privacy Policy explicitly states COPPA compliance
- No personal information collected from children

### ePrivacy Directive (EU Cookie Law)

**Status: ✅ Mostly Compliant**

- No advertising cookies
- No tracking cookies
- Analytics is cookie-less
- Stripe uses cookies on their domain (not yours)

**Edge Case:**
- If AdSense uses `_gpi` cookie for fraud detection, technically you should disclose it
- Solution: Add simple notice in footer: "We use minimal technical cookies for security. [Privacy Policy]"

---

## Part 8: Troubleshooting

### Issue 1: Ads Not Showing After Enabling Limited Ads

**Possible Causes:**
1. AdSense account under review (new accounts take 1-3 days)
2. Content policy violations
3. Low traffic (AdSense requires minimum traffic)
4. Ad blocker enabled in browser

**Solution:**
- Check AdSense dashboard for policy violations
- Wait 24-48 hours for changes to propagate
- Test in incognito mode with ad blocker disabled
- Check browser console for errors

### Issue 2: Revenue Dropped More Than 60%

**Possible Causes:**
1. Limited Ads not configured correctly
2. Ad placements too aggressive (users ignoring them)
3. Low-quality traffic
4. Niche topic with few contextual advertisers

**Solution:**
- Verify `data-npa="1"` is set correctly
- Optimize ad placements (above fold, in-content)
- Improve content quality for better contextual targeting
- Consider removing ads entirely and focusing on Marketplace

### Issue 3: Cookies Still Appearing

**Check:**
1. Clear browser cache and cookies
2. Visit site in incognito mode
3. Check Developer Tools → Application → Cookies
4. Verify AdSense script has `data-npa="1"` attribute
5. Check if Limited Ads toggle is ON in AdSense dashboard

**Solution:**
- May take 24-48 hours for changes to propagate
- Some cookies (`_gpi`) may still appear for fraud detection
- If you see `__gads` or personalization cookies, Limited Ads not working - double-check setup

### Issue 4: AdSense Dashboard Doesn't Show Limited Ads Option

**Possible Reasons:**
1. AdSense account too new (under 6 months)
2. Located in country where Limited Ads not available
3. Using AdSense for Search (not Display)
4. Account has policy violations

**Solution:**
- Contact AdSense support: https://support.google.com/adsense
- Wait until account is 6+ months old
- Ensure account is in good standing (no policy violations)
- Check if using AdSense for Content (not Search)

---

## Part 9: Quick Reference

### Files to Update

1. **`/js/adsense-config.js`** - Add `data-npa="1"` attribute
2. **Any HTML files with ad units** - Add `data-npa="1"` to `<ins>` tags
3. **`/privacy-policy.html`** - ✅ Already updated
4. **`/terms-of-service.html`** - ✅ Already updated

### AdSense Dashboard Checklist

- [ ] Sign in to AdSense: https://adsense.google.com
- [ ] Navigate to Brand Safety → Ad Serving
- [ ] Toggle **"Limited ads"** to **ON**
- [ ] Click **Save** and confirm
- [ ] Verify toggle stays enabled (blue)
- [ ] Wait 24-48 hours for changes to propagate

### Testing Checklist

- [ ] No cookies on jerusalemhills.com (check DevTools)
- [ ] Ads still serving (check in incognito mode)
- [ ] Console shows "Limited Ads (non-personalized)"
- [ ] Kids Zone has zero ads and zero cookies
- [ ] Monitor revenue for 7-30 days

---

## Part 10: Next Steps

### Immediate (Today)
1. ✅ **Enable Limited Ads** in AdSense dashboard (see Part 1)
2. ✅ **Update AdSense code** with `data-npa="1"` (see Part 2)
3. ✅ **Test** for cookies and ad serving (see Part 3)

### This Week
4. **Monitor revenue** in AdSense dashboard (see Part 4)
5. **Verify Kids Zone** has no ads/cookies (see Part 4)
6. **Test on mobile devices** (different browsers)

### This Month
7. **Analyze revenue impact** (compare to previous month)
8. **Decide long-term strategy:**
   - Keep Limited Ads (privacy-first)
   - Remove ads entirely (focus on Marketplace)
   - Hybrid approach (ads on some pages only)

---

## 🟢 Summary

**You're ready to enable Limited Ads!**

1. **Dashboard**: Enable Limited Ads toggle ✅
2. **Code**: Add `data-npa="1"` to AdSense scripts ✅
3. **Legal**: Privacy Policy & TOS updated ✅
4. **Kids Zone**: Protected from ads ✅
5. **Testing**: Check cookies, verify ads load ⏳

**Expected Outcome:**
- 🔴 Revenue: -40% to -60% decrease
- 🟡 Privacy: Much better (no tracking cookies)
- 🟢 Compliance: GDPR/COPPA compliant

**Questions?**
- Email: jerusalemhills.com@gmail.com
- Subject: AdSense Limited Ads Setup

---

**Last Updated:** October 19, 2025
**Related Docs:** COOKIE_REQUIREMENTS.md, privacy-policy.html, terms-of-service.html

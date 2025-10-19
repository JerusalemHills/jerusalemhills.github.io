# AdSense Kickstart Guide

## 🔴 Quick Start: Enable Limited Ads in 5 Minutes

### Step 1: Sign In to AdSense
1. Go to https://adsense.google.com
2. Sign in with your Google account (linked to AdSense)

---

### Step 2: Navigate to Limited Ads Settings

**Option A: If you see "Brand Safety" in sidebar:**
1. Click **Brand Safety** in left sidebar
2. Click **Ad serving**
3. Find **"Limited ads"** section

**Option B: If you see "Privacy & messaging":**
1. Click **Privacy & messaging** in left sidebar
2. Look for **"Limited ads"** toggle

**Option C: If you don't see either:**
1. Click **Settings** (gear icon)
2. Click **Account** → **Access and authorization**
3. Look for **"Ad serving"** or **"Privacy"** section

---

### Step 3: Enable Limited Ads

1. Find the **"Limited ads"** toggle switch
2. Click to turn it **ON** (should turn blue/green)
3. Read the popup message:
   - "Limited ads serve non-personalized ads"
   - "Revenue may be lower"
   - "Ads are contextual (page content only)"
4. Click **"Save"** or **"Confirm"**
5. Wait 2-3 seconds for confirmation message

---

### Step 4: Verify Settings

1. The toggle should stay **ON** (blue/enabled state)
2. You should see a message like:
   - "Limited ads: On"
   - "Non-personalized ads will be served"
3. If the toggle turns off automatically, your account may not support Limited Ads yet

---

## 🟡 What If I Can't Find "Limited Ads"?

### Possible Reasons:

1. **Account Too New** (< 6 months old)
   - Solution: Wait until account is older, or contact AdSense support

2. **Wrong Country/Region**
   - Limited Ads not available in all countries
   - Solution: Contact AdSense support to check availability

3. **Using AdSense for Search** (not Display)
   - Limited Ads only works for Display ads
   - Solution: Switch to AdSense for Content

4. **Account Has Policy Violations**
   - Solution: Fix violations first, then try again

5. **Old AdSense Interface**
   - Solution: Look for "Upgrade to new interface" banner at top

---

## 🟢 Alternative: Contact AdSense Support

If you can't find the Limited Ads setting:

1. Go to https://support.google.com/adsense
2. Click **"Contact us"** at bottom of page
3. Select **"Ad serving"** as topic
4. Ask: "How do I enable Limited Ads (non-personalized ads) for my account?"
5. Provide your:
   - Publisher ID: `ca-pub-1738161253720`
   - Website: `https://jerusalemhills.com`
   - Request: Enable Limited Ads feature

---

## 🔴 Verify Limited Ads Are Working

### Test 1: Check Your Website (5-10 min after enabling)

1. Visit https://jerusalemhills.com
2. Open Chrome DevTools (F12)
3. Go to **Console** tab
4. Look for these messages:
   ```
   ✅ AdSense: Initializing Limited Ads (non-personalized)
   ✅ AdSense: Limited Ads (data-npa=1) enabled
   ✅ AdSense: Cookie-less operation verified (no ad cookies found)
   ```

5. If you see these, Limited Ads are working! ✅

### Test 2: Check for Cookies

1. In DevTools, go to **Application** tab
2. Expand **Cookies** in left sidebar
3. Click on `https://jerusalemhills.com`
4. Look for these cookie names:
   - `__gads` ❌ (should NOT exist)
   - `__gac` ❌ (should NOT exist)
   - `_gcl_au` ❌ (should NOT exist)

5. If you see ZERO ad cookies, Limited Ads are working! ✅

### Test 3: Check Kids Zone Protection

1. Visit https://jerusalemhills.com/kids/
2. Open Console
3. Should see:
   ```
   🚫 AdSense: Disabled in Kids Zone (COPPA compliance)
   ```

4. Verify: No ads anywhere in Kids Zone ✅

---

## 🟡 What If It's Not Working?

### Issue: AdSense script not loading

**Console shows:** "AdSense: Failed to load script"

**Solutions:**
1. Check if ad blocker is enabled (disable it temporarily)
2. Check browser console for errors
3. Verify your AdSense account is approved (not under review)
4. Wait 24-48 hours for changes to propagate

### Issue: Ads showing but cookies still present

**Console shows:** "⚠️ AdSense: Ad cookies detected"

**Solutions:**
1. Clear browser cache and cookies
2. Verify Limited Ads toggle is still ON in AdSense dashboard
3. Check that `data-npa="1"` is in ad code (already done by our script)
4. Wait 24-48 hours for changes to propagate
5. Some cookies (`_gpi`) may appear for fraud detection only - this is normal

### Issue: No ads showing at all

**Possible Causes:**
1. AdSense account under review (new accounts take 1-3 days)
2. Low traffic (AdSense requires minimum traffic)
3. Content policy violations
4. Ad blocker enabled

**Solutions:**
1. Check AdSense dashboard for approval status
2. Check for policy violation warnings
3. Test in incognito mode with ad blocker disabled
4. Wait 24-48 hours and try again

---

## 🟢 Expected Revenue Impact

After enabling Limited Ads, expect:

| Metric | Before Limited Ads | After Limited Ads | Change |
|--------|-------------------|-------------------|--------|
| **CPM** | $5-$10 | $2-$4 | ↓ 40-60% |
| **Impressions** | Baseline | Similar | → |
| **CTR** | Baseline | -10% to -20% | ↓ |
| **Total Revenue** | $100 | $40-$60 | ↓ 40-60% |

**Why revenue drops:**
- No personalized targeting (ads based on page content only)
- Lower advertiser demand for non-personalized ads
- No remarketing or cross-site tracking

**Benefits:**
- ✅ Privacy-first (no tracking cookies)
- ✅ No consent banners needed
- ✅ COPPA compliant (safe for Kids Zone)
- ✅ Faster page loads
- ✅ Better user experience

---

## 🔴 Quick Checklist

- [ ] Sign in to AdSense dashboard
- [ ] Find "Limited ads" setting (Brand Safety → Ad serving)
- [ ] Toggle "Limited ads" to **ON**
- [ ] Save changes
- [ ] Wait 5-10 minutes for changes to propagate
- [ ] Visit your site and check browser console
- [ ] Verify: Console shows "✅ AdSense: Limited Ads enabled"
- [ ] Verify: Zero ad cookies in Application tab
- [ ] Verify: Kids Zone has no ads
- [ ] Monitor revenue for 30 days

---

## 🟡 Still Need Help?

**Option 1: AdSense Support**
- https://support.google.com/adsense
- Contact: "How to enable Limited Ads"

**Option 2: Check Documentation**
- See: `ADSENSE_LIMITED_ADS_SETUP.md` (detailed 10-part guide)
- See: `COOKIE_REQUIREMENTS.md` (full analysis)

**Option 3: Email**
- jerusalemhills.com@gmail.com
- Subject: "AdSense Limited Ads Setup Help"

---

**Last Updated:** October 19, 2025
**Status:** Live on site (code deployed)
**Action Needed:** Enable Limited Ads toggle in AdSense dashboard

# YouTube Carousel Fix

## 🔴 Problem
The YouTube video carousel on index.html is **not showing videos** from the Jerusalem Hills YouTube playlist.

## 🔍 Root Cause
The YouTube Data API v3 is **disabled** for the Google API key currently in use.

**API Key:** `AIzaSyB5_m5vWCLhVcPKlItsT62fMB_bk2YyHIs`

**Error Message:**
```
YouTube Data API v3 has not been used in project 418995824689 before or it is disabled.
```

## ✅ Solution

### Option 1: Enable YouTube Data API (5 minutes)
1. Go to: https://console.developers.google.com/apis/api/youtube.googleapis.com/overview?project=418995824689
2. Click **"Enable API"**
3. Wait 2-3 minutes for changes to propagate
4. Test the carousel - videos should appear

### Option 2: Create New API Key with YouTube API Enabled (10 minutes)
1. Go to: https://console.cloud.google.com/apis/credentials
2. Create new API key
3. Enable **YouTube Data API v3**
4. Restrict key to `jerusalemhills.com` domain
5. Update `YOUTUBE_API_KEY` in index.html line 309

## 📋 Current Configuration

**Playlist ID:** `PLZkWvmItga8Uke86j0__CT5IxPACfvCFy` ✅ (correct)

**API Endpoint (working code):**
```javascript
const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${PLAYLIST_ID}&maxResults=${NUM_VIDEOS}&key=${YOUTUBE_API_KEY}`;
```

**Code Location:** `/index.html` lines 308-431

## 🧪 Test After Fix

Run this command to verify:
```bash
curl "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=PLZkWvmItga8Uke86j0__CT5IxPACfvCFy&maxResults=3&key=YOUR_API_KEY"
```

Expected: JSON with video data
Current: 403 PERMISSION_DENIED error

## 📝 Notes
- The code is **correct** - it was working in commit `0048f48`
- The issue is **API configuration**, not code
- Once API is enabled, carousel will immediately work
- No code changes needed

## ⏱️ Time to Fix
**5 minutes** (just enable the API in Google Console)

---
**Status:** Waiting for user to enable YouTube Data API v3 in Google Cloud Console
**Priority:** Medium (carousel shows fallback videos, but not Jerusalem Hills content)

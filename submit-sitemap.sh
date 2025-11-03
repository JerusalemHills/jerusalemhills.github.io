#!/bin/bash

# Jerusalem Hills - SEO Sitemap Submission Script
# This script helps submit the sitemap to search engines

echo "🏔️ Jerusalem Hills - SEO Sitemap Submission"
echo "=============================================="

DOMAIN="https://jerusalemhills.com"
SITEMAP_URL="${DOMAIN}/sitemap.xml"

echo ""
echo "📄 Sitemap URL: $SITEMAP_URL"
echo ""

# Check if sitemap is accessible
echo "🔍 Checking sitemap accessibility..."
if curl -s --head "$SITEMAP_URL" | head -n 1 | grep -q "200 OK"; then
    echo "✅ Sitemap is accessible"
else
    echo "❌ Sitemap is not accessible - check URL"
    exit 1
fi

echo ""
echo "📋 MANUAL SUBMISSION INSTRUCTIONS:"
echo "=================================="

echo ""
echo "1️⃣  GOOGLE SEARCH CONSOLE:"
echo "   🌐 Visit: https://search.google.com/search-console"
echo "   📌 Add property: $DOMAIN"
echo "   📄 Submit sitemap: $SITEMAP_URL"
echo "   🎯 Path to enter: /sitemap.xml"

echo ""
echo "2️⃣  BING WEBMASTER TOOLS:"
echo "   🌐 Visit: https://www.bing.com/webmasters"
echo "   📌 Add site: $DOMAIN"
echo "   📄 Submit sitemap: $SITEMAP_URL"
echo "   🔐 Verify with meta tag method"

echo ""
echo "3️⃣  AUTOMATIC PING (attempting now):"
echo "   🤖 Notifying search engines of sitemap update..."

# Ping Google
echo "   📍 Pinging Google..."
GOOGLE_PING="http://www.google.com/ping?sitemap=${SITEMAP_URL}"
if curl -s "$GOOGLE_PING" > /dev/null; then
    echo "   ✅ Google pinged successfully"
else
    echo "   ⚠️  Google ping failed (manual submission recommended)"
fi

# Ping Bing
echo "   📍 Pinging Bing..."
BING_PING="http://www.bing.com/ping?sitemap=${SITEMAP_URL}"
if curl -s "$BING_PING" > /dev/null; then
    echo "   ✅ Bing pinged successfully"
else
    echo "   ⚠️  Bing ping failed (manual submission recommended)"
fi

echo ""
echo "🎯 NEXT STEPS:"
echo "============="
echo "1. Manually verify and submit in Google Search Console"
echo "2. Manually verify and submit in Bing Webmaster Tools"
echo "3. Monitor search console for indexing status"
echo "4. Re-run this script after major site updates"

echo ""
echo "📊 SITEMAP STATS:"
echo "================"
echo "📄 Total URLs in sitemap: $(grep -c '<url>' sitemap.xml)"
echo "🎮 Game pages: $(grep -c 'games/' sitemap.xml)"
echo "👶 Kids Zone pages: $(grep -c 'kids/' sitemap.xml)"
echo "💬 Forum pages: $(grep -c 'forum/' sitemap.xml)"
echo "🛒 Marketplace: $(grep -c 'marketplace' sitemap.xml)"

echo ""
echo "✨ Submission process completed!"
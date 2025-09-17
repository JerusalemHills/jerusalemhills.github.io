#!/bin/bash

echo "🔍 Checking Jerusalem Hills Domain Configuration..."
echo "================================================"

# Check DNS
echo ""
echo "1. DNS Records for jerusalemhills.com:"
echo "--------------------------------------"
nslookup jerusalemhills.com | grep -A 4 "Non-authoritative"

# Check GitHub Pages IPs
echo ""
echo "2. Verifying GitHub Pages IPs (should match above):"
echo "---------------------------------------------------"
echo "Expected: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153"

# Check CNAME file
echo ""
echo "3. CNAME File Content:"
echo "---------------------"
cat CNAME

# Check HTTP redirect
echo ""
echo "4. Testing HTTP to HTTPS redirect:"
echo "----------------------------------"
curl -sI http://jerusalemhills.com | grep -E "HTTP|Location" | head -3

# Check HTTPS
echo ""
echo "5. Testing HTTPS:"
echo "----------------"
curl -sI https://jerusalemhills.com | grep "HTTP" | head -1

# Check content loading
echo ""
echo "6. Checking if content loads:"
echo "-----------------------------"
if curl -s https://jerusalemhills.com | grep -q "Jerusalem Hills"; then
    echo "✅ Content is loading correctly!"
else
    echo "❌ Content not loading"
fi

# Test from different endpoint
echo ""
echo "7. Testing jerusalemhills.github.io redirect:"
echo "--------------------------------------------"
curl -sI https://jerusalemhills.github.io | grep -E "HTTP|location" | head -3

echo ""
echo "================================================"
echo "📊 SUMMARY:"
echo ""

# Final check
if curl -s https://jerusalemhills.com | grep -q "Jerusalem Hills"; then
    echo "✅ SUCCESS: Your website is WORKING at https://jerusalemhills.com"
    echo ""
    echo "If you can't see it in your browser, try:"
    echo "1. Clear browser cache (Ctrl+Shift+R)"
    echo "2. Open in incognito/private mode"
    echo "3. Try a different browser"
    echo "4. Flush DNS: sudo systemd-resolve --flush-caches"
    echo "5. Wait a few minutes for propagation"
else
    echo "⚠️  Issue detected. Please check the output above."
fi

echo ""
echo "🌐 Direct links to test:"
echo "   https://jerusalemhills.com"
echo "   https://jerusalemhills.github.io"
echo "================================================"
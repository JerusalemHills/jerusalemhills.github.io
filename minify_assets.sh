#!/bin/bash

# Asset Minification Script for Jerusalem Hills Website
# Minifies CSS and JavaScript files for production

echo "🚀 Starting asset minification for Jerusalem Hills..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check if npm packages are installed globally
if ! command -v terser &> /dev/null; then
    echo "Installing terser for JavaScript minification..."
    sudo npm install -g terser
fi

if ! command -v cleancss &> /dev/null; then
    echo "Installing clean-css-cli for CSS minification..."
    sudo npm install -g clean-css-cli
fi

if ! command -v html-minifier &> /dev/null; then
    echo "Installing html-minifier..."
    sudo npm install -g html-minifier
fi

# Create backup directory
BACKUP_DIR="assets_backup_$(date +%Y%m%d_%H%M%S)"
echo "Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Backup original files
cp -r js "$BACKUP_DIR/"
cp styles.css "$BACKUP_DIR/" 2>/dev/null || true

# Minify JavaScript files
echo ""
echo "📦 Minifying JavaScript files..."

for file in js/*.js; do
    if [[ -f "$file" && ! "$file" == *.min.js ]]; then
        filename=$(basename "$file" .js)
        echo "  Minifying: $file"

        # Create minified version
        terser "$file" \
            --compress \
            --mangle \
            --output "js/${filename}.min.js" \
            --source-map "url='${filename}.min.js.map'" \
            2>/dev/null

        if [ $? -eq 0 ]; then
            original_size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
            minified_size=$(stat -c%s "js/${filename}.min.js" 2>/dev/null || stat -f%z "js/${filename}.min.js" 2>/dev/null)
            reduction=$((100 - (minified_size * 100 / original_size)))
            echo "    ✓ Reduced by ${reduction}% (${original_size} → ${minified_size} bytes)"
        else
            echo "    ✗ Error minifying $file"
        fi
    fi
done

# Minify CSS file
echo ""
echo "🎨 Minifying CSS files..."

if [ -f "styles.css" ]; then
    echo "  Minifying: styles.css"
    cleancss -o styles.min.css styles.css --source-map

    original_size=$(stat -c%s "styles.css" 2>/dev/null || stat -f%z "styles.css" 2>/dev/null)
    minified_size=$(stat -c%s "styles.min.css" 2>/dev/null || stat -f%z "styles.min.css" 2>/dev/null)
    reduction=$((100 - (minified_size * 100 / original_size)))
    echo "    ✓ Reduced by ${reduction}% (${original_size} → ${minified_size} bytes)"
fi

# Create combined JS file for critical scripts
echo ""
echo "📦 Creating combined JavaScript bundle..."

cat > js/bundle.js << 'EOF'
/* Jerusalem Hills - Combined JavaScript Bundle */
EOF

# Add cookie consent first (critical)
if [ -f "js/cookie-consent.js" ]; then
    echo "/* Cookie Consent */" >> js/bundle.js
    cat js/cookie-consent.js >> js/bundle.js
    echo "" >> js/bundle.js
fi

# Add AdSense config
if [ -f "js/adsense-config.js" ]; then
    echo "/* AdSense Config */" >> js/bundle.js
    cat js/adsense-config.js >> js/bundle.js
    echo "" >> js/bundle.js
fi

# Add lazy loading
if [ -f "js/lazy-load.js" ]; then
    echo "/* Lazy Loading */" >> js/bundle.js
    cat js/lazy-load.js >> js/bundle.js
    echo "" >> js/bundle.js
fi

# Minify the bundle
terser js/bundle.js \
    --compress \
    --mangle \
    --output js/bundle.min.js \
    --source-map "url='bundle.min.js.map'"

bundle_size=$(stat -c%s "js/bundle.min.js" 2>/dev/null || stat -f%z "js/bundle.min.js" 2>/dev/null)
echo "  ✓ Created bundle.min.js (${bundle_size} bytes)"

# Create HTML update script
cat > update_html_references.sh << 'EOF'
#!/bin/bash
# Update HTML files to use minified assets

echo "Updating HTML files to use minified assets..."

# Function to update references in HTML files
update_html() {
    local file=$1

    # Create backup
    cp "$file" "${file}.bak"

    # Update CSS references
    sed -i 's/styles\.css/styles.min.css/g' "$file" 2>/dev/null || \
    sed -i '' 's/styles\.css/styles.min.css/g' "$file"

    # Update individual JS to bundle (optional)
    # Uncomment to use bundle instead of individual files:
    # sed -i 's|<script src="/js/cookie-consent.js"></script>.*<script src="/js/lazy-load.js"></script>|<script src="/js/bundle.min.js"></script>|g' "$file"

    # Or update to minified versions
    sed -i 's|/js/cookie-consent\.js|/js/cookie-consent.min.js|g' "$file" 2>/dev/null || \
    sed -i '' 's|/js/cookie-consent\.js|/js/cookie-consent.min.js|g' "$file"

    sed -i 's|/js/adsense-config\.js|/js/adsense-config.min.js|g' "$file" 2>/dev/null || \
    sed -i '' 's|/js/adsense-config\.js|/js/adsense-config.min.js|g' "$file"

    sed -i 's|/js/lazy-load\.js|/js/lazy-load.min.js|g' "$file" 2>/dev/null || \
    sed -i '' 's|/js/lazy-load\.js|/js/lazy-load.min.js|g' "$file"

    echo "  ✓ Updated: $file"
}

# Update main HTML files
for html in *.html; do
    if [ -f "$html" ]; then
        update_html "$html"
    fi
done

# Update market and games index
[ -f "market/index.html" ] && update_html "market/index.html"
[ -f "games/index.html" ] && update_html "games/index.html"

echo "✓ HTML files updated to use minified assets"
EOF

chmod +x update_html_references.sh

# Generate report
echo ""
echo "📊 Minification Report"
echo "====================="

# Calculate total savings
total_original=0
total_minified=0

echo ""
echo "JavaScript Files:"
for file in js/*.min.js; do
    if [ -f "$file" ]; then
        original="${file%.min.js}.js"
        if [ -f "$original" ]; then
            orig_size=$(stat -c%s "$original" 2>/dev/null || stat -f%z "$original" 2>/dev/null)
            min_size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
            total_original=$((total_original + orig_size))
            total_minified=$((total_minified + min_size))
            printf "  %-30s %7d → %7d bytes\n" "$(basename $original):" "$orig_size" "$min_size"
        fi
    fi
done

if [ -f "styles.min.css" ]; then
    echo ""
    echo "CSS Files:"
    orig_size=$(stat -c%s "styles.css" 2>/dev/null || stat -f%z "styles.css" 2>/dev/null)
    min_size=$(stat -c%s "styles.min.css" 2>/dev/null || stat -f%z "styles.min.css" 2>/dev/null)
    total_original=$((total_original + orig_size))
    total_minified=$((total_minified + min_size))
    printf "  %-30s %7d → %7d bytes\n" "styles.css:" "$orig_size" "$min_size"
fi

echo ""
echo "Total Size Reduction:"
if [ $total_original -gt 0 ]; then
    total_reduction=$((100 - (total_minified * 100 / total_original)))
    echo "  Original: $(($total_original / 1024)) KB"
    echo "  Minified: $(($total_minified / 1024)) KB"
    echo "  Saved: $(( ($total_original - $total_minified) / 1024 )) KB (${total_reduction}%)"
fi

echo ""
echo "✅ Minification complete!"
echo ""
echo "💡 Next steps:"
echo "1. Run ./update_html_references.sh to update HTML files"
echo "2. Test the website to ensure everything works"
echo "3. Consider using the bundle.min.js instead of individual files"
echo "4. Deploy minified assets to production"
echo ""
echo "📦 Backup saved in: $BACKUP_DIR"
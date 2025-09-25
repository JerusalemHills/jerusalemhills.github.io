#!/bin/bash

# Asset Minification Script for Jerusalem Hills Website
# Minifies CSS and JavaScript files for production

echo "Jerusalem Hills - Asset Minification Script"
echo "==========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    echo "Run: curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -"
    echo "     sudo apt-get install -y nodejs"
    exit 1
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

# Create minified directory
MINIFIED_DIR="dist"
mkdir -p "$MINIFIED_DIR/js"
mkdir -p "$MINIFIED_DIR/css"

echo ""
echo "Minifying JavaScript files..."
echo "-----------------------------"

# Minify JavaScript files
for file in js/*.js; do
    if [[ -f "$file" && ! "$file" == *.min.js ]]; then
        filename=$(basename "$file")
        output="$MINIFIED_DIR/js/${filename%.js}.min.js"

        terser "$file" -o "$output" --compress --mangle 2>/dev/null

        if [ -f "$output" ]; then
            original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
            minified_size=$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output")
            reduction=$(echo "scale=1; 100 - ($minified_size * 100 / $original_size)" | bc 2>/dev/null || echo "N/A")
            echo "✓ $filename → ${filename%.js}.min.js (reduced by ${reduction}%)"
        fi
    fi
done

echo ""
echo "Extracting and minifying inline CSS..."
echo "---------------------------------------"

# Extract inline CSS from HTML files and create external stylesheets
for file in *.html; do
    if [[ -f "$file" ]]; then
        filename=$(basename "$file" .html)
        css_file="css/${filename}.css"

        # Extract CSS from <style> tags
        sed -n '/<style>/,/<\/style>/p' "$file" | sed '1d;$d' > "$css_file.tmp"

        if [ -s "$css_file.tmp" ]; then
            # Minify the extracted CSS
            cleancss "$css_file.tmp" -o "$MINIFIED_DIR/css/${filename}.min.css" 2>/dev/null
            echo "✓ Extracted and minified CSS from $file"
        fi

        rm -f "$css_file.tmp"
    fi
done

echo ""
echo "Creating combined and minified files..."
echo "----------------------------------------"

# Combine and minify all custom JS files (excluding libraries)
cat js/analytics.js js/ticker.js js/rain.js js/rss-feed-config.js 2>/dev/null | \
    terser -o "$MINIFIED_DIR/js/bundle.min.js" --compress --mangle 2>/dev/null

if [ -f "$MINIFIED_DIR/js/bundle.min.js" ]; then
    echo "✓ Created bundle.min.js with all custom scripts"
fi

echo ""
echo "Optimizing HTML files..."
echo "------------------------"

# Create minified HTML files
for file in index.html marketplace.html contact.html success.html cancel.html; do
    if [[ -f "$file" ]]; then
        output="$MINIFIED_DIR/$file"

        # Minify HTML
        html-minifier "$file" \
            --collapse-whitespace \
            --remove-comments \
            --remove-redundant-attributes \
            --remove-script-type-attributes \
            --remove-style-link-type-attributes \
            --use-short-doctype \
            --minify-css true \
            --minify-js true \
            -o "$output" 2>/dev/null

        if [ -f "$output" ]; then
            echo "✓ Minified $file"
        fi
    fi
done

echo ""
echo "Generating production-ready HTML..."
echo "------------------------------------"

# Update HTML files to use minified assets
for file in $MINIFIED_DIR/*.html; do
    if [[ -f "$file" ]]; then
        # Replace .js with .min.js
        sed -i 's/\.js"/\.min.js"/g' "$file" 2>/dev/null || \
        sed -i '' 's/\.js"/\.min.js"/g' "$file" 2>/dev/null

        # Replace .css with .min.css
        sed -i 's/\.css"/\.min.css"/g' "$file" 2>/dev/null || \
        sed -i '' 's/\.css"/\.min.css"/g' "$file" 2>/dev/null

        echo "✓ Updated asset references in $(basename $file)"
    fi
done

echo ""
echo "Creating deployment script..."
echo "------------------------------"

# Create deployment script
cat > deploy.sh << 'EOF'
#!/bin/bash
# Deploy minified assets to production

echo "Deploying minified assets..."

# Copy minified JS files
cp dist/js/*.min.js js/

# Copy minified CSS files
[ -d dist/css ] && cp dist/css/*.min.css css/ 2>/dev/null

# Optional: Copy minified HTML files
# cp dist/*.html ./

echo "Deployment complete!"
echo "Remember to test the site thoroughly before pushing to production."
EOF

chmod +x deploy.sh

echo ""
echo "Minification Complete!"
echo "====================="

# Show summary
echo ""
echo "Summary:"
echo "--------"
echo "✓ JavaScript files minified in: $MINIFIED_DIR/js/"
echo "✓ CSS files minified in: $MINIFIED_DIR/css/"
echo "✓ HTML files optimized in: $MINIFIED_DIR/"
echo "✓ Bundle created: $MINIFIED_DIR/js/bundle.min.js"
echo ""
echo "To deploy minified assets, run: ./deploy.sh"
echo ""
echo "For production, update your HTML to use:"
echo "  - bundle.min.js instead of individual JS files"
echo "  - .min.css files instead of inline styles"
echo ""
echo "Test thoroughly before deploying to production!"
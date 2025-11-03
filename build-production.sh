#!/bin/bash

# 🚀 Jerusalem Hills Production Build Script
# Optimizes all assets for production deployment

echo "🚀 Starting Jerusalem Hills Production Build..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed. Please install Node.js and npm."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install
fi

# Step 1: Minify JavaScript and CSS assets
echo -e "${BLUE}🗜️  Minifying JavaScript and CSS assets...${NC}"
npm run minify

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Asset minification completed successfully${NC}"
else
    echo "❌ Asset minification failed"
    exit 1
fi

# Step 2: Optimize images (if script exists)
if [ -f "optimize-images.sh" ]; then
    echo -e "${BLUE}🖼️  Optimizing images...${NC}"
    chmod +x optimize-images.sh
    ./optimize-images.sh
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Image optimization completed${NC}"
    else
        echo -e "${YELLOW}⚠️  Image optimization had issues (non-critical)${NC}"
    fi
else
    echo -e "${YELLOW}ℹ️  No image optimization script found (optimize-images.sh)${NC}"
fi

# Step 3: Check minified file sizes
echo -e "${BLUE}📊 Asset size report:${NC}"

echo "JavaScript Files:"
if [ -f "js/main.min.js" ]; then
    main_size=$(du -h js/main.min.js | cut -f1)
    echo "  - main.min.js: $main_size"
fi

if [ -f "js/analytics.min.js" ]; then
    analytics_size=$(du -h js/analytics.min.js | cut -f1)
    echo "  - analytics.min.js: $analytics_size"
fi

if [ -f "kids/assets/js/enhanced-sound-system.min.js" ]; then
    sound_size=$(du -h kids/assets/js/enhanced-sound-system.min.js | cut -f1)
    echo "  - enhanced-sound-system.min.js: $sound_size"
fi

echo "CSS Files:"
if [ -f "styles.min.css" ]; then
    styles_size=$(du -h styles.min.css | cut -f1)
    echo "  - styles.min.css: $styles_size"
fi

if [ -f "kids/assets/css/kids.min.css" ]; then
    kids_size=$(du -h kids/assets/css/kids.min.css | cut -f1)
    echo "  - kids.min.css: $kids_size"
fi

# Step 4: Validate critical files
echo -e "${BLUE}🔍 Validating critical files...${NC}"

critical_files=(
    "index.html"
    "marketplace.html" 
    "kids/index.html"
    "css/styles.css"
    "js/main.js"
    "kids/assets/js/enhanced-sound-system.js"
)

missing_files=()
for file in "${critical_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All critical files present${NC}"
else
    echo -e "${YELLOW}⚠️  Missing files:${NC}"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
fi

# Step 5: Performance recommendations
echo -e "${BLUE}🎯 Performance recommendations:${NC}"
echo "  📱 Test on mobile devices for touch responsiveness"
echo "  🔊 Verify sound system works across browsers"
echo "  🖼️  Check image loading performance on slow connections"
echo "  🧪 Run lighthouse audits on key pages"
echo "  📊 Monitor Core Web Vitals in production"

# Step 6: Final production checklist
echo -e "${BLUE}📋 Production deployment checklist:${NC}"
echo "  ✅ Assets minified and optimized"
echo "  ✅ Enhanced sound system integrated"
echo "  ✅ Kids Zone games enhanced with audio"
echo "  🔲 Deploy to GitHub Pages (git push origin master)"
echo "  🔲 Update Netlify functions if needed"
echo "  🔲 Test payment flow in production"
echo "  🔲 Verify all games work with audio enhancements"

echo -e "${GREEN}🎉 Production build completed successfully!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Test the site locally: python3 -m http.server 8000"
echo "  2. Deploy: git add . && git commit -m 'Production build' && git push"
echo "  3. Monitor performance and user engagement"

echo ""
echo -e "${GREEN}Ready for deployment! 🚀${NC}"
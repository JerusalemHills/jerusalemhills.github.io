#!/bin/bash

# 🖼️ Enhanced Image Optimization Script for Jerusalem Hills Website
# Comprehensive image optimization with lazy loading preparation

echo "🖼️ Jerusalem Hills - Enhanced Image Optimization Script"
echo "======================================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check dependencies and install if needed
echo -e "${BLUE}🔧 Checking dependencies...${NC}"
check_dependency() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${YELLOW}⚠️  $1 not found. Installing...${NC}"
        return 1
    else
        echo -e "${GREEN}✅ $1 found${NC}"
        return 0
    fi
}

# Check ImageMagick
if ! check_dependency "convert"; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install imagemagick
    else
        sudo apt-get update && sudo apt-get install -y imagemagick
    fi
fi

# Check WebP tools
if ! check_dependency "cwebp"; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install webp
    else
        sudo apt-get install -y webp
    fi
fi

# Check pngquant for better PNG optimization
if ! check_dependency "pngquant"; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install pngquant
    else
        sudo apt-get install -y pngquant
    fi
fi

# Create backup directory
BACKUP_DIR="img/original-backup"
mkdir -p "$BACKUP_DIR"

# Function to optimize JPEG images with responsive sizes
optimize_jpeg() {
    local file="$1"
    local filename=$(basename "$file")
    local basename="${filename%.*}"
    local dir=$(dirname "$file")

    echo -e "${BLUE}📸 Processing JPEG: $filename${NC}"

    # Backup original
    cp "$file" "$BACKUP_DIR/$filename"

    # Get original dimensions
    local width=$(identify -format "%w" "$file" 2>/dev/null)
    local height=$(identify -format "%h" "$file" 2>/dev/null)
    local size_before=$(du -k "$file" | cut -f1)

    # Optimize original (quality 85%, progressive, strip metadata)
    convert "$file" -quality 85 -interlace Plane -strip -sampling-factor 4:2:0 "$file"

    # Create responsive sizes if image is large enough
    if [ "$width" -gt 1280 ]; then
        # Create multiple sizes for responsive design
        convert "$file" -resize 640x -quality 80 "${dir}/${basename}-640.jpg"
        convert "$file" -resize 1280x -quality 85 "${dir}/${basename}-1280.jpg"
        
        if [ "$width" -gt 1920 ]; then
            convert "$file" -resize 1920x -quality 85 "${dir}/${basename}-1920.jpg"
        fi
    fi

    # Create WebP versions
    cwebp -q 85 "$file" -o "${file%.jpg}.webp" 2>/dev/null
    
    # Create WebP versions for responsive sizes
    if [ -f "${dir}/${basename}-640.jpg" ]; then
        cwebp -q 80 "${dir}/${basename}-640.jpg" -o "${dir}/${basename}-640.webp" 2>/dev/null
    fi
    if [ -f "${dir}/${basename}-1280.jpg" ]; then
        cwebp -q 85 "${dir}/${basename}-1280.jpg" -o "${dir}/${basename}-1280.webp" 2>/dev/null
    fi
    if [ -f "${dir}/${basename}-1920.jpg" ]; then
        cwebp -q 85 "${dir}/${basename}-1920.jpg" -o "${dir}/${basename}-1920.webp" 2>/dev/null
    fi

    local size_after=$(du -k "$file" | cut -f1)
    local savings=$((size_before - size_after))
    echo -e "${GREEN}✅ Optimized: $filename (saved ${savings}KB)${NC}"
}

# Function to optimize PNG images with advanced compression
optimize_png() {
    local file="$1"
    local filename=$(basename "$file")
    local basename="${filename%.*}"
    local dir=$(dirname "$file")

    echo -e "${BLUE}🖼️ Processing PNG: $filename${NC}"

    # Backup original
    cp "$file" "$BACKUP_DIR/$filename"

    local size_before=$(du -k "$file" | cut -f1)

    # Advanced PNG optimization with pngquant
    if command -v pngquant &> /dev/null; then
        # Use pngquant for lossy compression (much better results)
        pngquant --quality=80-95 --force --ext .png "$file" 2>/dev/null || \
        convert "$file" -strip -define png:compression-level=9 "$file"
    else
        # Fallback to ImageMagick optimization
        convert "$file" -strip -define png:compression-level=9 "$file"
    fi

    # Get dimensions for responsive sizes
    local width=$(identify -format "%w" "$file" 2>/dev/null)
    
    # Create responsive sizes for large PNGs
    if [ "$width" -gt 1280 ]; then
        convert "$file" -resize 640x -strip "${dir}/${basename}-640.png"
        convert "$file" -resize 1280x -strip "${dir}/${basename}-1280.png"
        
        if [ "$width" -gt 1920 ]; then
            convert "$file" -resize 1920x -strip "${dir}/${basename}-1920.png"
        fi
    fi

    # Create WebP versions (better compression for PNG-like images)
    cwebp -q 90 -lossless "$file" -o "${file%.png}.webp" 2>/dev/null
    
    # Create WebP versions for responsive sizes
    if [ -f "${dir}/${basename}-640.png" ]; then
        cwebp -q 90 -lossless "${dir}/${basename}-640.png" -o "${dir}/${basename}-640.webp" 2>/dev/null
    fi
    if [ -f "${dir}/${basename}-1280.png" ]; then
        cwebp -q 90 -lossless "${dir}/${basename}-1280.png" -o "${dir}/${basename}-1280.webp" 2>/dev/null
    fi
    if [ -f "${dir}/${basename}-1920.png" ]; then
        cwebp -q 90 -lossless "${dir}/${basename}-1920.png" -o "${dir}/${basename}-1920.webp" 2>/dev/null
    fi

    local size_after=$(du -k "$file" | cut -f1)
    local savings=$((size_before - size_after))
    echo -e "${GREEN}✅ Optimized: $filename (saved ${savings}KB)${NC}"
}

# Process large images
echo ""
echo "Processing large images (>200KB)..."
echo "-----------------------------------"

# Find and optimize large JPEG files
find img -type f -name "*.jpg" -size +200k | while read file; do
    optimize_jpeg "$file"
done

find img -type f -name "*.jpeg" -size +200k | while read file; do
    optimize_jpeg "$file"
done

# Find and optimize large PNG files
find img -type f -name "*.png" -size +200k | while read file; do
    optimize_png "$file"
done

# Resize extremely large images
echo ""
echo "Resizing extremely large images..."
echo "----------------------------------"

# Resize images larger than 2000px wide
find img -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) | while read file; do
    width=$(identify -format "%w" "$file" 2>/dev/null)
    if [ "$width" -gt 2000 ]; then
        echo "Resizing: $file (width: $width px)"
        convert "$file" -resize 2000x "$file"
    fi
done

# Generate responsive image sizes for hero images
echo ""
echo "Generating responsive image sizes..."
echo "------------------------------------"

# Hero image sizes
HERO_IMAGE="img/header-bg-city-wall.jpg"
if [ -f "$HERO_IMAGE" ]; then
    # Generate different sizes
    convert "$HERO_IMAGE" -resize 640x -quality 85 "img/header-bg-city-wall-640.jpg"
    convert "$HERO_IMAGE" -resize 1280x -quality 85 "img/header-bg-city-wall-1280.jpg"
    convert "$HERO_IMAGE" -resize 1920x -quality 85 "img/header-bg-city-wall-1920.jpg"

    # Generate WebP versions
    cwebp -q 85 "img/header-bg-city-wall-640.jpg" -o "img/header-bg-city-wall-640.webp"
    cwebp -q 85 "img/header-bg-city-wall-1280.jpg" -o "img/header-bg-city-wall-1280.webp"
    cwebp -q 85 "img/header-bg-city-wall-1920.jpg" -o "img/header-bg-city-wall-1920.webp"

    echo "Generated responsive sizes for hero image"
fi

# Summary
echo ""
echo "Optimization Complete!"
echo "====================="
echo "Original images backed up to: $BACKUP_DIR"
echo ""

# Show size reduction
ORIGINAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
NEW_SIZE=$(du -sh img --exclude="$BACKUP_DIR" 2>/dev/null | cut -f1)
echo "Original total size: $ORIGINAL_SIZE"
echo "New total size: $NEW_SIZE"
echo ""
echo "To use WebP images with fallback, update your HTML like this:"
echo '<picture>'
echo '  <source srcset="image.webp" type="image/webp">'
echo '  <img src="image.jpg" alt="Description">'
echo '</picture>'
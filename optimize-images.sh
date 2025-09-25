#!/bin/bash

# Image Optimization Script for Jerusalem Hills Website
# This script optimizes images for web performance

echo "Jerusalem Hills - Image Optimization Script"
echo "==========================================="

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is not installed. Installing..."
    sudo apt-get update && sudo apt-get install -y imagemagick
fi

# Check if webp tools are installed
if ! command -v cwebp &> /dev/null; then
    echo "WebP tools not installed. Installing..."
    sudo apt-get install -y webp
fi

# Create backup directory
BACKUP_DIR="img/original-backup"
mkdir -p "$BACKUP_DIR"

# Function to optimize JPEG images
optimize_jpeg() {
    local file="$1"
    local filename=$(basename "$file")

    # Backup original
    cp "$file" "$BACKUP_DIR/$filename"

    # Optimize JPEG (quality 85%, progressive, strip metadata)
    convert "$file" -quality 85 -interlace Plane -strip "$file"

    # Create WebP version
    cwebp -q 85 "$file" -o "${file%.jpg}.webp" 2>/dev/null

    echo "Optimized: $file"
}

# Function to optimize PNG images
optimize_png() {
    local file="$1"
    local filename=$(basename "$file")

    # Backup original
    cp "$file" "$BACKUP_DIR/$filename"

    # Optimize PNG (compress, strip metadata)
    convert "$file" -strip -define png:compression-level=9 "$file"

    # Create WebP version
    cwebp -q 90 "$file" -o "${file%.png}.webp" 2>/dev/null

    echo "Optimized: $file"
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
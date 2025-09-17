#!/bin/bash

# Image Optimization Script for Jerusalem Hills Website
# This script optimizes images to improve page load performance

echo "🖼️  Starting image optimization for Jerusalem Hills website..."

# Check if required tools are installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick not found. Installing..."
    sudo apt-get update
    sudo apt-get install -y imagemagick
fi

if ! command -v jpegoptim &> /dev/null; then
    echo "jpegoptim not found. Installing..."
    sudo apt-get install -y jpegoptim
fi

if ! command -v optipng &> /dev/null; then
    echo "optipng not found. Installing..."
    sudo apt-get install -y optipng
fi

# Create backup directory
BACKUP_DIR="img_backup_$(date +%Y%m%d_%H%M%S)"
echo "Creating backup directory: $BACKUP_DIR"
cp -r img "$BACKUP_DIR"

# Optimize large JPG images
echo "Optimizing large JPG images..."

# Resize and optimize very large images
for img in img/*.jpg; do
    filename=$(basename "$img")
    filesize=$(stat -c%s "$img")

    # If file is larger than 200KB, optimize more aggressively
    if [ "$filesize" -gt 204800 ]; then
        echo "Optimizing large image: $filename ($(du -h "$img" | cut -f1))"

        # Special handling for hero images
        if [[ "$filename" == "header-bg-city-wall.jpg" ]] || [[ "$filename" == "David's_Tower_11.jpg" ]]; then
            # Resize to max 1920px width while maintaining aspect ratio
            convert "$img" -resize '1920>' -quality 85 -strip "$img.tmp"
            mv "$img.tmp" "$img"
        elif [[ "$filename" == "Jerusalem_Old_City_market.jpg" ]]; then
            # Resize to max 1200px width for secondary images
            convert "$img" -resize '1200>' -quality 85 -strip "$img.tmp"
            mv "$img.tmp" "$img"
        else
            # For other large images, resize to max 800px
            convert "$img" -resize '800>' -quality 85 -strip "$img.tmp"
            mv "$img.tmp" "$img"
        fi
    fi

    # Run jpegoptim on all JPGs
    jpegoptim -m85 --strip-all "$img"
done

# Optimize PNG images
echo "Optimizing PNG images..."
for img in img/*.png; do
    if [ -f "$img" ]; then
        echo "Optimizing: $(basename "$img")"
        optipng -o2 -quiet "$img"
    fi
done

# Create WebP versions for modern browsers
echo "Creating WebP versions for modern browsers..."
for img in img/*.{jpg,png}; do
    if [ -f "$img" ]; then
        filename="${img%.*}"
        cwebp -q 80 "$img" -o "${filename}.webp" 2>/dev/null || true
    fi
done

# Report results
echo ""
echo "✅ Optimization complete!"
echo "Original images backed up in: $BACKUP_DIR"
echo ""
echo "Size comparison:"
echo "Original total: $(du -sh "$BACKUP_DIR" | cut -f1)"
echo "Optimized total: $(du -sh img | cut -f1)"
echo ""
echo "Largest images after optimization:"
ls -lhS img/*.jpg | head -5

echo ""
echo "💡 Tips:"
echo "1. Update HTML to use WebP with JPG fallback:"
echo "   <picture>"
echo "     <source srcset='img/image.webp' type='image/webp'>"
echo "     <img src='img/image.jpg' alt='Description'>"
echo "   </picture>"
echo "2. Consider lazy loading for images below the fold"
echo "3. Use CDN for static assets in production"
#!/usr/bin/env python3

"""
Simple Image Optimization Script for Jerusalem Hills
Works without requiring sudo or external tools installation
"""

import os
import sys
from pathlib import Path

print("Jerusalem Hills - Simple Image Optimization")
print("=" * 45)
print("\n⚠️  This script shows which images need optimization.")
print("For actual optimization, you'll need to:")
print("1. Use an online tool like TinyPNG (tinypng.com)")
print("2. Or install ImageMagick locally: sudo apt-get install imagemagick webp")
print("\n" + "=" * 45 + "\n")

def get_file_size_mb(filepath):
    """Get file size in MB"""
    return os.path.getsize(filepath) / (1024 * 1024)

def analyze_images():
    """Analyze images in the img directory"""
    img_dir = Path("img")
    if not img_dir.exists():
        print("❌ img directory not found!")
        return

    large_images = []
    total_size = 0
    file_count = 0

    # Image extensions to check
    extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

    print("📊 Image Analysis:")
    print("-" * 45)

    for ext in extensions:
        for img_file in img_dir.glob(f"**/*{ext}"):
            if 'original-backup' in str(img_file):
                continue

            size_mb = get_file_size_mb(img_file)
            total_size += size_mb
            file_count += 1

            if size_mb > 0.2:  # Files larger than 200KB
                large_images.append((img_file, size_mb))

    print(f"Total images: {file_count}")
    print(f"Total size: {total_size:.2f} MB")
    print(f"Average size: {total_size/file_count:.2f} MB per image\n")

    if large_images:
        print("🔴 Large images that need optimization:")
        print("-" * 45)
        large_images.sort(key=lambda x: x[1], reverse=True)

        for img_path, size in large_images[:10]:  # Show top 10 largest
            print(f"  {size:.2f} MB - {img_path}")

        print(f"\n⚡ Potential savings: ~{sum(s for _, s in large_images) * 0.6:.2f} MB")
        print("   (assuming 60% compression ratio)")

def check_webp_usage():
    """Check if WebP format is being used"""
    print("\n🎯 WebP Format Check:")
    print("-" * 45)

    webp_count = len(list(Path("img").glob("**/*.webp")))
    jpg_png_count = len(list(Path("img").glob("**/*.jpg"))) + \
                   len(list(Path("img").glob("**/*.png")))

    if webp_count == 0:
        print("❌ No WebP images found")
        print(f"   You have {jpg_png_count} JPG/PNG images that could be converted")
        print("   WebP typically reduces file size by 25-35%")
    else:
        print(f"✅ Found {webp_count} WebP images")

def check_responsive_images():
    """Check for responsive image variants"""
    print("\n📱 Responsive Images Check:")
    print("-" * 45)

    hero_variants = [
        "img/header-bg-city-wall-640.jpg",
        "img/header-bg-city-wall-1280.jpg",
        "img/header-bg-city-wall-1920.jpg"
    ]

    missing = []
    for variant in hero_variants:
        if not Path(variant).exists():
            missing.append(variant)

    if missing:
        print("❌ Missing responsive image sizes:")
        for m in missing:
            print(f"   - {m}")
    else:
        print("✅ Responsive images exist for hero image")

def suggest_optimizations():
    """Provide optimization suggestions"""
    print("\n💡 Optimization Recommendations:")
    print("=" * 45)

    print("""
1. QUICK WIN - Online Tools (5 minutes):
   - Visit: https://tinypng.com
   - Upload your large images
   - Download optimized versions
   - Replace the originals

2. BETTER - Local Tools (10 minutes):
   First install tools:
   $ sudo apt-get update
   $ sudo apt-get install imagemagick webp jpegoptim optipng

   Then run:
   $ ./optimize-images.sh

3. HTML Updates for Better Performance:
   Replace: <img src="image.jpg" alt="...">
   With:    <img src="image.jpg" alt="..." loading="lazy">

4. Use WebP with fallback:
   <picture>
     <source srcset="image.webp" type="image/webp">
     <img src="image.jpg" alt="..." loading="lazy">
   </picture>

5. Responsive Images:
   <img srcset="image-small.jpg 640w,
               image-medium.jpg 1280w,
               image-large.jpg 1920w"
        sizes="(max-width: 640px) 100vw,
               (max-width: 1280px) 50vw,
               33vw"
        src="image-medium.jpg"
        alt="..." loading="lazy">
""")

def main():
    """Main function"""
    try:
        analyze_images()
        check_webp_usage()
        check_responsive_images()
        suggest_optimizations()

        print("\n✅ Analysis complete!")
        print("Follow the recommendations above to optimize your images.\n")

    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
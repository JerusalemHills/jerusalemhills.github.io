/**
 * Comprehensive Lazy Loading System for Jerusalem Hills
 * Advanced image optimization with progressive enhancement
 */

class LazyLoadingSystem {
    constructor(options = {}) {
        this.options = {
            threshold: 0.1,              // Load when 10% visible
            rootMargin: '50px',          // Start loading 50px before visible
            enableWebP: true,            // Use WebP when supported
            placeholderColor: '#f0f0f0', // Placeholder background
            fadeInDuration: 300,         // Fade-in animation duration
            retryAttempts: 3,            // Retry failed loads
            preloadCount: 2,             // Preload next N images
            ...options
        };

        this.observer = null;
        this.images = new Map();
        this.supportsWebP = false;
        this.loadedImages = new Set();
        this.failedImages = new Set();

        this.init();
    }

    async init() {
        // Check WebP support
        this.supportsWebP = await this.checkWebPSupport();
        
        // Initialize Intersection Observer
        this.createObserver();
        
        // Find and setup lazy images
        this.setupLazyImages();
        
        // Setup progressive image enhancement
        this.setupProgressiveEnhancement();
        
        console.log('🖼️ Lazy Loading System initialized with WebP support:', this.supportsWebP);
    }

    checkWebPSupport() {
        return new Promise(resolve => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    createObserver() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: this.options.threshold,
                rootMargin: this.options.rootMargin
            });
        }
    }

    setupLazyImages() {
        // Find all images with data-src attribute
        const lazyImages = document.querySelectorAll('img[data-src], picture source[data-srcset], [data-bg-src]');
        
        lazyImages.forEach(element => {
            this.prepareLazyElement(element);
            
            if (this.observer) {
                this.observer.observe(element);
            } else {
                // Fallback for browsers without Intersection Observer
                this.loadImage(element);
            }
        });
    }

    prepareLazyElement(element) {
        const imageInfo = {
            element,
            originalSrc: element.dataset.src || element.dataset.srcset || element.dataset.bgSrc,
            placeholder: this.createPlaceholder(element),
            retryCount: 0
        };

        this.images.set(element, imageInfo);

        // Add placeholder styling
        if (element.tagName === 'IMG') {
            element.style.backgroundColor = this.options.placeholderColor;
            element.style.minHeight = '200px';
            element.style.opacity = '0';
            element.style.transition = `opacity ${this.options.fadeInDuration}ms ease`;
        }

        // Set up loading and error handling
        element.addEventListener('load', () => this.onImageLoad(element));
        element.addEventListener('error', () => this.onImageError(element));
    }

    createPlaceholder(element) {
        // Create a low-quality placeholder if data-placeholder exists
        if (element.dataset.placeholder) {
            const placeholder = new Image();
            placeholder.src = element.dataset.placeholder;
            placeholder.style.filter = 'blur(5px)';
            placeholder.style.transform = 'scale(1.1)';
            return placeholder;
        }
        return null;
    }

    async loadImage(element) {
        const imageInfo = this.images.get(element);
        if (!imageInfo || this.loadedImages.has(element)) return;

        const { originalSrc } = imageInfo;
        
        try {
            // Determine best source based on WebP support and screen density
            const optimizedSrc = this.getOptimizedSrc(originalSrc, element);
            
            if (element.tagName === 'IMG') {
                element.src = optimizedSrc;
            } else if (element.tagName === 'SOURCE') {
                element.srcset = optimizedSrc;
            } else if (element.dataset.bgSrc) {
                element.style.backgroundImage = `url(${optimizedSrc})`;
            }

            // Preload next images if this is successful
            this.preloadNextImages(element);
            
        } catch (error) {
            console.warn('Image loading failed:', originalSrc, error);
            this.onImageError(element);
        }
    }

    getOptimizedSrc(originalSrc, element) {
        let optimizedSrc = originalSrc;

        // Use WebP if supported and available
        if (this.supportsWebP && this.options.enableWebP) {
            const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
            optimizedSrc = webpSrc;
        }

        // Choose appropriate size based on element dimensions
        const elementWidth = element.offsetWidth || element.parentElement.offsetWidth;
        const pixelRatio = window.devicePixelRatio || 1;
        const targetWidth = Math.ceil(elementWidth * pixelRatio);

        // Use responsive image sizes if available
        optimizedSrc = this.getResponsiveSrc(optimizedSrc, targetWidth);

        return optimizedSrc;
    }

    getResponsiveSrc(src, targetWidth) {
        // Define responsive breakpoints
        const breakpoints = [640, 1280, 1920];
        
        for (const breakpoint of breakpoints) {
            if (targetWidth <= breakpoint) {
                const responsiveSrc = src.replace(/(\.[^.]+)$/, `-${breakpoint}$1`);
                return responsiveSrc;
            }
        }
        
        return src;
    }

    onImageLoad(element) {
        this.loadedImages.add(element);
        
        // Fade in the image
        element.style.opacity = '1';
        element.style.backgroundColor = 'transparent';
        
        // Remove placeholder blur effect if present
        if (element.style.filter) {
            element.style.filter = 'none';
            element.style.transform = 'scale(1)';
        }

        // Track loading performance
        if (typeof gtag !== 'undefined') {
            gtag('event', 'image_loaded', {
                'image_src': element.src,
                'load_time': performance.now()
            });
        }
    }

    onImageError(element) {
        const imageInfo = this.images.get(element);
        if (!imageInfo) return;

        imageInfo.retryCount++;
        
        if (imageInfo.retryCount < this.options.retryAttempts) {
            // Retry with fallback format
            setTimeout(() => {
                const fallbackSrc = imageInfo.originalSrc.replace('.webp', '.jpg');
                element.src = fallbackSrc;
            }, 1000 * imageInfo.retryCount);
        } else {
            // Mark as failed and show placeholder
            this.failedImages.add(element);
            element.style.backgroundColor = '#f5f5f5';
            element.alt = 'Image unavailable';
            
            console.warn('Image failed to load after retries:', imageInfo.originalSrc);
        }
    }

    preloadNextImages(currentElement) {
        // Find next images to preload
        const allImages = Array.from(document.querySelectorAll('img[data-src]'));
        const currentIndex = allImages.indexOf(currentElement);
        
        for (let i = 1; i <= this.options.preloadCount; i++) {
            const nextImage = allImages[currentIndex + i];
            if (nextImage && !this.loadedImages.has(nextImage)) {
                this.loadImage(nextImage);
            }
        }
    }

    setupProgressiveEnhancement() {
        // Progressive enhancement for critical images
        const criticalImages = document.querySelectorAll('[data-critical]');
        
        criticalImages.forEach(img => {
            // Load critical images immediately without lazy loading
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        });
    }

    // Manual loading trigger for dynamic content
    loadNewImages() {
        this.setupLazyImages();
    }

    // Performance monitoring
    getPerformanceMetrics() {
        return {
            totalImages: this.images.size,
            loadedImages: this.loadedImages.size,
            failedImages: this.failedImages.size,
            webpSupport: this.supportsWebP,
            loadingProgress: (this.loadedImages.size / this.images.size) * 100
        };
    }

    // Cleanup method
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.images.clear();
        this.loadedImages.clear();
        this.failedImages.clear();
    }
}

// Enhanced picture element helper
class ResponsiveImageHelper {
    static createPicture(imageSrc, alt, sizes = {}) {
        const picture = document.createElement('picture');
        
        // Add WebP sources
        const webpSource = document.createElement('source');
        webpSource.type = 'image/webp';
        webpSource.srcset = this.generateSrcSet(imageSrc, 'webp', sizes);
        picture.appendChild(webpSource);
        
        // Add fallback sources
        const fallbackSource = document.createElement('source');
        fallbackSource.srcset = this.generateSrcSet(imageSrc, 'jpg', sizes);
        picture.appendChild(fallbackSource);
        
        // Add img element
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = alt;
        img.loading = 'lazy';
        picture.appendChild(img);
        
        return picture;
    }
    
    static generateSrcSet(baseSrc, format, sizes) {
        const breakpoints = sizes.breakpoints || [640, 1280, 1920];
        return breakpoints.map(width => {
            const src = baseSrc.replace(/\.[^.]+$/, `-${width}.${format}`);
            return `${src} ${width}w`;
        }).join(', ');
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.lazyLoader = new LazyLoadingSystem();
    });
} else {
    window.lazyLoader = new LazyLoadingSystem();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LazyLoadingSystem, ResponsiveImageHelper };
}
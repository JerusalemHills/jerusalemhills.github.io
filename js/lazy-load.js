/**
 * Enhanced Lazy Loading System for Jerusalem Hills
 * Advanced image optimization with WebP support and responsive loading
 */

(function() {
    'use strict';

    // Enhanced configuration
    const config = {
        rootMargin: '50px 0px',      // Start loading 50px before entering viewport
        threshold: 0.1,              // Trigger when 10% of image is visible
        fadeInDuration: 300,         // Fade in animation duration
        retryAttempts: 3,            // Retry failed loads
        preloadCount: 2,             // Preload next N images
        enableWebP: true,            // Use WebP when supported
        enableRetina: true,          // Support high-DPI displays
        placeholder: '#f3f4f6'       // Placeholder background color
    };

    // WebP support detection
    let webpSupported = false;
    
    function checkWebPSupport() {
        return new Promise(resolve => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                webpSupported = webP.height === 2;
                resolve(webpSupported);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    // Enhanced Lazy Loading Manager
    const LazyLoadManager = {
        observer: null,
        images: new Map(),
        loadedImages: new Set(),
        failedImages: new Set(),
        initialized: false,

        // Initialize lazy loading
        async init() {
            if (this.initialized) return;

            // Check WebP support
            await checkWebPSupport();
            
            // Check for IntersectionObserver support
            if (!('IntersectionObserver' in window)) {
                // Fallback for older browsers
                this.loadAllImages();
                return;
            }

            // Create observer
            this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
                rootMargin: config.rootMargin,
                threshold: config.threshold
            });

            // Find and observe images
            this.findLazyImages();

            // Handle dynamically added images
            this.observeDynamicContent();

            // Add performance monitoring
            this.setupPerformanceMonitoring();

            this.initialized = true;
            console.log('🖼️ Enhanced Lazy Loading initialized with WebP support:', webpSupported);
        },

        // Find all images that should be lazy loaded
        findLazyImages() {
            // Find images with data-src attribute
            const lazyImages = document.querySelectorAll('img[data-src]:not(.lazy-loaded)');

            // Find images with loading="lazy" attribute
            const nativeLazyImages = document.querySelectorAll('img[loading="lazy"]:not(.lazy-loaded)');

            // Find background images with data-bg attribute
            const lazyBackgrounds = document.querySelectorAll('[data-bg-src]:not(.lazy-loaded)');

            // Find picture elements with data-srcset
            const lazyPictures = document.querySelectorAll('picture source[data-srcset]:not(.lazy-loaded)');

            // Process regular images
            lazyImages.forEach(img => {
                this.prepareImage(img);
                this.observer.observe(img);
                this.images.set(img, { type: 'image', retryCount: 0 });
            });

            // Process native lazy images (enhance with our effects)
            nativeLazyImages.forEach(img => {
                if (!img.complete) {
                    img.classList.add('lazy-loading');
                    img.addEventListener('load', () => this.handleImageLoad(img));
                }
            });

            // Process background images
            lazyBackgrounds.forEach(element => {
                this.observer.observe(element);
                this.images.set(element, { type: 'background', retryCount: 0 });
            });

            // Process picture elements
            lazyPictures.forEach(source => {
                this.observer.observe(source.parentElement);
                this.images.set(source.parentElement, { type: 'picture', retryCount: 0 });
            });
        },

        // Prepare image for lazy loading
        prepareImage(img) {
            // Add loading class for styling
            img.classList.add('lazy-loading');

            // Add placeholder if not present
            if (!img.src && !img.style.backgroundColor) {
                img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
                img.style.backgroundColor = config.placeholder;
            }

            // Store aspect ratio to prevent layout shift
            if (img.dataset.width && img.dataset.height) {
                img.style.aspectRatio = `${img.dataset.width}/${img.dataset.height}`;
            } else if (img.width && img.height) {
                img.style.aspectRatio = `${img.width}/${img.height}`;
            }

            // Add error handling
            img.addEventListener('error', () => this.handleImageError(img));
            img.addEventListener('load', () => this.handleImageLoad(img));
        },

        // Handle intersection observer callback
        handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadElement(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        },

        // Load individual element
        loadElement(element) {
            const imageInfo = this.images.get(element);
            if (!imageInfo || this.loadedImages.has(element)) return;

            switch (imageInfo.type) {
                case 'image':
                    this.loadImage(element);
                    break;
                case 'background':
                    this.loadBackground(element);
                    break;
                case 'picture':
                    this.loadPicture(element);
                    break;
            }

            // Preload next images
            this.preloadNextImages(element);
        },

        // Load regular image with WebP support
        loadImage(img) {
            const src = img.dataset.src;
            const srcset = img.dataset.srcset;

            if (!src) return;

            // Get optimized source
            const optimizedSrc = this.getOptimizedSrc(src, img);
            const optimizedSrcset = srcset ? this.getOptimizedSrcset(srcset) : null;

            // Create preload image
            const tempImg = new Image();

            tempImg.onload = () => {
                // Set the real source
                if (optimizedSrcset) {
                    img.srcset = optimizedSrcset;
                }
                img.src = optimizedSrc;

                this.handleImageLoad(img);
                this.loadedImages.add(img);

                // Clean up data attributes
                delete img.dataset.src;
                delete img.dataset.srcset;

                // Track performance
                this.trackImageLoad(img, optimizedSrc);
            };

            tempImg.onerror = () => this.handleImageError(img);

            // Start loading
            if (optimizedSrcset) {
                tempImg.srcset = optimizedSrcset;
            }
            tempImg.src = optimizedSrc;
        },

        // Load background image
        loadBackground(element) {
            const bg = element.dataset.bgSrc;
            if (!bg) return;

            const optimizedBg = this.getOptimizedSrc(bg, element);
            const tempImg = new Image();

            tempImg.onload = () => {
                element.style.backgroundImage = `url(${optimizedBg})`;
                element.classList.remove('lazy-loading');
                element.classList.add('lazy-loaded');

                // Fade in effect
                element.style.animation = `lazyFadeIn ${config.fadeInDuration}ms ease`;
                this.loadedImages.add(element);

                delete element.dataset.bgSrc;
            };

            tempImg.onerror = () => this.handleImageError(element);
            tempImg.src = optimizedBg;
        },

        // Load picture element
        loadPicture(picture) {
            const sources = picture.querySelectorAll('source[data-srcset]');
            const img = picture.querySelector('img');

            sources.forEach(source => {
                const srcset = source.dataset.srcset;
                if (srcset) {
                    source.srcset = this.getOptimizedSrcset(srcset);
                    delete source.dataset.srcset;
                }
            });

            if (img && img.dataset.src) {
                this.loadImage(img);
            }

            this.loadedImages.add(picture);
        },

        // Get optimized source with WebP support
        getOptimizedSrc(src, element) {
            let optimizedSrc = src;

            // Use WebP if supported
            if (webpSupported && config.enableWebP && !src.includes('.svg')) {
                optimizedSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
            }

            // Use responsive size based on element width
            if (element) {
                const width = element.offsetWidth || element.parentElement?.offsetWidth || 400;
                const pixelRatio = config.enableRetina ? (window.devicePixelRatio || 1) : 1;
                const targetWidth = Math.ceil(width * pixelRatio);

                optimizedSrc = this.getResponsiveSrc(optimizedSrc, targetWidth);
            }

            return optimizedSrc;
        },

        // Get optimized srcset
        getOptimizedSrcset(srcset) {
            if (!webpSupported || !config.enableWebP) return srcset;

            return srcset.replace(/\.(jpg|jpeg|png)(\s+\d+w)/gi, '.webp$2');
        },

        // Get responsive source
        getResponsiveSrc(src, targetWidth) {
            const breakpoints = [640, 1280, 1920];
            
            for (const breakpoint of breakpoints) {
                if (targetWidth <= breakpoint) {
                    return src.replace(/(\.[^.]+)$/, `-${breakpoint}$1`);
                }
            }
            
            return src;
        },

        // Handle successful image load
        handleImageLoad(img) {
            img.classList.remove('lazy-loading');
            img.classList.add('lazy-loaded');

            // Add fade-in animation
            img.style.animation = `lazyFadeIn ${config.fadeInDuration}ms ease`;
            img.style.backgroundColor = 'transparent';

            // Clean up after animation
            setTimeout(() => {
                img.style.animation = '';
            }, config.fadeInDuration);
        },

        // Handle image error with retry
        handleImageError(element) {
            const imageInfo = this.images.get(element);
            if (!imageInfo) return;

            imageInfo.retryCount++;

            if (imageInfo.retryCount < config.retryAttempts) {
                // Retry with fallback format
                setTimeout(() => {
                    if (element.tagName === 'IMG') {
                        const fallbackSrc = element.dataset.src?.replace('.webp', '.jpg') || element.src;
                        element.src = fallbackSrc;
                    }
                }, 1000 * imageInfo.retryCount);
            } else {
                // Mark as failed
                this.failedImages.add(element);
                element.classList.remove('lazy-loading');
                element.classList.add('lazy-error');
                
                console.warn('Image failed to load after retries:', element.dataset.src || element.src);
            }
        },

        // Preload next images in sequence
        preloadNextImages(currentElement) {
            const allImages = Array.from(this.images.keys());
            const currentIndex = allImages.indexOf(currentElement);
            
            for (let i = 1; i <= config.preloadCount; i++) {
                const nextElement = allImages[currentIndex + i];
                if (nextElement && !this.loadedImages.has(nextElement)) {
                    this.loadElement(nextElement);
                }
            }
        },

        // Handle dynamically added content
        observeDynamicContent() {
            if ('MutationObserver' in window) {
                const mutationObserver = new MutationObserver(mutations => {
                    mutations.forEach(mutation => {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === 1) {
                                if (node.tagName === 'IMG' && node.dataset.src) {
                                    this.prepareImage(node);
                                    this.observer.observe(node);
                                    this.images.set(node, { type: 'image', retryCount: 0 });
                                } else if (node.querySelectorAll) {
                                    this.findLazyImages();
                                }
                            }
                        });
                    });
                });

                mutationObserver.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
        },

        // Performance monitoring
        setupPerformanceMonitoring() {
            if ('PerformanceObserver' in window && typeof gtag !== 'undefined') {
                // Monitor loading performance
                const perfObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach(entry => {
                        if (entry.name.includes('image') || entry.name.includes('.jpg') || entry.name.includes('.webp')) {
                            gtag('event', 'image_performance', {
                                'image_name': entry.name,
                                'load_time': Math.round(entry.duration),
                                'transfer_size': entry.transferSize || 0
                            });
                        }
                    });
                });

                try {
                    perfObserver.observe({ entryTypes: ['resource'] });
                } catch (e) {
                    console.log('Performance Observer not fully supported');
                }
            }
        },

        // Track individual image loads
        trackImageLoad(img, src) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'lazy_image_loaded', {
                    'image_src': src,
                    'webp_used': src.includes('.webp'),
                    'element_width': img.offsetWidth || 0
                });
            }
        },

        // Fallback for browsers without IntersectionObserver
        loadAllImages() {
            const images = document.querySelectorAll('img[data-src]');
            images.forEach(img => this.loadImage(img));

            const backgrounds = document.querySelectorAll('[data-bg-src]');
            backgrounds.forEach(element => this.loadBackground(element));
        },

        // Force load all remaining images
        loadAll() {
            this.images.forEach((info, element) => this.loadElement(element));
        },

        // Refresh lazy loading
        refresh() {
            this.findLazyImages();
        },

        // Get performance metrics
        getMetrics() {
            return {
                totalImages: this.images.size,
                loadedImages: this.loadedImages.size,
                failedImages: this.failedImages.size,
                webpSupport: webpSupported,
                loadingProgress: (this.loadedImages.size / this.images.size) * 100
            };
        }
    };

    // Enhanced CSS with better animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes lazyFadeIn {
            from {
                opacity: 0;
                transform: translateY(10px) scale(0.98);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        @keyframes placeholderShimmer {
            0% { background-position: -200px 0; }
            100% { background-position: calc(200px + 100%) 0; }
        }

        .lazy-loading {
            opacity: 0;
            transition: opacity ${config.fadeInDuration}ms ease;
            background: linear-gradient(90deg, ${config.placeholder} 25%, #e9ecef 50%, ${config.placeholder} 75%);
            background-size: 200px 100%;
            animation: placeholderShimmer 1.5s infinite;
        }

        .lazy-loaded {
            opacity: 1;
        }

        .lazy-error {
            opacity: 0.5;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
        }

        /* Prevent layout shift */
        img.lazy-loading {
            min-height: 100px;
        }

        /* High contrast support */
        @media (prefers-contrast: high) {
            .lazy-loading {
                background: #000;
            }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
            .lazy-loading {
                animation: none;
                transition: none;
            }
            
            @keyframes lazyFadeIn {
                from, to { 
                    opacity: 1;
                    transform: none;
                }
            }
        }
    `;
    document.head.appendChild(style);

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            LazyLoadManager.init();
        });
    } else {
        LazyLoadManager.init();
    }

    // Handle print event
    window.addEventListener('beforeprint', () => {
        LazyLoadManager.loadAll();
    });

    // Expose to global scope
    window.LazyLoadManager = LazyLoadManager;

    // Export metrics for monitoring
    window.getLazyLoadMetrics = () => LazyLoadManager.getMetrics();
})();

// Enhanced helper function for converting images
function convertToLazyLoad(selector) {
    const images = document.querySelectorAll(selector || 'img');
    images.forEach(img => {
        // Skip if already processed or is critical
        if (img.classList.contains('lazy-loaded') ||
            img.classList.contains('lazy-loading') ||
            img.dataset.critical ||
            img.src.includes('logo') ||
            img.src.includes('favicon') ||
            img.width < 50) {
            return;
        }

        // Convert src to data-src
        if (img.src && !img.dataset.src && !img.src.includes('data:')) {
            img.dataset.src = img.src;
            img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
        }

        // Convert srcset to data-srcset
        if (img.srcset && !img.dataset.srcset) {
            img.dataset.srcset = img.srcset;
            img.srcset = '';
        }

        // Store dimensions
        if (img.width) img.dataset.width = img.width;
        if (img.height) img.dataset.height = img.height;
    });

    // Refresh lazy loading
    if (window.LazyLoadManager) {
        window.LazyLoadManager.refresh();
    }
}
// Lazy Loading Implementation for Jerusalem Hills
(function() {
    'use strict';

    // Configuration
    const config = {
        rootMargin: '50px 0px', // Start loading 50px before entering viewport
        threshold: 0.01, // Trigger when 1% of image is visible
        fadeInDuration: 300 // Fade in animation duration
    };

    // Lazy Loading Manager
    const LazyLoadManager = {
        observer: null,
        images: [],
        initialized: false,

        // Initialize lazy loading
        init: function() {
            if (this.initialized) return;

            // Check for IntersectionObserver support
            if (!('IntersectionObserver' in window)) {
                // Fallback for older browsers - load all images immediately
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

            this.initialized = true;
        },

        // Find all images that should be lazy loaded
        findLazyImages: function() {
            // Find images with data-src attribute
            const lazyImages = document.querySelectorAll('img[data-src]:not(.lazy-loaded)');

            // Find images with loading="lazy" attribute
            const nativeLazyImages = document.querySelectorAll('img[loading="lazy"]:not(.lazy-loaded)');

            // Find background images with data-bg attribute
            const lazyBackgrounds = document.querySelectorAll('[data-bg]:not(.lazy-loaded)');

            // Process regular images
            lazyImages.forEach(img => {
                this.prepareImage(img);
                this.observer.observe(img);
                this.images.push(img);
            });

            // Process native lazy images (enhance with our fade-in effect)
            nativeLazyImages.forEach(img => {
                if (!img.complete) {
                    img.classList.add('lazy-loading');
                    img.addEventListener('load', () => this.handleImageLoad(img));
                }
            });

            // Process background images
            lazyBackgrounds.forEach(element => {
                this.observer.observe(element);
                this.images.push(element);
            });
        },

        // Prepare image for lazy loading
        prepareImage: function(img) {
            // Add loading class for styling
            img.classList.add('lazy-loading');

            // Add placeholder if not present
            if (!img.src && !img.style.backgroundColor) {
                // Use a small transparent placeholder
                img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
                img.style.backgroundColor = '#f3f4f6';
            }

            // Store aspect ratio to prevent layout shift
            if (img.width && img.height) {
                img.style.aspectRatio = `${img.width}/${img.height}`;
            }
        },

        // Handle intersection observer callback
        handleIntersection: function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadElement(entry.target);
                }
            });
        },

        // Load individual element (image or background)
        loadElement: function(element) {
            if (element.tagName === 'IMG') {
                this.loadImage(element);
            } else if (element.hasAttribute('data-bg')) {
                this.loadBackground(element);
            }

            // Stop observing this element
            if (this.observer) {
                this.observer.unobserve(element);
            }

            // Remove from images array
            const index = this.images.indexOf(element);
            if (index > -1) {
                this.images.splice(index, 1);
            }
        },

        // Load regular image
        loadImage: function(img) {
            const src = img.dataset.src;
            const srcset = img.dataset.srcset;

            if (!src) return;

            // Create a new image to preload
            const tempImg = new Image();

            // Handle successful load
            tempImg.onload = () => {
                // Set the real source
                if (srcset) {
                    img.srcset = srcset;
                }
                img.src = src;

                // Handle the load animation
                this.handleImageLoad(img);

                // Clean up data attributes
                delete img.dataset.src;
                delete img.dataset.srcset;
            };

            // Handle error
            tempImg.onerror = () => {
                img.classList.remove('lazy-loading');
                img.classList.add('lazy-error');

                // Try fallback image if specified
                if (img.dataset.fallback) {
                    img.src = img.dataset.fallback;
                }
            };

            // Start loading
            if (srcset) {
                tempImg.srcset = srcset;
            }
            tempImg.src = src;
        },

        // Load background image
        loadBackground: function(element) {
            const bg = element.dataset.bg;
            if (!bg) return;

            // Create image to preload
            const tempImg = new Image();

            tempImg.onload = () => {
                element.style.backgroundImage = `url(${bg})`;
                element.classList.remove('lazy-loading');
                element.classList.add('lazy-loaded');

                // Fade in effect
                element.style.animation = `lazyFadeIn ${config.fadeInDuration}ms ease`;

                // Clean up
                delete element.dataset.bg;
            };

            tempImg.src = bg;
        },

        // Handle image load event
        handleImageLoad: function(img) {
            img.classList.remove('lazy-loading');
            img.classList.add('lazy-loaded');

            // Add fade-in animation
            img.style.animation = `lazyFadeIn ${config.fadeInDuration}ms ease`;

            // Remove animation after completion
            setTimeout(() => {
                img.style.animation = '';
            }, config.fadeInDuration);
        },

        // Observe dynamically added content
        observeDynamicContent: function() {
            // Use MutationObserver to detect new images
            if ('MutationObserver' in window) {
                const mutationObserver = new MutationObserver(mutations => {
                    mutations.forEach(mutation => {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === 1) { // Element node
                                // Check if it's an image or contains images
                                if (node.tagName === 'IMG' && node.dataset.src) {
                                    this.prepareImage(node);
                                    this.observer.observe(node);
                                    this.images.push(node);
                                } else if (node.querySelectorAll) {
                                    // Find lazy images within the added node
                                    const images = node.querySelectorAll('img[data-src]:not(.lazy-loaded)');
                                    images.forEach(img => {
                                        this.prepareImage(img);
                                        this.observer.observe(img);
                                        this.images.push(img);
                                    });
                                }
                            }
                        });
                    });
                });

                // Observe the entire document for changes
                mutationObserver.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
        },

        // Fallback for browsers without IntersectionObserver
        loadAllImages: function() {
            const images = document.querySelectorAll('img[data-src]');
            images.forEach(img => this.loadImage(img));

            const backgrounds = document.querySelectorAll('[data-bg]');
            backgrounds.forEach(element => this.loadBackground(element));
        },

        // Force load all remaining images (useful for print, etc.)
        loadAll: function() {
            this.images.forEach(element => this.loadElement(element));
        },

        // Refresh lazy loading (useful after AJAX content load)
        refresh: function() {
            this.findLazyImages();
        }
    };

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes lazyFadeIn {
            from {
                opacity: 0;
                transform: scale(0.98);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        .lazy-loading {
            opacity: 0;
            transition: opacity ${config.fadeInDuration}ms ease;
        }

        .lazy-loaded {
            opacity: 1;
        }

        .lazy-error {
            opacity: 0.5;
            background: #f3f4f6;
        }

        /* Prevent layout shift */
        img.lazy-loading {
            background: #f3f4f6;
        }
    `;
    document.head.appendChild(style);

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            LazyLoadManager.init();
        });
    } else {
        LazyLoadManager.init();
    }

    // Handle print event - load all images before printing
    window.addEventListener('beforeprint', function() {
        LazyLoadManager.loadAll();
    });

    // Expose to global scope
    window.LazyLoadManager = LazyLoadManager;
})();

// Helper function to convert existing images to lazy loaded
function convertToLazyLoad(selector) {
    const images = document.querySelectorAll(selector || 'img');
    images.forEach(img => {
        // Skip if already lazy loaded or is a logo/icon
        if (img.classList.contains('lazy-loaded') ||
            img.classList.contains('lazy-loading') ||
            img.src.includes('logo') ||
            img.src.includes('favicon') ||
            img.width < 50) {
            return;
        }

        // Convert src to data-src
        if (img.src && !img.dataset.src) {
            img.dataset.src = img.src;
            img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
        }

        // Convert srcset to data-srcset
        if (img.srcset && !img.dataset.srcset) {
            img.dataset.srcset = img.srcset;
            img.srcset = '';
        }
    });

    // Refresh lazy loading
    if (window.LazyLoadManager) {
        window.LazyLoadManager.refresh();
    }
}
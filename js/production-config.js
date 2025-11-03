/**
 * Production Configuration for Jerusalem Hills
 * Automatically detects environment and loads optimized assets
 */

(function() {
    'use strict';
    
    // Detect production environment
    const isProduction = window.location.hostname !== 'localhost' && 
                        window.location.hostname !== '127.0.0.1' &&
                        !window.location.hostname.includes('localhost');
    
    // Asset configuration
    const assets = {
        css: {
            main: isProduction ? 'styles.min.css' : 'styles.css',
            kids: isProduction ? 'kids/assets/css/kids.min.css' : 'kids/assets/css/kids.css',
            game: isProduction ? 'kids/assets/css/game.min.css' : 'kids/assets/css/game.css'
        },
        js: {
            main: isProduction ? 'js/main.min.js' : 'js/main.js',
            analytics: isProduction ? 'js/analytics.min.js' : 'js/analytics.js',
            soundManager: isProduction ? 'kids/assets/js/sound-manager.min.js' : 'kids/assets/js/sound-manager.js',
            enhancedSound: isProduction ? 'kids/assets/js/enhanced-sound-system.min.js' : 'kids/assets/js/enhanced-sound-system.js',
            accessibility: isProduction ? 'js/accessibility-enhancements.min.js' : 'js/accessibility-enhancements.js',
            mobileTouch: isProduction ? 'js/mobile-touch-controls.min.js' : 'js/mobile-touch-controls.js'
        }
    };
    
    // Performance monitoring for production
    if (isProduction && typeof gtag !== 'undefined') {
        // Track asset loading performance
        const startTime = performance.now();
        
        window.addEventListener('load', function() {
            const loadTime = performance.now() - startTime;
            gtag('event', 'page_load_time', {
                'custom_parameter': Math.round(loadTime)
            });
        });
        
        // Track Core Web Vitals
        if ('PerformanceObserver' in window) {
            try {
                new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        if (entry.entryType === 'largest-contentful-paint') {
                            gtag('event', 'web_vital_lcp', {
                                'custom_parameter': Math.round(entry.startTime)
                            });
                        }
                        if (entry.entryType === 'first-input') {
                            gtag('event', 'web_vital_fid', {
                                'custom_parameter': Math.round(entry.processingStart - entry.startTime)
                            });
                        }
                        if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                            gtag('event', 'web_vital_cls', {
                                'custom_parameter': entry.value
                            });
                        }
                    });
                }).observe({
                    entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift']
                });
            } catch (e) {
                console.log('Performance Observer not fully supported');
            }
        }
    }
    
    // Audio performance optimization
    if (isProduction) {
        // Reduce audio complexity on slower connections
        if (navigator.connection) {
            const connection = navigator.connection;
            const slowConnections = ['slow-2g', '2g', '3g'];
            
            if (slowConnections.includes(connection.effectiveType)) {
                window.audioComplexity = 'minimal';
            } else {
                window.audioComplexity = 'full';
            }
        }
        
        // Battery-aware audio optimization
        if ('getBattery' in navigator) {
            navigator.getBattery().then(function(battery) {
                if (battery.charging === false && battery.level < 0.2) {
                    window.audioComplexity = 'minimal';
                }
            });
        }
    }
    
    // Export configuration
    window.JerusalemHillsConfig = {
        isProduction: isProduction,
        assets: assets,
        audioComplexity: window.audioComplexity || 'full'
    };
    
    // Development helpers
    if (!isProduction) {
        console.log('🛠️ Development Mode Active');
        console.log('📦 Using unminified assets for debugging');
        console.log('🎵 Audio complexity:', window.audioComplexity || 'full');
    } else {
        console.log('🚀 Production Mode - Optimized Assets Loaded');
    }
})();

/**
 * Dynamic Asset Loader
 * Loads the appropriate assets based on environment
 */
function loadOptimizedAsset(type, name, callback) {
    const config = window.JerusalemHillsConfig;
    const assetPath = config.assets[type][name];
    
    if (type === 'css') {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = assetPath;
        link.onload = callback;
        document.head.appendChild(link);
    } else if (type === 'js') {
        const script = document.createElement('script');
        script.src = assetPath;
        script.onload = callback;
        script.async = true;
        document.head.appendChild(script);
    }
}
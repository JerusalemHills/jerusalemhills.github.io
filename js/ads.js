/**
 * Jerusalem Hills Advertising Management System
 * 
 * This file manages all ad placements throughout the site.
 * It provides functions for loading, displaying, and tracking ads.
 */

const JHAds = (function() {
    // Configuration object for ad placements
    const adConfig = {
        // Define ad placement zones
        placements: {
            'home-top-banner': {
                selector: '.home-banner-ad',
                sizes: [[728, 90], [320, 100]],
                sizeMapping: [
                    { viewport: [0, 0], sizes: [[320, 100]] },
                    { viewport: [768, 0], sizes: [[728, 90]] }
                ],
                isActive: true
            },
            'sidebar': {
                selector: '.sidebar-ad',
                sizes: [[300, 250]],
                isActive: true
            },
            'content-middle': {
                selector: '.content-middle-ad',
                sizes: [[336, 280], [300, 250]],
                isActive: true
            },
            'game-banner': {
                selector: '.game-banner-ad',
                sizes: [[728, 90], [320, 100]],
                sizeMapping: [
                    { viewport: [0, 0], sizes: [[320, 100]] },
                    { viewport: [768, 0], sizes: [[728, 90]] }
                ],
                isActive: true
            },
            'forum-sidebar': {
                selector: '.forum-sidebar-ad',
                sizes: [[300, 250]],
                isActive: true
            }
        },
        
        // Default settings
        defaults: {
            adProvider: 'adsense', // Options: 'adsense', 'direct', 'custom'
            refreshRate: 0, // 0 means no refresh, value in milliseconds
            testMode: false,
            analytics: true
        }
    };
    
    // Variables to track state
    let initialized = false;
    let adsLoaded = {};
    
    /**
     * Initialize the ad system
     * @param {Object} customConfig - Optional custom configuration to override defaults
     */
    function init(customConfig = {}) {
        if (initialized) return;
        
        // Merge custom config with default config
        const config = {...adConfig};
        if (customConfig.defaults) {
            config.defaults = {...config.defaults, ...customConfig.defaults};
        }
        if (customConfig.placements) {
            Object.keys(customConfig.placements).forEach(placement => {
                if (config.placements[placement]) {
                    config.placements[placement] = {
                        ...config.placements[placement],
                        ...customConfig.placements[placement]
                    };
                } else {
                    config.placements[placement] = customConfig.placements[placement];
                }
            });
        }
        
        // Set up based on ad provider
        switch(config.defaults.adProvider) {
            case 'adsense':
                setupAdsense();
                break;
            case 'direct':
                setupDirectAds();
                break;
            case 'custom':
                // Custom integration can be implemented here
                break;
        }
        
        // Load initial ads
        loadAds(config);
        
        // Set up analytics if enabled
        if (config.defaults.analytics) {
            setupAnalytics();
        }
        
        initialized = true;
        console.log('Jerusalem Hills Ads initialized');
    }
    
    /**
     * Set up Google AdSense
     */
    function setupAdsense() {
        // Add AdSense script if not already present
        if (!document.getElementById('adsense-script')) {
            const script = document.createElement('script');
            script.id = 'adsense-script';
            script.async = true;
            script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX';
            script.crossOrigin = 'anonymous';
            document.head.appendChild(script);
        }
        
        // AdSense configuration
        (adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: "ca-pub-1738161253720",
            enable_page_level_ads: true,
            crossorigin: "anonymous"
        });
    }
    
    /**
     * Set up direct sold ads
     */
    function setupDirectAds() {
        // Implementation for direct ad sales
        console.log('Direct ad sales mode activated');
    }
    
    /**
     * Load ads based on configuration
     * @param {Object} config - The ad configuration object
     */
    function loadAds(config) {
        // Find all ad containers on the page
        Object.keys(config.placements).forEach(placementId => {
            const placement = config.placements[placementId];
            
            if (!placement.isActive) return;
            
            const adContainers = document.querySelectorAll(placement.selector);
            
            if (adContainers.length === 0) return;
            
            adContainers.forEach((container, index) => {
                const uniqueId = `${placementId}-${index}`;
                container.id = uniqueId;
                
                switch(config.defaults.adProvider) {
                    case 'adsense':
                        loadAdsenseAd(container, placement);
                        break;
                    case 'direct':
                        loadDirectAd(container, placement);
                        break;
                    case 'custom':
                        // Custom ad loading logic
                        break;
                }
                
                // Track that this ad was loaded
                adsLoaded[uniqueId] = {
                    placement: placementId,
                    loaded: true,
                    timestamp: new Date().getTime()
                };
            });
        });
    }
    
    /**
     * Load a Google AdSense ad
     * @param {HTMLElement} container - The container element
     * @param {Object} placement - The placement configuration
     */
    function loadAdsenseAd(container, placement) {
        // Create the AdSense ad element
        if (container) {
            const ins = document.createElement('ins');
            ins.className = 'adsbygoogle';
            ins.style.display = 'block';
            
            // Set responsive attribute if we have multiple sizes
            if (placement.sizeMapping) {
                ins.setAttribute('data-ad-format', 'auto');
                ins.setAttribute('data-full-width-responsive', 'true');
            } else if (placement.sizes && placement.sizes.length === 1) {
                ins.style.width = placement.sizes[0][0] + 'px';
                ins.style.height = placement.sizes[0][1] + 'px';
            }
            
            ins.setAttribute('data-ad-client', 'ca-pub-XXXXXXXXXXXXXXXX');
            ins.setAttribute('data-ad-slot', 'XXXXXXXXXX'); // This should be unique per ad unit
            
            container.appendChild(ins);
            
            // Push the ad to AdSense for rendering
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
    }
    
    /**
     * Load a directly sold ad
     * @param {HTMLElement} container - The container element
     * @param {Object} placement - The placement configuration
     */
    function loadDirectAd(container, placement) {
        // Example implementation for direct ad sales
        // In a real implementation, this would load from a database or API
        if (container) {
            const img = document.createElement('img');
            img.src = '/ads/placeholder-ad.jpg'; // Replace with actual ad image
            img.alt = 'Advertisement';
            img.style.maxWidth = '100%';
            
            const link = document.createElement('a');
            link.href = '#'; // Replace with actual ad link
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.appendChild(img);
            
            container.appendChild(link);
            
            // Track impression
            trackImpression(container.id);
            
            // Set up click tracking
            link.addEventListener('click', function() {
                trackClick(container.id);
            });
        }
    }
    
    /**
     * Set up ad performance analytics
     */
    function setupAnalytics() {
        // Implementation for ad analytics
        // This could integrate with Google Analytics or a custom solution
        console.log('Ad analytics enabled');
        
        // Example: track viewability of ads
        if ('IntersectionObserver' in window) {
            const adObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.target.id in adsLoaded) {
                        trackImpression(entry.target.id);
                        // Stop observing once impression is tracked
                        adObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.5 // Consider ad viewed when 50% visible
            });
            
            // Observe all ad containers
            document.querySelectorAll('[id^="home-top-banner-"], [id^="sidebar-"], [id^="content-middle-"], [id^="game-banner-"], [id^="forum-sidebar-"]')
                .forEach(adContainer => {
                    adObserver.observe(adContainer);
                });
        }
    }
    
    /**
     * Track an ad impression
     * @param {string} adId - The ID of the ad that was viewed
     */
    function trackImpression(adId) {
        if (adsLoaded[adId]) {
            console.log(`Ad impression tracked: ${adId}`);
            
            // In a real implementation, this would send data to a backend
            // Example:
            /*
            fetch('/api/ad-tracker/impression', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    adId: adId,
                    placement: adsLoaded[adId].placement,
                    timestamp: new Date().getTime()
                })
            });
            */
        }
    }
    
    /**
     * Track an ad click
     * @param {string} adId - The ID of the ad that was clicked
     */
    function trackClick(adId) {
        if (adsLoaded[adId]) {
            console.log(`Ad click tracked: ${adId}`);
            
            // In a real implementation, this would send data to a backend
            // Example:
            /*
            fetch('/api/ad-tracker/click', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    adId: adId,
                    placement: adsLoaded[adId].placement,
                    timestamp: new Date().getTime()
                })
            });
            */
        }
    }
    
    /**
     * Refresh all ads on the page
     */
    function refreshAds() {
        // Implementation to refresh ads
        console.log('Refreshing all ads');
        
        // For AdSense, we'd need to destroy and recreate the ads
        // For direct ads, we could load new creative
    }
    
    /**
     * Get metrics about current ad performance
     * @returns {Object} Object containing ad performance metrics
     */
    function getMetrics() {
        // Implementation to return ad metrics
        return {
            adsLoaded: Object.keys(adsLoaded).length,
            // Other metrics would be added here
        };
    }
    
    // Public API
    return {
        init,
        refreshAds,
        getMetrics
    };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JHAds;
}
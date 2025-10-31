// Google AdSense Configuration for Jerusalem Hills
// Limited Ads (Non-Personalized) - Cookie-less Configuration
// No consent banners needed - privacy-first approach

(function() {
    'use strict';

    // AdSense Configuration
    const ADSENSE_CONFIG = {
        client: 'ca-pub-1738161253720231', // Your AdSense publisher ID
        limitedAds: true,  // Enable Limited Ads (non-personalized)
        slots: {
            homepage_banner: 'XXXXXXXXXX',      // Replace with actual slot ID
            sidebar_vertical: 'XXXXXXXXXX',     // Replace with actual slot ID
            in_article: 'XXXXXXXXXX',           // Replace with actual slot ID
            footer_horizontal: 'XXXXXXXXXX',    // Replace with actual slot ID
            mobile_anchor: 'XXXXXXXXXX'         // Replace with actual slot ID
        },
        testMode: false, // Set to true for testing
        autoAds: true   // Enable auto ads
    };

    // AdSense Manager (Cookie-less Limited Ads)
    const AdSenseManager = {
        initialized: false,
        autoAdsEnabled: false,

        // Initialize AdSense (no consent needed for Limited Ads)
        init: function() {
            if (this.initialized) {
                console.log('AdSense: Already initialized');
                return;
            }

            // CRITICAL: Block AdSense in Kids Zone (COPPA compliance)
            if (this.isKidsZone()) {
                console.log('🚫 AdSense: Disabled in Kids Zone (COPPA compliance)');
                return;
            }

            console.log('✅ AdSense: Initializing Limited Ads (non-personalized)');

            // Load AdSense script if not already loaded
            if (!document.querySelector('script[src*="pagead2.googlesyndication.com"]')) {
                this.loadAdSenseScript();
            }

            // Initialize existing ad units
            this.initializeAdUnits();

            // Set up auto ads if enabled (only once)
            if (ADSENSE_CONFIG.autoAds && !this.autoAdsEnabled) {
                this.enableAutoAds();
                this.autoAdsEnabled = true;
            }

            this.initialized = true;
        },

        // Check if current page is in Kids Zone
        isKidsZone: function() {
            return window.location.pathname.startsWith('/kids/');
        },

        // Load AdSense script dynamically with Limited Ads parameter
        loadAdSenseScript: function() {
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.client}`;
            script.crossOrigin = 'anonymous';

            // IMPORTANT: Set non-personalized ads parameter (Limited Ads)
            if (ADSENSE_CONFIG.limitedAds) {
                script.setAttribute('data-npa', '1');
                console.log('AdSense: Limited Ads (data-npa=1) enabled');
            }

            script.onload = function() {
                console.log('AdSense: Script loaded successfully');
            };

            script.onerror = function() {
                console.error('AdSense: Failed to load script (ad blocker or network issue)');
            };

            document.head.appendChild(script);
        },

        // Initialize existing ad units on the page
        initializeAdUnits: function() {
            const adUnits = document.querySelectorAll('.adsbygoogle:not([data-ad-status])');

            if (adUnits.length === 0) {
                console.log('AdSense: No ad units found on page');
                return;
            }

            console.log(`AdSense: Initializing ${adUnits.length} ad unit(s)`);

            adUnits.forEach(function(adUnit) {
                try {
                    // Ensure data-npa="1" is set for Limited Ads
                    if (ADSENSE_CONFIG.limitedAds && !adUnit.getAttribute('data-npa')) {
                        adUnit.setAttribute('data-npa', '1');
                    }

                    // Push to adsbygoogle array
                    window.adsbygoogle = window.adsbygoogle || [];
                    window.adsbygoogle.push({});
                    adUnit.setAttribute('data-ad-status', 'initialized');
                } catch (e) {
                    console.error('AdSense: Error initializing ad unit:', e);
                }
            });
        },

        // Enable auto ads with Limited Ads configuration
        enableAutoAds: function() {
            try {
                // Check if auto ads are already enabled to prevent duplicate initialization
                if (window.adsbygoogle && window.adsbygoogle.some(item => item && item.enable_page_level_ads)) {
                    console.log('AdSense: Auto ads already enabled, skipping');
                    return;
                }

                window.adsbygoogle = window.adsbygoogle || [];
                const autoAdsConfig = {
                    google_ad_client: ADSENSE_CONFIG.client,
                    enable_page_level_ads: true
                };

                // Add non-personalized ads flag for Limited Ads
                if (ADSENSE_CONFIG.limitedAds) {
                    autoAdsConfig.npa = '1';
                }

                window.adsbygoogle.push(autoAdsConfig);
                console.log('AdSense: Auto ads enabled');
            } catch (e) {
                console.error('AdSense: Error enabling auto ads:', e);
            }
        },

        // Create an ad unit dynamically
        createAdUnit: function(slotName, container, format = 'auto') {
            if (!ADSENSE_CONFIG.slots[slotName]) {
                console.error('AdSense: Unknown ad slot:', slotName);
                return;
            }

            const adUnit = document.createElement('ins');
            adUnit.className = 'adsbygoogle';
            adUnit.style.display = 'block';
            adUnit.setAttribute('data-ad-client', ADSENSE_CONFIG.client);
            adUnit.setAttribute('data-ad-slot', ADSENSE_CONFIG.slots[slotName]);
            adUnit.setAttribute('data-ad-format', format);
            adUnit.setAttribute('data-full-width-responsive', 'true');

            // Add Limited Ads parameter
            if (ADSENSE_CONFIG.limitedAds) {
                adUnit.setAttribute('data-npa', '1');
            }

            // Add test mode attribute if in test mode
            if (ADSENSE_CONFIG.testMode) {
                adUnit.setAttribute('data-adtest', 'on');
            }

            container.appendChild(adUnit);

            // Initialize the ad
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.error('AdSense: Error pushing ad:', e);
            }
        },

        // Refresh ads (useful for single-page applications)
        refreshAds: function() {
            const adUnits = document.querySelectorAll('.adsbygoogle[data-ad-status="initialized"]');

            if (adUnits.length === 0) {
                console.log('AdSense: No ads to refresh');
                return;
            }

            console.log(`AdSense: Refreshing ${adUnits.length} ad unit(s)`);

            adUnits.forEach(function(adUnit) {
                // Clear the ad unit
                adUnit.innerHTML = '';
                adUnit.removeAttribute('data-ad-status');

                // Reinitialize
                try {
                    (adsbygoogle = window.adsbygoogle || []).push({});
                    adUnit.setAttribute('data-ad-status', 'initialized');
                } catch (e) {
                    console.error('AdSense: Error refreshing ad unit:', e);
                }
            });
        },

        // Pause ads (for better user experience during certain interactions)
        pauseAds: function() {
            const adUnits = document.querySelectorAll('.adsbygoogle');
            adUnits.forEach(function(adUnit) {
                adUnit.style.display = 'none';
            });
            console.log('AdSense: Ads paused');
        },

        // Resume ads
        resumeAds: function() {
            const adUnits = document.querySelectorAll('.adsbygoogle');
            adUnits.forEach(function(adUnit) {
                adUnit.style.display = 'block';
            });
            console.log('AdSense: Ads resumed');
        }
    };

    // Initialize on DOM ready (no consent check needed for Limited Ads)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            AdSenseManager.init();
        });
    } else {
        AdSenseManager.init();
    }

    // Expose to global scope
    window.AdSenseManager = AdSenseManager;
    window.ADSENSE_CONFIG = ADSENSE_CONFIG;
})();

// Helper function to update AdSense configuration
function updateAdSenseSlots(slots) {
    Object.assign(window.ADSENSE_CONFIG.slots, slots);
    console.log('AdSense: Slots updated:', window.ADSENSE_CONFIG.slots);
}

// Helper function to verify cookie-less operation
function verifyAdSenseCookieless() {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const adCookies = cookies.filter(c => c.startsWith('__gads') || c.startsWith('__gac') || c.startsWith('_gcl'));

    if (adCookies.length === 0) {
        console.log('✅ AdSense: Cookie-less operation verified (no ad cookies found)');
        return true;
    } else {
        console.warn('⚠️ AdSense: Ad cookies detected:', adCookies);
        console.warn('Ensure Limited Ads is enabled in AdSense dashboard and data-npa="1" is set');
        return false;
    }
}

// Auto-verify cookie-less operation after 3 seconds (give ads time to load)
setTimeout(verifyAdSenseCookieless, 3000);

// Google AdSense Configuration for Jerusalem Hills
// This file centralizes AdSense configuration and management

(function() {
    'use strict';

    // AdSense Configuration
    const ADSENSE_CONFIG = {
        client: 'ca-pub-1738161253720', // Your AdSense publisher ID
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

    // AdSense Manager
    const AdSenseManager = {
        initialized: false,
        autoAdsEnabled: false,

        // Initialize AdSense when consent is given
        init: function() {
            if (this.initialized) return;

            // Check if user has consented to cookies
            if (!this.hasConsent()) {
                console.log('AdSense: Waiting for user consent');
                return;
            }

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

        // Check if user has consented to cookies
        hasConsent: function() {
            // Check for consent cookie
            const consent = document.cookie.match(/jh_cookie_consent=([^;]+)/);
            return consent && consent[1] === 'accepted';
        },

        // Load AdSense script dynamically
        loadAdSenseScript: function() {
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.client}`;
            script.crossOrigin = 'anonymous';
            script.onerror = function() {
                console.error('Failed to load AdSense script. Ad blocker may be active.');
            };
            document.head.appendChild(script);
        },

        // Initialize existing ad units on the page
        initializeAdUnits: function() {
            const adUnits = document.querySelectorAll('.adsbygoogle:not([data-ad-status])');

            adUnits.forEach(function(adUnit) {
                try {
                    // Push to adsbygoogle array
                    window.adsbygoogle = window.adsbygoogle || [];
                    window.adsbygoogle.push({});
                    adUnit.setAttribute('data-ad-status', 'initialized');
                } catch (e) {
                    console.error('Error initializing ad unit:', e);
                }
            });
        },

        // Enable auto ads
        enableAutoAds: function() {
            try {
                window.adsbygoogle = window.adsbygoogle || [];
                window.adsbygoogle.push({
                    google_ad_client: ADSENSE_CONFIG.client,
                    enable_page_level_ads: true
                });
            } catch (e) {
                console.error('Error enabling auto ads:', e);
            }
        },

        // Create an ad unit dynamically
        createAdUnit: function(slotName, container, format = 'auto') {
            if (!ADSENSE_CONFIG.slots[slotName]) {
                console.error('Unknown ad slot:', slotName);
                return;
            }

            const adUnit = document.createElement('ins');
            adUnit.className = 'adsbygoogle';
            adUnit.style.display = 'block';
            adUnit.setAttribute('data-ad-client', ADSENSE_CONFIG.client);
            adUnit.setAttribute('data-ad-slot', ADSENSE_CONFIG.slots[slotName]);
            adUnit.setAttribute('data-ad-format', format);
            adUnit.setAttribute('data-full-width-responsive', 'true');

            // Add test mode attribute if in test mode
            if (ADSENSE_CONFIG.testMode) {
                adUnit.setAttribute('data-adtest', 'on');
            }

            container.appendChild(adUnit);

            // Initialize the ad if consent already given
            if (this.hasConsent()) {
                try {
                    (adsbygoogle = window.adsbygoogle || []).push({});
                } catch (e) {
                    console.error('Error pushing ad:', e);
                }
            }
        },

        // Refresh ads (useful for single-page applications)
        refreshAds: function() {
            if (!this.hasConsent()) return;

            const adUnits = document.querySelectorAll('.adsbygoogle[data-ad-status="initialized"]');
            adUnits.forEach(function(adUnit) {
                // Clear the ad unit
                adUnit.innerHTML = '';
                adUnit.removeAttribute('data-ad-status');

                // Reinitialize
                try {
                    (adsbygoogle = window.adsbygoogle || []).push({});
                    adUnit.setAttribute('data-ad-status', 'initialized');
                } catch (e) {
                    console.error('Error refreshing ad unit:', e);
                }
            });
        },

        // Pause ads (for better user experience during certain interactions)
        pauseAds: function() {
            const adUnits = document.querySelectorAll('.adsbygoogle');
            adUnits.forEach(function(adUnit) {
                adUnit.style.display = 'none';
            });
        },

        // Resume ads
        resumeAds: function() {
            const adUnits = document.querySelectorAll('.adsbygoogle');
            adUnits.forEach(function(adUnit) {
                adUnit.style.display = 'block';
            });
        },

        // Handle consent change
        onConsentChange: function(hasConsent) {
            if (hasConsent && !this.initialized) {
                this.init();
            } else if (!hasConsent) {
                // Remove ads if consent revoked
                const adUnits = document.querySelectorAll('.adsbygoogle');
                adUnits.forEach(function(adUnit) {
                    adUnit.remove();
                });
                this.initialized = false;
            }
        }
    };

    // Listen for consent changes
    window.addEventListener('cookieConsentAccepted', function() {
        AdSenseManager.onConsentChange(true);
    });

    window.addEventListener('cookieConsentDeclined', function() {
        AdSenseManager.onConsentChange(false);
    });

    // Initialize on DOM ready
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
    console.log('AdSense slots updated:', window.ADSENSE_CONFIG.slots);
}
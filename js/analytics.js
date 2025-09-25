// Google Analytics 4 Configuration
// Replace G-XXXXXXXXXX with your actual measurement ID

// This script should be included in the <head> of every page
// Example: <script src="/js/analytics.js"></script>

(function() {
    // GA4 Measurement ID - UPDATE THIS WITH YOUR ACTUAL ID
    const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

    // Only load if not already loaded and ID is configured
    if (window.gtag || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
        console.warn('Google Analytics: Please configure your GA4 measurement ID in /js/analytics.js');
        return;
    }

    // Load the Global Site Tag (gtag.js)
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
        // Enhanced measurement settings
        page_path: window.location.pathname,
        page_title: document.title,
        page_location: window.location.href,

        // E-commerce tracking for marketplace
        currency: 'USD',

        // Privacy settings
        anonymize_ip: true,
        cookie_flags: 'max-age=7200;secure;samesite=none'
    });

    // Track custom events
    window.trackEvent = function(eventName, parameters) {
        gtag('event', eventName, parameters);
    };

    // Track purchase events for marketplace
    window.trackPurchase = function(transactionId, value, currency = 'USD', items = []) {
        gtag('event', 'purchase', {
            transaction_id: transactionId,
            value: value,
            currency: currency,
            items: items
        });
    };

    // Track page views manually (useful for SPAs)
    window.trackPageView = function(pagePath, pageTitle) {
        gtag('event', 'page_view', {
            page_path: pagePath || window.location.pathname,
            page_title: pageTitle || document.title
        });
    };

    // Log successful initialization
    console.log('Google Analytics initialized with ID:', GA_MEASUREMENT_ID);
})();
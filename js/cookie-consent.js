// Cookie Consent Manager for Jerusalem Hills
(function() {
    'use strict';

    // Configuration
    const CONSENT_COOKIE_NAME = 'jh_cookie_consent';
    const CONSENT_COOKIE_DAYS = 365;
    const GA_MEASUREMENT_ID = 'G-VE3Z9354M2'; // Update with actual GA4 ID

    // Cookie utility functions
    const CookieUtil = {
        set: function(name, value, days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = "; expires=" + date.toUTCString();
            document.cookie = name + "=" + value + expires + "; path=/; SameSite=Lax";
        },

        get: function(name) {
            const nameEQ = name + "=";
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                let cookie = cookies[i].trim();
                if (cookie.indexOf(nameEQ) === 0) {
                    return cookie.substring(nameEQ.length);
                }
            }
            return null;
        },

        delete: function(name) {
            document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
    };

    // Consent Manager
    const ConsentManager = {
        hasConsent: function() {
            const consent = CookieUtil.get(CONSENT_COOKIE_NAME);
            return consent === 'accepted';
        },

        isDeclined: function() {
            const consent = CookieUtil.get(CONSENT_COOKIE_NAME);
            return consent === 'declined';
        },

        acceptCookies: function() {
            CookieUtil.set(CONSENT_COOKIE_NAME, 'accepted', CONSENT_COOKIE_DAYS);
            this.loadGoogleAnalytics();
            this.loadGoogleAdsense();
            this.hideBanner();
        },

        declineCookies: function() {
            CookieUtil.set(CONSENT_COOKIE_NAME, 'declined', CONSENT_COOKIE_DAYS);
            this.disableTracking();
            this.hideBanner();
        },

        loadGoogleAnalytics: function() {
            // Only load if not already loaded and consent given
            if (typeof gtag === 'undefined') {
                const script = document.createElement('script');
                script.async = true;
                script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
                document.head.appendChild(script);

                window.dataLayer = window.dataLayer || [];
                window.gtag = function() { dataLayer.push(arguments); };
                gtag('js', new Date());
                gtag('config', GA_MEASUREMENT_ID, {
                    'anonymize_ip': true,
                    'cookie_flags': 'SameSite=Lax;Secure'
                });
            }
        },

        loadGoogleAdsense: function() {
            // Enable AdSense ads if consent given
            const ads = document.querySelectorAll('.adsbygoogle');
            ads.forEach(function(ad) {
                if (ad.getAttribute('data-consent-required') === 'true') {
                    (adsbygoogle = window.adsbygoogle || []).push({});
                }
            });
        },

        disableTracking: function() {
            // Disable Google Analytics
            window['ga-disable-' + GA_MEASUREMENT_ID] = true;

            // Clear existing GA cookies
            const gaCookies = ['_ga', '_gid', '_gat', '_ga_' + GA_MEASUREMENT_ID.replace('G-', '')];
            gaCookies.forEach(function(cookieName) {
                CookieUtil.delete(cookieName);
                CookieUtil.delete(cookieName + '_' + window.location.hostname.replace(/\./g, '_'));
            });
        },

        showBanner: function() {
            const banner = document.getElementById('cookie-consent-banner');
            if (banner) {
                banner.style.display = 'block';
                // Add animation
                setTimeout(() => {
                    banner.classList.add('show');
                }, 100);
            }
        },

        hideBanner: function() {
            const banner = document.getElementById('cookie-consent-banner');
            if (banner) {
                banner.classList.remove('show');
                setTimeout(() => {
                    banner.style.display = 'none';
                }, 300);
            }
        },

        createBanner: function() {
            const bannerHTML = `
                <div id="cookie-consent-banner" class="cookie-consent-banner">
                    <div class="cookie-consent-content">
                        <div class="cookie-consent-text">
                            <h3>🍪 Cookie Consent</h3>
                            <p>We use cookies to enhance your browsing experience, serve personalized ads, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.</p>
                            <a href="/privacy-policy.html" target="_blank" class="cookie-policy-link">Learn more in our Privacy Policy</a>
                        </div>
                        <div class="cookie-consent-buttons">
                            <button id="cookie-decline" class="cookie-btn cookie-btn-secondary">Decline</button>
                            <button id="cookie-accept" class="cookie-btn cookie-btn-primary">Accept All</button>
                        </div>
                    </div>
                </div>
            `;

            const bannerStyles = `
                <style>
                    .cookie-consent-banner {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        background: white;
                        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
                        z-index: 9999;
                        padding: 20px;
                        transform: translateY(100%);
                        transition: transform 0.3s ease;
                        display: none;
                    }

                    .cookie-consent-banner.show {
                        transform: translateY(0);
                    }

                    .cookie-consent-content {
                        max-width: 1200px;
                        margin: 0 auto;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 30px;
                        flex-wrap: wrap;
                    }

                    .cookie-consent-text {
                        flex: 1;
                        min-width: 300px;
                    }

                    .cookie-consent-text h3 {
                        margin: 0 0 10px 0;
                        color: #2d3748;
                        font-size: 18px;
                    }

                    .cookie-consent-text p {
                        margin: 0 0 10px 0;
                        color: #4a5568;
                        font-size: 14px;
                        line-height: 1.5;
                    }

                    .cookie-policy-link {
                        color: #667eea;
                        font-size: 14px;
                        text-decoration: underline;
                    }

                    .cookie-policy-link:hover {
                        color: #5a67d8;
                    }

                    .cookie-consent-buttons {
                        display: flex;
                        gap: 10px;
                    }

                    .cookie-btn {
                        padding: 10px 20px;
                        border: none;
                        border-radius: 5px;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }

                    .cookie-btn-primary {
                        background: #667eea;
                        color: white;
                    }

                    .cookie-btn-primary:hover {
                        background: #5a67d8;
                    }

                    .cookie-btn-secondary {
                        background: #e2e8f0;
                        color: #4a5568;
                    }

                    .cookie-btn-secondary:hover {
                        background: #cbd5e0;
                    }

                    @media (max-width: 768px) {
                        .cookie-consent-content {
                            flex-direction: column;
                            align-items: stretch;
                            gap: 20px;
                        }

                        .cookie-consent-buttons {
                            justify-content: stretch;
                        }

                        .cookie-btn {
                            flex: 1;
                        }
                    }
                </style>
            `;

            // Add styles to head
            if (!document.getElementById('cookie-consent-styles')) {
                const styleElement = document.createElement('div');
                styleElement.id = 'cookie-consent-styles';
                styleElement.innerHTML = bannerStyles;
                document.head.appendChild(styleElement);
            }

            // Add banner to body
            if (!document.getElementById('cookie-consent-banner')) {
                const bannerElement = document.createElement('div');
                bannerElement.innerHTML = bannerHTML;
                document.body.appendChild(bannerElement.firstElementChild);

                // Add event listeners
                document.getElementById('cookie-accept').addEventListener('click', () => {
                    this.acceptCookies();
                });

                document.getElementById('cookie-decline').addEventListener('click', () => {
                    this.declineCookies();
                });
            }
        },

        init: function() {
            // Create banner HTML
            this.createBanner();

            // Check consent status
            if (!this.hasConsent() && !this.isDeclined()) {
                // Show banner if no decision made
                this.showBanner();
            } else if (this.hasConsent()) {
                // Load tracking if consent given
                this.loadGoogleAnalytics();
                this.loadGoogleAdsense();
            }
        }
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            ConsentManager.init();
        });
    } else {
        ConsentManager.init();
    }

    // Expose to global scope for manual control
    window.CookieConsentManager = ConsentManager;
})();
// Mobile Navigation for Jerusalem Hills
(function() {
    'use strict';

    const MobileNav = {
        menuButton: null,
        mobileMenu: null,
        overlay: null,
        isOpen: false,
        initialized: false,

        // Initialize mobile navigation
        init: function() {
            if (this.initialized) return;

            // Find menu button - try multiple selectors
            this.menuButton = document.querySelector('.menu-button, .icon-button[aria-label="Menu"], button[aria-label="Menu"]');
            this.mobileMenu = document.querySelector('.mobile-menu');

            if (!this.menuButton || !this.mobileMenu) {
                // Create mobile menu if it doesn't exist
                this.createMobileMenu();
            }

            // Create overlay
            this.createOverlay();

            // Add event listeners
            this.addEventListeners();

            // Handle resize
            this.handleResize();

            this.initialized = true;
        },

        // Create mobile menu structure
        createMobileMenu: function() {
            // Find or create menu button
            if (!this.menuButton) {
                // Try to find existing button first
                this.menuButton = document.querySelector('.menu-button, .icon-button[aria-label="Menu"], button[aria-label="Menu"]');
                
                if (!this.menuButton) {
                    // Look for right-section or header-icons
                    const rightSection = document.querySelector('.right-section, .header-icons');
                    if (rightSection) {
                        const button = document.createElement('button');
                        button.className = 'icon-button menu-button';
                        button.setAttribute('aria-label', 'Menu');
                        button.innerHTML = `<i data-lucide="menu"></i>`;
                        rightSection.appendChild(button);
                        this.menuButton = button;
                    } else {
                        console.warn('No suitable parent element found for mobile navigation button.');
                        return;
                    }
                }
            }

            // Create mobile menu if it doesn't exist
            if (!this.mobileMenu) {
                const menu = document.createElement('div');
                menu.className = 'mobile-menu';
                menu.innerHTML = `
                    <nav class="mobile-nav">
                        <a href="/" class="mobile-link">
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                            Home
                        </a>
                        <a href="/market/" class="mobile-link">
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                            </svg>
                            Marketplace
                        </a>
                        <a href="/games/" class="mobile-link">
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"></path>
                            </svg>
                            Games
                        </a>
                        <a href="/games/bcodes/bcodes.html" class="mobile-link" style="padding-left: 40px;">
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            Torah Codes
                        </a>
                        <a href="/forum/" class="mobile-link">
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
                            </svg>
                            Forum
                        </a>
                        <a href="/services-directory.html" class="mobile-link">
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                            Services
                        </a>
                        <a href="/sidur.html" class="mobile-link">
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                            </svg>
                            Siddur
                        </a>
                        <div class="mobile-menu-divider"></div>
                        <a href="/about.html" class="mobile-link">About</a>
                        <a href="/contact.html" class="mobile-link">Contact</a>
                        <a href="/privacy-policy.html" class="mobile-link">Privacy Policy</a>
                        <a href="/terms-of-service.html" class="mobile-link">Terms</a>
                    </nav>
                `;
                document.body.appendChild(menu);
                this.mobileMenu = menu;
            }

            // Add necessary styles
            this.addStyles();
        },

        // Create overlay
        createOverlay: function() {
            if (!document.querySelector('.mobile-nav-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'mobile-nav-overlay';
                document.body.appendChild(overlay);
                this.overlay = overlay;
            }
        },

        // Add styles
        addStyles: function() {
            if (document.getElementById('mobile-nav-styles')) return;

            const styles = document.createElement('style');
            styles.id = 'mobile-nav-styles';
            styles.textContent = `
                .menu-button {
                    display: none;
                    background: none;
                    border: none;
                    padding: 8px;
                    cursor: pointer;
                    color: #4b5563;
                    border-radius: 8px;
                    transition: all 0.2s;
                }

                .menu-button:hover {
                    background: #f3f4f6;
                }

                @media (max-width: 768px) {
                    .menu-button {
                        display: block;
                    }

                    .header-nav {
                        display: none !important;
                    }
                }

                .mobile-menu {
                    position: fixed;
                    top: 0;
                    right: -280px;
                    width: 280px;
                    height: 100%;
                    background: white;
                    z-index: 1001;
                    transition: right 0.3s ease;
                    overflow-y: auto;
                    box-shadow: -2px 0 10px rgba(0,0,0,0.1);
                }

                .mobile-menu.open {
                    right: 0;
                }

                .mobile-nav {
                    padding: 20px;
                    padding-top: 80px;
                }

                .mobile-link {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    color: #374151;
                    text-decoration: none;
                    font-size: 16px;
                    font-weight: 500;
                    border-radius: 8px;
                    transition: all 0.2s;
                    margin-bottom: 4px;
                }

                .mobile-link:hover {
                    background: #f3f4f6;
                    color: #667eea;
                }

                .mobile-menu-divider {
                    height: 1px;
                    background: #e5e7eb;
                    margin: 16px 0;
                }

                .mobile-nav-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    z-index: 1000;
                    display: none;
                }

                .mobile-nav-overlay.show {
                    display: block;
                }

                body.menu-open {
                    overflow: hidden;
                }

                @media (min-width: 769px) {
                    .mobile-menu,
                    .mobile-nav-overlay {
                        display: none !important;
                    }
                }
            `;
            document.head.appendChild(styles);
        },

        // Add event listeners
        addEventListeners: function() {
            // Menu button click
            if (this.menuButton) {
                this.menuButton.addEventListener('click', () => {
                    this.toggleMenu();
                });
            }

            // Overlay click
            if (this.overlay) {
                this.overlay.addEventListener('click', () => {
                    this.closeMenu();
                });
            }

            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.closeMenu();
                }
            });

            // Handle window resize
            window.addEventListener('resize', () => {
                this.handleResize();
            });

            // Close menu when clicking on a link
            const mobileLinks = this.mobileMenu?.querySelectorAll('.mobile-link');
            mobileLinks?.forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMenu();
                });
            });
        },

        // Toggle menu
        toggleMenu: function() {
            if (this.isOpen) {
                this.closeMenu();
            } else {
                this.openMenu();
            }
        },

        // Open menu
        openMenu: function() {
            if (!this.mobileMenu || !this.overlay) return;

            this.mobileMenu.classList.add('open');
            this.overlay.classList.add('show');
            document.body.classList.add('menu-open');

            // Update button icon
            if (this.menuButton) {
                const menuIcon = this.menuButton.querySelector('.menu-icon');
                const closeIcon = this.menuButton.querySelector('.close-icon');
                if (menuIcon) menuIcon.style.display = 'none';
                if (closeIcon) closeIcon.style.display = 'block';
            }

            this.isOpen = true;
        },

        // Close menu
        closeMenu: function() {
            if (!this.mobileMenu || !this.overlay) return;

            this.mobileMenu.classList.remove('open');
            this.overlay.classList.remove('show');
            document.body.classList.remove('menu-open');

            // Update button icon
            if (this.menuButton) {
                const menuIcon = this.menuButton.querySelector('.menu-icon');
                const closeIcon = this.menuButton.querySelector('.close-icon');
                if (menuIcon) menuIcon.style.display = 'block';
                if (closeIcon) closeIcon.style.display = 'none';
            }

            this.isOpen = false;
        },

        // Handle resize
        handleResize: function() {
            if (window.innerWidth > 768 && this.isOpen) {
                this.closeMenu();
            }
        }
    };

    // Initialize on DOM ready or when header is loaded
    function initializeWhenReady() {
        // Wait a bit for header to be loaded
        setTimeout(() => {
            MobileNav.init();
        }, 500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWhenReady);
    } else {
        initializeWhenReady();
    }

    // Also listen for headerLoaded event
    document.addEventListener('headerLoaded', function() {
        setTimeout(() => {
            MobileNav.init();
        }, 100);
    });

    // Expose to global scope
    window.MobileNav = MobileNav;
})();
// Header Mobile Menu Handler
// Works with the mobile menu structure in header.html

(function() {
    'use strict';

    function initHeaderMobileMenu() {
        const menuButton = document.querySelector('.menu-button');
        const mobileMenu = document.querySelector('.mobile-menu');

        if (!menuButton || !mobileMenu) {
            console.warn('Mobile menu elements not found');
            return;
        }

        // Create overlay
        let overlay = document.querySelector('.mobile-menu-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'mobile-menu-overlay';
            document.body.appendChild(overlay);
        }

        let isOpen = false;

        // Toggle menu function
        function toggleMenu() {
            isOpen = !isOpen;

            if (isOpen) {
                mobileMenu.classList.add('open');
                overlay.classList.add('show');
                document.body.style.overflow = 'hidden';

                // Update button icon to X
                const lucideIcon = menuButton.querySelector('i[data-lucide]');
                if (lucideIcon) {
                    lucideIcon.setAttribute('data-lucide', 'x');
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                }
            } else {
                closeMenu();
            }
        }

        // Close menu function
        function closeMenu() {
            isOpen = false;
            mobileMenu.classList.remove('open');
            overlay.classList.remove('show');
            document.body.style.overflow = '';

            // Update button icon back to menu
            const lucideIcon = menuButton.querySelector('i[data-lucide]');
            if (lucideIcon) {
                lucideIcon.setAttribute('data-lucide', 'menu');
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
        }

        // Menu button click
        menuButton.addEventListener('click', toggleMenu);

        // Overlay click
        overlay.addEventListener('click', closeMenu);

        // Close menu on link click
        const mobileLinks = mobileMenu.querySelectorAll('.mobile-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) {
                closeMenu();
            }
        });

        // Close menu on window resize to desktop size
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && isOpen) {
                closeMenu();
            }
        });

        console.log('✅ Header mobile menu initialized');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeaderMobileMenu);
    } else {
        initHeaderMobileMenu();
    }

    // Also try to initialize after a delay to ensure header is loaded
    setTimeout(initHeaderMobileMenu, 1000);

})();

// Load shared header component
(function() {
  function loadHeader() {
    // Create a placeholder for the header
    const headerPlaceholder = document.getElementById('header-placeholder');

    if (!headerPlaceholder) {
      console.warn('Header placeholder not found. Add <div id="header-placeholder"></div> to your HTML.');
      return;
    }

    // Fetch and insert the header
    fetch('/components/header.html')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load header component');
      }
      return response.text();
    })
    .then(html => {
      headerPlaceholder.innerHTML = html;

      // Reinitialize Lucide icons after header is loaded
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }

      // Initialize mobile menu toggle after header is loaded
      initializeMobileMenu();

      // Dispatch custom event to notify that header is loaded
      document.dispatchEvent(new CustomEvent('headerLoaded'));
    })
    .catch(error => {
      console.error('Error loading header:', error);
      headerPlaceholder.innerHTML = '<p style="color: red;">Failed to load header</p>';
    });
  }

  // Mobile menu toggle functionality
  function initializeMobileMenu() {
    const menuButton = document.querySelector('.menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function(e) {
        e.preventDefault();
        mobileMenu.classList.toggle('active');

        // Change icon between menu and X
        const icon = menuButton.querySelector('i');
        if (icon) {
          const isOpen = mobileMenu.classList.contains('active');
          icon.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
          if (typeof lucide !== 'undefined') {
            lucide.createIcons();
          }
        }
      });

      // Close menu when clicking on a link
      const mobileLinks = mobileMenu.querySelectorAll('.mobile-link');
      mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
          mobileMenu.classList.remove('active');
          const icon = menuButton.querySelector('i');
          if (icon) {
            icon.setAttribute('data-lucide', 'menu');
            if (typeof lucide !== 'undefined') {
              lucide.createIcons();
            }
          }
        });
      });
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeader);
  } else {
    // DOM already loaded
    loadHeader();
  }
})();

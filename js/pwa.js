// Enhanced PWA with Installation Prompt
(function() {
  'use strict';

  let deferredPrompt;
  let installButton;

  // Service Worker registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/service-worker.js')
        .then(function(registration) {
          console.log('✅ Service Worker registered with scope:', registration.scope);
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            console.log('🔄 PWA update available');
          });
        })
        .catch(function(error) {
          console.log('❌ Service Worker registration failed:', error);
        });
    });
  }

  // PWA Install Prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('💾 PWA install prompt triggered');
    
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    
    // Save the event so it can be triggered later
    deferredPrompt = e;
    
    // Show install button
    showInstallButton();
  });

  // Create and show install button
  function showInstallButton() {
    // Don't show if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('✅ PWA already installed');
      return;
    }

    // Create install button if it doesn't exist
    if (!installButton) {
      installButton = document.createElement('button');
      installButton.id = 'pwa-install-btn';
      installButton.innerHTML = `
        <span style="display: flex; align-items: center; gap: 0.5rem;">
          📱 <span>Install App</span>
        </span>
      `;
      installButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #87CEEB, #6BB6D6);
        color: #2C3E50;
        border: none;
        padding: 12px 16px;
        border-radius: 25px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-size: 14px;
        transition: all 0.3s ease;
        font-family: system-ui, -apple-system, sans-serif;
      `;
      
      // Hover effects
      installButton.addEventListener('mouseenter', () => {
        installButton.style.transform = 'translateY(-2px)';
        installButton.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
      });
      
      installButton.addEventListener('mouseleave', () => {
        installButton.style.transform = 'translateY(0)';
        installButton.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      });
      
      // Install click handler
      installButton.addEventListener('click', installPWA);
      
      document.body.appendChild(installButton);
      
      // Show with animation
      setTimeout(() => {
        installButton.style.opacity = '1';
        installButton.style.transform = 'translateX(0)';
      }, 1000);
      
      // Hide after 10 seconds if not clicked
      setTimeout(() => {
        if (installButton && installButton.parentNode) {
          installButton.style.opacity = '0';
          installButton.style.transform = 'translateX(100px)';
          setTimeout(() => {
            if (installButton && installButton.parentNode) {
              installButton.parentNode.removeChild(installButton);
            }
          }, 300);
        }
      }, 10000);
    }
  }

  // Install PWA function
  async function installPWA() {
    if (!deferredPrompt) {
      console.log('❌ No install prompt available');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`👤 User response to install prompt: ${outcome}`);
    
    // Hide the install button
    if (installButton && installButton.parentNode) {
      installButton.style.opacity = '0';
      setTimeout(() => {
        if (installButton && installButton.parentNode) {
          installButton.parentNode.removeChild(installButton);
        }
      }, 300);
    }
    
    // Reset the deferred prompt variable
    deferredPrompt = null;
  }

  // Track PWA installation
  window.addEventListener('appinstalled', () => {
    console.log('🎉 PWA was installed successfully');
    
    // Hide install button if still visible
    if (installButton && installButton.parentNode) {
      installButton.parentNode.removeChild(installButton);
    }
    
    // Optional: Track installation event
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_install', {
        event_category: 'PWA',
        event_label: 'App Installed'
      });
    }
  });

  // Check if running as PWA
  function isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true;
  }

  // PWA-specific behaviors
  if (isPWA()) {
    console.log('🚀 Running as PWA');
    
    // Add PWA class to body for specific styling
    document.body.classList.add('pwa-mode');
    
    // Prevent zoom on double tap (PWA specific)
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }

  // Handle offline/online status
  function updateOnlineStatus() {
    const condition = navigator.onLine ? 'online' : 'offline';
    console.log(`🌐 Connection status: ${condition}`);
    
    // Show/hide offline indicator
    let offlineIndicator = document.getElementById('offline-indicator');
    
    if (!navigator.onLine) {
      if (!offlineIndicator) {
        offlineIndicator = document.createElement('div');
        offlineIndicator.id = 'offline-indicator';
        offlineIndicator.innerHTML = '📱 Offline Mode - Games Still Work!';
        offlineIndicator.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #FF9500;
          color: white;
          text-align: center;
          padding: 8px;
          font-weight: 600;
          z-index: 9999;
          font-size: 14px;
        `;
        document.body.appendChild(offlineIndicator);
      }
    } else {
      if (offlineIndicator) {
        offlineIndicator.remove();
      }
    }
  }

  // Listen for online/offline events
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Check initial status
  updateOnlineStatus();

})();
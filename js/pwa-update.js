// PWA Update Notification System
(function() {
    'use strict';

    let updateAvailable = false;
    let updateButton = null;

    // Check for service worker updates
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            // Page is now controlled by a new service worker
            window.location.reload();
        });

        navigator.serviceWorker.ready.then((registration) => {
            // Check for updates periodically
            setInterval(() => {
                registration.update();
            }, 60000); // Check every minute

            // Listen for new service worker waiting to activate
            if (registration.waiting) {
                showUpdateNotification(registration.waiting);
            }

            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New content is available
                        showUpdateNotification(newWorker);
                    }
                });
            });
        });
    }

    function showUpdateNotification(worker) {
        if (updateAvailable) return; // Don't show multiple notifications
        
        updateAvailable = true;

        // Create update notification
        const updateNotification = document.createElement('div');
        updateNotification.id = 'pwa-update-notification';
        updateNotification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #4F46E5, #7C3AED);
                color: white;
                padding: 16px 20px;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.2);
                z-index: 10000;
                max-width: 300px;
                font-family: system-ui, -apple-system, sans-serif;
                animation: slideIn 0.3s ease-out;
            ">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <span style="font-size: 20px;">🆕</span>
                    <div>
                        <div style="font-weight: 600; font-size: 14px;">Update Available</div>
                        <div style="font-size: 12px; opacity: 0.9;">Jerusalem Hills has new features</div>
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button id="update-app-btn" style="
                        background: white;
                        color: #4F46E5;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 6px;
                        font-weight: 600;
                        cursor: pointer;
                        font-size: 12px;
                        flex: 1;
                    ">Update Now</button>
                    <button id="update-later-btn" style="
                        background: transparent;
                        color: white;
                        border: 1px solid rgba(255,255,255,0.3);
                        padding: 8px 16px;
                        border-radius: 6px;
                        font-weight: 600;
                        cursor: pointer;
                        font-size: 12px;
                    ">Later</button>
                </div>
            </div>
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(updateNotification);

        // Handle update button click
        document.getElementById('update-app-btn').addEventListener('click', () => {
            // Tell the new service worker to skip waiting
            worker.postMessage({ type: 'SKIP_WAITING' });
            
            // Show loading state
            document.getElementById('update-app-btn').innerHTML = '⏳ Updating...';
            document.getElementById('update-app-btn').disabled = true;
        });

        // Handle "later" button click
        document.getElementById('update-later-btn').addEventListener('click', () => {
            hideUpdateNotification();
        });

        // Auto-hide after 10 seconds if no action
        setTimeout(() => {
            if (updateNotification.parentNode) {
                hideUpdateNotification();
            }
        }, 10000);
    }

    function hideUpdateNotification() {
        const notification = document.getElementById('pwa-update-notification');
        if (notification) {
            notification.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                updateAvailable = false;
            }, 300);
        }
    }

    // Check cache status and show info if needed
    function checkCacheStatus() {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const messageChannel = new MessageChannel();
            
            messageChannel.port1.onmessage = (event) => {
                if (event.data.caches) {
                    console.log('📦 PWA Cache Status:', event.data);
                }
            };

            navigator.serviceWorker.controller.postMessage(
                { type: 'GET_CACHE_INFO' }, 
                [messageChannel.port2]
            );
        }
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        checkCacheStatus();
    });

    // Export for manual use
    window.PWAUpdate = {
        checkForUpdates: () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.update();
                });
            }
        },
        getCacheInfo: checkCacheStatus
    };

})();
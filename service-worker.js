// Service Worker for caching essential files for offline PWA experience
const CACHE_NAME = 'jerusalem-hills-v3';
const urlsToCache = [
  // Core pages
  '/',
  '/index.html',
  '/offline.html',
  
  // Styles and core scripts
  '/styles-new.css',
  '/styles.css',
  '/js/main.js',
  '/js/pwa.js',
  '/js/search.js',
  '/js/mobile-nav.js',
  '/js/load-header.js',
  '/components/header.html',
  
  // PWA assets
  '/img/1.svg',
  '/img/logo.jpg',
  '/favicon.ico',
  '/img/favicon-32x32.png',
  '/img/favicon-16x16.png',
  '/img/apple-touch-icon.png',
  '/img/android-chrome-192x192.png',
  '/img/android-chrome-512x512.png',
  '/img/site.webmanifest',
  
  // Kids Zone - Educational games for offline play
  '/kids/',
  '/kids/index.html',
  '/kids/assets/css/kids.css',
  '/kids/assets/css/game.css',
  '/kids/educational-disclaimer.html',
  
  // Math games
  '/kids/games/math.html',
  '/kids/games/subtraction.html', 
  '/kids/games/multiplication.html',
  '/kids/assets/js/math-game.js',
  '/kids/assets/js/subtraction-game.js',
  '/kids/assets/js/multiplication-game.js',
  
  // Educational games
  '/kids/games/words.html',
  '/kids/games/memory.html',
  '/kids/games/history-map.html',
  '/kids/assets/js/word-game.js',
  '/kids/assets/js/memory-game.js',
  '/kids/assets/js/sound-manager.js',
  
  // Classic games for offline entertainment
  '/games/',
  '/games/index.html',
  '/games/2048/2048.html',
  '/games/2048/2048.js',
  '/games/tetris/tetris.html',
  '/games/snake/snake.html',
  '/games/backgammon/backgammon.html',
  '/games/backgammon/scripts/backgammon.js',
  
  // Essential community pages
  '/forum/',
  '/forum/index.html',
  '/forum/terms.html',
  '/disclaimer.html',
  '/contact.html',
  
  // Marketplace (for browsing offline)
  '/marketplace.html'
];

// Install event: cache all necessary resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event: remove old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: intercept network requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return the response from the cached version
        if (response) {
          return response;
        }

        // Clone the request to use it in the fetch
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response to store in cache
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // If there's an error while fetching, serve the offline page if available
          return caches.match('/offline.html'); // Note: You would need to add and create an offline.html
        });
      })
  );
});

// Optional: Push Notifications for future use
self.addEventListener('push', (event) => {
  const title = 'Jerusalem Hills';
  const options = {
    body: 'New updates on Jerusalem Hills!',
    icon: '/img/1.svg', // Path to your icon
    badge: '/img/badge.png' // Path to your badge icon, make sure this file exists
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Optional: Handling notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({
      type: "window"
    }).then((clientList) => {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url === '/' && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
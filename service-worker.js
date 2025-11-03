// Enhanced Service Worker for comprehensive offline PWA experience
const CACHE_NAME = 'jerusalem-hills-v4';
const DYNAMIC_CACHE = 'jerusalem-hills-dynamic-v1';
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
  '/games/tetris/tetris.html',
  '/games/snake/snake.html',
  '/games/backgammon/backgammon.html',
  '/games/backgammon/scripts/backgammon.js',
  '/games/sudoku/sudoku.html',
  '/games/jerusalem-memory/jerusalem-memory.html',
  '/games/solitaire/solitaire.html',
  
  // Essential community pages
  '/forum/',
  '/forum/index.html',
  '/forum/terms.html',
  '/disclaimer.html',
  '/contact.html',
  
  // Marketplace (for browsing offline)
  '/marketplace.html'
];

// Install event: cache all necessary resources with enhanced strategy
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache essential resources
      caches.open(CACHE_NAME).then((cache) => {
        console.log('💾 Caching essential resources...');
        return cache.addAll(urlsToCache);
      }),
      // Pre-create dynamic cache for runtime caching
      caches.open(DYNAMIC_CACHE).then((cache) => {
        console.log('🗂️ Dynamic cache initialized');
        return Promise.resolve();
      })
    ])
  );
  
  console.log('📱 PWA Service Worker installed and ready');
});

// Activate event: remove old caches and claim clients
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, DYNAMIC_CACHE];
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all pages immediately
      self.clients.claim()
    ])
  );
  
  console.log('✅ Service Worker activated and claimed clients');
});

// Enhanced fetch event with intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests and chrome-extension requests
  if (url.origin !== location.origin && !url.href.startsWith('https://fonts.googleapis.com')) {
    return;
  }

  // Different strategies for different content types
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    event.respondWith(handleAssetRequest(request));
  } else if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleGenericRequest(request));
  }
});

// Handle image requests with cache-first strategy
async function handleImageRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return a fallback image if available
    return caches.match('/img/placeholder.jpg') || 
           new Response('', { status: 404 });
  }
}

// Handle CSS/JS assets with cache-first strategy
async function handleAssetRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('/* Offline - asset unavailable */', {
      headers: { 'Content-Type': 'text/css' }
    });
  }
}

// Handle navigation requests with network-first, fallback to cache
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('Network failed, checking cache...');
  }

  // Try cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Try to match the root path
  const rootResponse = await caches.match('/');
  if (rootResponse) {
    return rootResponse;
  }

  // Fallback to offline page
  return caches.match('/offline.html') || 
         new Response('Offline - Page not available', {
           status: 503,
           headers: { 'Content-Type': 'text/plain' }
         });
}

// Handle generic requests
async function handleGenericRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

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

// Background sync for forum posts when offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'forum-post-sync') {
    event.waitUntil(syncForumPosts());
  }
});

async function syncForumPosts() {
  try {
    // Get pending posts from IndexedDB (would need to implement storage)
    console.log('🔄 Syncing offline forum posts...');
    
    // This would sync any posts made while offline
    // Implementation would depend on the forum's data structure
    
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Forum sync failed:', error);
    throw error;
  }
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_INFO') {
    event.ports[0].postMessage({
      caches: [CACHE_NAME, DYNAMIC_CACHE],
      version: 'v4'
    });
  }
});

// Periodic cache cleanup utility
async function cleanupDynamicCache() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const keys = await cache.keys();
    
    if (keys.length > 50) { // Keep dynamic cache under 50 items
      const oldestKeys = keys.slice(0, 10);
      await Promise.all(oldestKeys.map(key => cache.delete(key)));
      console.log('🧹 Cleaned up dynamic cache:', oldestKeys.length, 'items removed');
    }
  } catch (error) {
    console.error('❌ Cache cleanup failed:', error);
  }
}

// Run cleanup periodically
setInterval(cleanupDynamicCache, 60000); // Every minute
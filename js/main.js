function initMap() {
    var map = new google.maps.Map(document.getElementById('google-map'), {
      center: { lat: 31.7683, lng: 35.2137 }, // Coordinates of Jerusalem
      zoom: 12
    });
  }
  
  // PWA Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
        console.log('Service Worker registered with scope: ', registration.scope);
      }).catch(function(error) {
        console.log('Service Worker registration failed: ', error);
      });
    });
  }
// Initialize Google Maps
window.initMap = function() {
    const jerusalemCoords = { lat: 31.7767, lng: 35.2345 };
    const map = new google.maps.Map(document.getElementById('google-map'), {
        zoom: 13,
        center: jerusalemCoords,
        mapTypeId: 'terrain'
    });

    // Add a marker for Jerusalem
    new google.maps.Marker({
        position: jerusalemCoords,
        map: map,
        title: 'Jerusalem'
    });
};

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
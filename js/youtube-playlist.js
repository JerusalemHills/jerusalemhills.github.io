// YouTube playlist configuration
const PLAYLIST_ID = 'PLZkWvmItga8Uke86j0__CT5IxPACfvCFy';
const VIDEO_IDS = [
    'xWbqiJfjkaY',
    'YpBR9vGQmGM',
    'ZsRBQIzXtAs',
    'lzDB35HiU_k',
    'mMPF3tpqYbM',
    'qJgWHxwKKqE'
];

function createVideoSlides() {
    const slider = document.querySelector('.slider');
    if (!slider) return;

    // Clear existing content
    slider.innerHTML = '';

    // Create duplicate videos at the start and end for smooth circular scrolling
    const extendedVideoIds = [
        ...VIDEO_IDS.slice(-3),  // Add last 3 videos at the start
        ...VIDEO_IDS,            // Add all videos
        ...VIDEO_IDS.slice(0, 3) // Add first 3 videos at the end
    ];

    // Create slides using direct video IDs
    extendedVideoIds.forEach(videoId => {
        const slide = document.createElement('div');
        slide.className = 'slider-item';
        slide.innerHTML = `
            <iframe 
                src="https://www.youtube.com/embed/${videoId}?rel=0"
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
            ></iframe>
        `;
        slider.appendChild(slide);
    });

    // Set initial position to show the first real slide (after the duplicates)
    setTimeout(() => {
        const slideWidth = document.querySelector('.slider-item').offsetWidth + 20;
        slider.style.transition = 'none';
        slider.style.transform = `translateX(${-3 * slideWidth}px)`;
        window.currentIndex = 3; // Start at the first real video
        
        // Re-enable transitions after setting initial position
        setTimeout(() => {
            slider.style.transition = 'transform 0.5s ease';
        }, 50);
    }, 100);
}

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', createVideoSlides);
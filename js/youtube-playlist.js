// YouTube playlist configuration
const PLAYLIST_ID = 'PLZkWvmItga8Uke86j0__CT5IxPACfvCFy';
let currentIndex = 0;
let isTransitioning = false;
let autoScrollInterval;

const getSlidesToMove = () => {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1200) return 2;
    return 3;
};

function moveSlide(direction) {
    if (isTransitioning) return;
    
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slider-item');
    const totalSlides = slides.length;
    const visibleSlides = getSlidesToMove();
    
    currentIndex += direction;
    
    // If we reach the end
    if (currentIndex >= totalSlides - visibleSlides) {
        isTransitioning = true;
        updateSlider();
        
        // Jump back to start
        setTimeout(() => {
            slider.style.transition = 'none';
            currentIndex = 0;
            updateSlider();
            
            setTimeout(() => {
                slider.style.transition = 'transform 0.5s ease';
                isTransitioning = false;
            }, 50);
        }, 500);
    }
    // If we reach the start
    else if (currentIndex < 0) {
        isTransitioning = true;
        updateSlider();
        
        setTimeout(() => {
            slider.style.transition = 'none';
            currentIndex = totalSlides - visibleSlides - 1;
            updateSlider();
            
            setTimeout(() => {
                slider.style.transition = 'transform 0.5s ease';
                isTransitioning = false;
            }, 50);
        }, 500);
    }
    else {
        updateSlider();
    }
}

function updateSlider() {
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slider-item');
    if (!slider || !slides.length) return;
    
    const slideWidth = slides[0].offsetWidth + 15; // Match gap from CSS
    slider.style.transform = `translateX(${-currentIndex * slideWidth}px)`;
}

function startAutoScroll() {
    // Clear any existing interval
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
    }
    
    // Start new auto-scroll interval
    autoScrollInterval = setInterval(() => {
        moveSlide(1);
    }, 5000);
}

function createVideoSlides() {
    const slider = document.querySelector('.slider');
    if (!slider) return;

    // Clear existing content
    slider.innerHTML = '';

    // Create slides
    for (let i = 0; i < 6; i++) {
        const slide = document.createElement('div');
        slide.className = 'slider-item';
        
        slide.innerHTML = `
            <iframe 
                src="https://www.youtube.com/embed?listType=playlist&list=${PLAYLIST_ID}&index=${i + 1}&enablejsapi=1&origin=${window.location.origin}"
                frameborder="0" 
                allow="fullscreen" 
                allowfullscreen
            ></iframe>
        `;
        slider.appendChild(slide);
    }

    // Initialize slider
    currentIndex = 0;
    updateSlider();
    
    // Set up auto-scroll and hover pause
    startAutoScroll();
    
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', () => {
            clearInterval(autoScrollInterval);
        });
        
        sliderContainer.addEventListener('mouseleave', () => {
            startAutoScroll();
        });
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    currentIndex = 0;
    updateSlider();
});

// Expose necessary functions to window
window.moveSlide = moveSlide;

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', createVideoSlides);
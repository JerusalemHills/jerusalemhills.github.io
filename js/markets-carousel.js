// Markets Carousel for Jerusalem Hills Homepage
// Provides touch-friendly widget navigation on mobile and desktop

(function() {
    'use strict';

    class MarketsCarousel {
        constructor() {
            this.currentSlide = 0;
            this.autoAdvance = true;
            this.autoAdvanceInterval = 8000; // 8 seconds
            this.autoAdvanceTimer = null;
            this.isPaused = false;
            this.container = null;
            this.slides = [];
            this.dots = [];
            this.touchStartX = 0;
            this.touchEndX = 0;
            this.init();
        }

        init() {
            // Wait for DOM and TradingView widgets to load
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setup());
            } else {
                setTimeout(() => this.setup(), 1000); // Give TradingView time to load
            }
        }

        setup() {
            this.container = document.querySelector('.markets-widgets');
            if (!this.container) {
                console.warn('Markets widgets container not found');
                return;
            }

            // Get all widget containers
            this.slides = Array.from(this.container.querySelectorAll('.tradingview-widget-container'));

            if (this.slides.length === 0) {
                console.warn('No TradingView widgets found');
                return;
            }

            console.log(`📊 Markets Carousel: Found ${this.slides.length} widgets`);

            // Create carousel structure
            this.createCarousel();
            this.createControls();
            this.addStyles();
            this.attachEvents();

            // Start auto-advance
            if (this.autoAdvance && this.slides.length > 1) {
                this.startAutoAdvance();
            }

            console.log('✅ Markets Carousel initialized');
        }

        createCarousel() {
            // Wrap widgets in carousel structure
            const wrapper = document.createElement('div');
            wrapper.className = 'markets-carousel-wrapper';

            const track = document.createElement('div');
            track.className = 'markets-carousel-track';

            // Move all slides into track
            this.slides.forEach((slide, index) => {
                slide.classList.add('markets-carousel-slide');
                slide.dataset.slideIndex = index;
                if (index === 0) {
                    slide.classList.add('active');
                }
                track.appendChild(slide);
            });

            wrapper.appendChild(track);
            this.container.appendChild(wrapper);

            this.track = track;
            this.wrapper = wrapper;
        }

        createControls() {
            // Create navigation dots
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'markets-carousel-dots';

            this.slides.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.className = 'markets-carousel-dot';
                dot.setAttribute('aria-label', `Go to market ${index + 1}`);
                dot.dataset.slideIndex = index;

                if (index === 0) {
                    dot.classList.add('active');
                }

                dot.addEventListener('click', () => this.goToSlide(index));
                dotsContainer.appendChild(dot);
                this.dots.push(dot);
            });

            this.wrapper.appendChild(dotsContainer);

            // Create prev/next buttons (desktop only)
            const prevBtn = document.createElement('button');
            prevBtn.className = 'markets-carousel-btn markets-carousel-prev';
            prevBtn.innerHTML = '‹';
            prevBtn.setAttribute('aria-label', 'Previous market');
            prevBtn.addEventListener('click', () => this.prevSlide());

            const nextBtn = document.createElement('button');
            nextBtn.className = 'markets-carousel-btn markets-carousel-next';
            nextBtn.innerHTML = '›';
            nextBtn.setAttribute('aria-label', 'Next market');
            nextBtn.addEventListener('click', () => this.nextSlide());

            this.wrapper.appendChild(prevBtn);
            this.wrapper.appendChild(nextBtn);
        }

        addStyles() {
            if (document.getElementById('markets-carousel-styles')) return;

            const styles = document.createElement('style');
            styles.id = 'markets-carousel-styles';
            styles.textContent = `
                .markets-carousel-wrapper {
                    position: relative;
                    width: 100%;
                    overflow: hidden;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }

                .markets-carousel-track {
                    display: flex;
                    transition: transform 0.4s ease-in-out;
                    width: 100%;
                }

                .markets-carousel-slide {
                    flex: 0 0 100%;
                    width: 100%;
                    display: none;
                    opacity: 0;
                    transition: opacity 0.4s ease;
                }

                .markets-carousel-slide.active {
                    display: block;
                    opacity: 1;
                }

                /* Dots navigation */
                .markets-carousel-dots {
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px;
                    background: rgba(249, 250, 251, 0.9);
                    border-top: 1px solid rgba(229, 231, 235, 0.8);
                }

                .markets-carousel-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    border: 2px solid #cbd5e1;
                    background: white;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    padding: 0;
                }

                .markets-carousel-dot:hover {
                    background: #e2e8f0;
                    transform: scale(1.2);
                }

                .markets-carousel-dot.active {
                    background: #3b82f6;
                    border-color: #3b82f6;
                    width: 24px;
                    border-radius: 5px;
                }

                /* Arrow buttons */
                .markets-carousel-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.95);
                    border: 2px solid rgba(59, 130, 246, 0.3);
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 24px;
                    color: #3b82f6;
                    z-index: 10;
                    transition: all 0.3s ease;
                    opacity: 0;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                }

                .markets-carousel-wrapper:hover .markets-carousel-btn {
                    opacity: 1;
                }

                .markets-carousel-btn:hover {
                    background: #3b82f6;
                    color: white;
                    transform: translateY(-50%) scale(1.1);
                }

                .markets-carousel-prev {
                    left: 10px;
                }

                .markets-carousel-next {
                    right: 10px;
                }

                /* Mobile responsiveness */
                @media (max-width: 768px) {
                    .markets-carousel-btn {
                        display: none; /* Hide arrows on mobile, use swipe */
                    }

                    .markets-carousel-dots {
                        padding: 8px;
                    }

                    .markets-carousel-dot {
                        width: 8px;
                        height: 8px;
                    }

                    .markets-carousel-dot.active {
                        width: 20px;
                    }
                }

                /* Pause indicator */
                .markets-carousel-wrapper.paused::before {
                    content: '⏸';
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(0, 0, 0, 0.6);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    z-index: 11;
                    opacity: 0.7;
                }

                /* Smooth height transitions */
                .markets-widgets {
                    transition: height 0.3s ease;
                }
            `;
            document.head.appendChild(styles);
        }

        attachEvents() {
            // Touch events for swipe
            this.wrapper.addEventListener('touchstart', (e) => {
                this.touchStartX = e.changedTouches[0].screenX;
                this.pauseAutoAdvance();
            });

            this.wrapper.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe();
            });

            // Mouse events for desktop
            this.wrapper.addEventListener('mouseenter', () => {
                this.pauseAutoAdvance();
            });

            this.wrapper.addEventListener('mouseleave', () => {
                this.resumeAutoAdvance();
            });

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (!this.isInViewport(this.wrapper)) return;

                if (e.key === 'ArrowLeft') {
                    this.prevSlide();
                    this.pauseAutoAdvance();
                } else if (e.key === 'ArrowRight') {
                    this.nextSlide();
                    this.pauseAutoAdvance();
                }
            });
        }

        handleSwipe() {
            const swipeThreshold = 50;
            const diff = this.touchStartX - this.touchEndX;

            if (Math.abs(diff) < swipeThreshold) return;

            if (diff > 0) {
                // Swiped left - next slide
                this.nextSlide();
            } else {
                // Swiped right - previous slide
                this.prevSlide();
            }
        }

        goToSlide(index) {
            if (index === this.currentSlide) return;

            // Remove active from current
            this.slides[this.currentSlide].classList.remove('active');
            this.dots[this.currentSlide].classList.remove('active');

            // Add active to new
            this.currentSlide = index;
            this.slides[this.currentSlide].classList.add('active');
            this.dots[this.currentSlide].classList.add('active');

            // Announce change for screen readers
            this.announceSlide();
        }

        nextSlide() {
            const next = (this.currentSlide + 1) % this.slides.length;
            this.goToSlide(next);
        }

        prevSlide() {
            const prev = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
            this.goToSlide(prev);
        }

        startAutoAdvance() {
            if (this.autoAdvanceTimer) return;

            this.autoAdvanceTimer = setInterval(() => {
                if (!this.isPaused) {
                    this.nextSlide();
                }
            }, this.autoAdvanceInterval);
        }

        pauseAutoAdvance() {
            this.isPaused = true;
            this.wrapper.classList.add('paused');
        }

        resumeAutoAdvance() {
            this.isPaused = false;
            this.wrapper.classList.remove('paused');
        }

        stopAutoAdvance() {
            if (this.autoAdvanceTimer) {
                clearInterval(this.autoAdvanceTimer);
                this.autoAdvanceTimer = null;
            }
        }

        announceSlide() {
            // Accessibility: announce slide change
            const announcement = document.createElement('div');
            announcement.setAttribute('role', 'status');
            announcement.setAttribute('aria-live', 'polite');
            announcement.className = 'sr-only';
            announcement.textContent = `Market widget ${this.currentSlide + 1} of ${this.slides.length}`;
            document.body.appendChild(announcement);
            setTimeout(() => announcement.remove(), 1000);
        }

        isInViewport(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }

        // Public API
        destroy() {
            this.stopAutoAdvance();
            // Restore original structure if needed
        }
    }

    // Auto-initialize
    window.MarketsCarousel = MarketsCarousel;
    window.marketsCarousel = new MarketsCarousel();

})();

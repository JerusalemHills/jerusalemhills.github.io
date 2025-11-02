/**
 * Enhanced Mobile Touch Controls for Jerusalem Hills Games
 * Provides consistent touch interactions across all games
 */

class MobileTouchControls {
    constructor(options = {}) {
        this.options = {
            // Touch sensitivity settings
            swipeThreshold: 30,
            tapThreshold: 10,
            doubleTapThreshold: 300,
            longPressThreshold: 500,
            
            // Vibration feedback (if supported)
            vibrationEnabled: true,
            
            // Visual feedback
            feedbackEnabled: true,
            
            // Override default options
            ...options
        };

        this.touchState = {
            startX: 0,
            startY: 0,
            startTime: 0,
            lastTap: 0,
            moved: false,
            isLongPress: false,
            longPressTimer: null
        };

        this.init();
    }

    init() {
        // Add mobile-optimized CSS
        this.addMobileStyles();
        
        // Disable default touch behaviors that interfere with games
        this.disableDefaultTouchBehaviors();
        
        // Add visual touch feedback
        this.addTouchFeedback();

        console.log('Mobile Touch Controls initialized');
    }

    addMobileStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Mobile Touch Optimizations */
            .touch-optimized {
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                -khtml-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                -webkit-tap-highlight-color: transparent;
            }

            .touch-target {
                min-height: 44px;
                min-width: 44px;
                position: relative;
            }

            .touch-feedback {
                position: absolute;
                pointer-events: none;
                border-radius: 50%;
                background: rgba(145, 217, 248, 0.3);
                transform: scale(0);
                animation: touchRipple 0.6s ease-out;
            }

            @keyframes touchRipple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }

            .long-press-indicator {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 60px;
                height: 60px;
                border: 3px solid rgba(145, 217, 248, 0.8);
                border-radius: 50%;
                border-top-color: transparent;
                animation: longPressSpinner 0.5s linear;
                pointer-events: none;
            }

            @keyframes longPressSpinner {
                from { transform: translate(-50%, -50%) rotate(0deg); }
                to { transform: translate(-50%, -50%) rotate(360deg); }
            }

            /* Game-specific mobile improvements */
            .game-board {
                touch-action: none;
            }

            .draggable-item {
                cursor: grab;
                transition: transform 0.2s ease;
            }

            .draggable-item:active,
            .draggable-item.dragging {
                cursor: grabbing;
                transform: scale(1.05);
                z-index: 1000;
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
            }

            /* Mobile button improvements */
            @media (max-width: 768px) {
                button, .btn {
                    min-height: 44px;
                    min-width: 44px;
                    padding: 12px 20px;
                    font-size: 16px;
                    touch-action: manipulation;
                }

                .game-controls {
                    padding: 20px;
                    gap: 15px;
                }

                .score-display {
                    font-size: 1.2em;
                    padding: 10px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    disableDefaultTouchBehaviors() {
        // Prevent default touch behaviors on game areas
        document.addEventListener('touchstart', (e) => {
            if (this.isGameElement(e.target)) {
                // Allow scrolling on certain elements
                if (!e.target.closest('.scroll-allowed')) {
                    e.preventDefault();
                }
            }
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (this.isGameElement(e.target)) {
                e.preventDefault();
            }
        }, { passive: false });

        // Prevent zoom on double tap for game elements
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = new Date().getTime();
            if (now - lastTouchEnd <= 300 && this.isGameElement(e.target)) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    isGameElement(element) {
        return element.closest('.game-container, .game-board, .game-area, canvas, .grid-container');
    }

    addTouchFeedback() {
        document.addEventListener('touchstart', (e) => {
            if (this.options.feedbackEnabled && this.isInteractiveElement(e.target)) {
                this.showTouchFeedback(e.touches[0]);
            }
        });
    }

    isInteractiveElement(element) {
        return element.matches('button, .btn, .clickable, .draggable, .checker, .tile, .card, input[type="button"], input[type="submit"]') ||
               element.closest('button, .btn, .clickable, .draggable');
    }

    showTouchFeedback(touch) {
        const feedback = document.createElement('div');
        feedback.className = 'touch-feedback';
        feedback.style.left = touch.clientX - 25 + 'px';
        feedback.style.top = touch.clientY - 25 + 'px';
        feedback.style.width = '50px';
        feedback.style.height = '50px';
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 600);
    }

    // Enhanced touch event handlers for games
    setupEnhancedTouchEvents(element, handlers = {}) {
        if (!element) return;

        element.classList.add('touch-optimized');

        element.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            this.touchState.startX = touch.clientX;
            this.touchState.startY = touch.clientY;
            this.touchState.startTime = Date.now();
            this.touchState.moved = false;
            this.touchState.isLongPress = false;

            // Long press detection
            this.touchState.longPressTimer = setTimeout(() => {
                this.touchState.isLongPress = true;
                if (handlers.onLongPress) {
                    this.vibrate(50);
                    this.showLongPressIndicator(element);
                    handlers.onLongPress(e, {
                        x: this.touchState.startX,
                        y: this.touchState.startY
                    });
                }
            }, this.options.longPressThreshold);

            if (handlers.onTouchStart) {
                handlers.onTouchStart(e, {
                    x: this.touchState.startX,
                    y: this.touchState.startY
                });
            }
        });

        element.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const deltaX = touch.clientX - this.touchState.startX;
            const deltaY = touch.clientY - this.touchState.startY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance > this.options.tapThreshold) {
                this.touchState.moved = true;
                clearTimeout(this.touchState.longPressTimer);
            }

            if (handlers.onTouchMove) {
                handlers.onTouchMove(e, {
                    x: touch.clientX,
                    y: touch.clientY,
                    deltaX: deltaX,
                    deltaY: deltaY,
                    distance: distance
                });
            }
        });

        element.addEventListener('touchend', (e) => {
            clearTimeout(this.touchState.longPressTimer);
            
            const duration = Date.now() - this.touchState.startTime;
            const now = Date.now();

            if (!this.touchState.moved && !this.touchState.isLongPress) {
                // Check for double tap
                if (now - this.touchState.lastTap < this.options.doubleTapThreshold) {
                    if (handlers.onDoubleTap) {
                        this.vibrate(30);
                        handlers.onDoubleTap(e, {
                            x: this.touchState.startX,
                            y: this.touchState.startY
                        });
                    }
                } else {
                    // Single tap
                    if (handlers.onTap) {
                        this.vibrate(20);
                        handlers.onTap(e, {
                            x: this.touchState.startX,
                            y: this.touchState.startY
                        });
                    }
                }
                this.touchState.lastTap = now;
            } else if (this.touchState.moved) {
                // Swipe detection
                const touch = e.changedTouches[0];
                const deltaX = touch.clientX - this.touchState.startX;
                const deltaY = touch.clientY - this.touchState.startY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                if (distance > this.options.swipeThreshold) {
                    const direction = this.getSwipeDirection(deltaX, deltaY);
                    if (handlers.onSwipe) {
                        this.vibrate(40);
                        handlers.onSwipe(e, {
                            direction: direction,
                            distance: distance,
                            deltaX: deltaX,
                            deltaY: deltaY,
                            velocity: distance / duration
                        });
                    }
                }
            }

            if (handlers.onTouchEnd) {
                handlers.onTouchEnd(e, {
                    duration: duration,
                    moved: this.touchState.moved,
                    isLongPress: this.touchState.isLongPress
                });
            }

            this.removeLongPressIndicator(element);
        });
    }

    getSwipeDirection(deltaX, deltaY) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (absX > absY) {
            return deltaX > 0 ? 'right' : 'left';
        } else {
            return deltaY > 0 ? 'down' : 'up';
        }
    }

    showLongPressIndicator(element) {
        const indicator = document.createElement('div');
        indicator.className = 'long-press-indicator';
        element.style.position = 'relative';
        element.appendChild(indicator);
    }

    removeLongPressIndicator(element) {
        const indicator = element.querySelector('.long-press-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    vibrate(duration) {
        if (this.options.vibrationEnabled && 'vibrate' in navigator) {
            navigator.vibrate(duration);
        }
    }

    // Utility method for drag and drop on mobile
    setupDragAndDrop(draggableSelector, dropZoneSelector, handlers = {}) {
        const draggables = document.querySelectorAll(draggableSelector);
        const dropZones = document.querySelectorAll(dropZoneSelector);

        draggables.forEach(draggable => {
            draggable.classList.add('draggable-item');
            
            this.setupEnhancedTouchEvents(draggable, {
                onTouchStart: (e, data) => {
                    draggable.classList.add('dragging');
                    if (handlers.onDragStart) handlers.onDragStart(draggable, e, data);
                },
                
                onTouchMove: (e, data) => {
                    // Move element with finger
                    draggable.style.position = 'fixed';
                    draggable.style.left = data.x - 25 + 'px';
                    draggable.style.top = data.y - 25 + 'px';
                    draggable.style.zIndex = '1000';
                    
                    // Check for drop zone
                    const elementBelow = document.elementFromPoint(data.x, data.y);
                    const dropZone = elementBelow?.closest(dropZoneSelector);
                    
                    dropZones.forEach(zone => {
                        zone.classList.remove('drop-hover');
                    });
                    
                    if (dropZone) {
                        dropZone.classList.add('drop-hover');
                    }
                    
                    if (handlers.onDragMove) handlers.onDragMove(draggable, e, data, dropZone);
                },
                
                onTouchEnd: (e, data) => {
                    draggable.classList.remove('dragging');
                    
                    // Reset position
                    draggable.style.position = '';
                    draggable.style.left = '';
                    draggable.style.top = '';
                    draggable.style.zIndex = '';
                    
                    // Check final drop zone
                    const elementBelow = document.elementFromPoint(data.x || this.touchState.startX, data.y || this.touchState.startY);
                    const dropZone = elementBelow?.closest(dropZoneSelector);
                    
                    dropZones.forEach(zone => {
                        zone.classList.remove('drop-hover');
                    });
                    
                    if (dropZone && handlers.onDrop) {
                        handlers.onDrop(draggable, dropZone, e, data);
                    } else if (handlers.onDragCancel) {
                        handlers.onDragCancel(draggable, e, data);
                    }
                }
            });
        });
    }

    // Game-specific helpers
    addSwipeControls(gameContainer, onSwipe) {
        this.setupEnhancedTouchEvents(gameContainer, {
            onSwipe: (e, data) => {
                onSwipe(data.direction, data);
            }
        });
    }

    addTapControls(elements, onTap) {
        elements.forEach(element => {
            this.setupEnhancedTouchEvents(element, {
                onTap: (e, data) => {
                    onTap(element, e, data);
                }
            });
        });
    }

    // Initialize for specific game types
    initializeFor2048(gameContainer) {
        this.addSwipeControls(gameContainer, (direction) => {
            const keyMap = {
                'up': 'ArrowUp',
                'down': 'ArrowDown', 
                'left': 'ArrowLeft',
                'right': 'ArrowRight'
            };
            
            if (keyMap[direction]) {
                const event = new KeyboardEvent('keydown', { key: keyMap[direction] });
                document.dispatchEvent(event);
            }
        });
    }

    initializeForBackgammon(gameContainer) {
        // Enhanced touch controls for backgammon pieces
        this.setupDragAndDrop(
            '.checker',
            '.point, .bar, .home-area',
            {
                onDragStart: (checker, e, data) => {
                    // Simulate mouse click for existing game logic
                    checker.click();
                },
                
                onDrop: (checker, dropZone, e, data) => {
                    // Simulate click on drop zone
                    dropZone.click();
                }
            }
        );

        // Add tap controls for dice rolling
        const diceArea = gameContainer.querySelector('.dice-container, .dice-area');
        if (diceArea) {
            this.setupEnhancedTouchEvents(diceArea, {
                onTap: () => {
                    const rollButton = document.querySelector('[onclick*="rollDice"], .roll-btn');
                    if (rollButton) rollButton.click();
                }
            });
        }
    }

    initializeForPuzzleGames(gameContainer) {
        // Enhanced touch for puzzle games (Sudoku, Memory, etc.)
        const cells = gameContainer.querySelectorAll('.cell, .grid-cell, .card');
        
        this.addTapControls(cells, (cell, e, data) => {
            // Simulate click for existing game logic
            cell.click();
        });
    }
}

// Auto-initialize for common game patterns
window.addEventListener('DOMContentLoaded', () => {
    // Only initialize on mobile devices
    if (window.innerWidth <= 768 || 'ontouchstart' in window) {
        const mobileControls = new MobileTouchControls();
        
        // Auto-detect and initialize common game patterns
        const gameContainer = document.querySelector('.game-container, .game-board, .game-area');
        
        if (gameContainer) {
            // 2048 game
            if (document.querySelector('.grid-container, .tile-container') || document.title.includes('2048')) {
                mobileControls.initializeFor2048(gameContainer);
            }
            
            // Backgammon game
            if (document.querySelector('.checker, .point') || document.title.includes('Backgammon')) {
                mobileControls.initializeForBackgammon(gameContainer);
            }
            
            // Puzzle games (Sudoku, Memory, etc.)
            if (document.querySelector('.sudoku-grid, .memory-grid, .puzzle-grid')) {
                mobileControls.initializeForPuzzleGames(gameContainer);
            }
        }
        
        // Make mobile controls globally available
        window.mobileControls = mobileControls;
    }
});
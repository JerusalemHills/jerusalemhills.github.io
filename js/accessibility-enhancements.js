/**
 * Accessibility Enhancements for Jerusalem Hills Platform
 * Provides comprehensive screen reader and keyboard navigation support
 */

class AccessibilityEnhancer {
    constructor(options = {}) {
        this.options = {
            // Announcement settings
            announcePageChanges: true,
            announceGameEvents: true,
            announceScore: true,
            
            // Navigation settings
            skipLinksEnabled: true,
            landmarkNavigation: true,
            keyboardShortcuts: true,
            
            // Visual settings
            highContrastMode: false,
            focusIndicators: true,
            reducedMotion: false,
            
            // Override defaults
            ...options
        };

        this.announcer = null;
        this.focusHistory = [];
        this.shortcuts = new Map();
        this.init();
    }

    init() {
        this.createAnnouncer();
        this.addSkipLinks();
        this.enhanceKeyboardNavigation();
        this.addARIALabels();
        this.setupGameAccessibility();
        this.addKeyboardShortcuts();
        this.handleUserPreferences();
        
        console.log('Accessibility enhancements initialized');
    }

    createAnnouncer() {
        // Create live region for screen reader announcements
        this.announcer = document.createElement('div');
        this.announcer.setAttribute('aria-live', 'polite');
        this.announcer.setAttribute('aria-atomic', 'true');
        this.announcer.className = 'sr-only announcer';
        this.announcer.id = 'accessibility-announcer';
        
        // Create assertive announcer for urgent messages
        this.urgentAnnouncer = document.createElement('div');
        this.urgentAnnouncer.setAttribute('aria-live', 'assertive');
        this.urgentAnnouncer.setAttribute('aria-atomic', 'true');
        this.urgentAnnouncer.className = 'sr-only announcer';
        this.urgentAnnouncer.id = 'urgent-announcer';
        
        document.body.appendChild(this.announcer);
        document.body.appendChild(this.urgentAnnouncer);
    }

    announce(message, urgent = false) {
        if (!this.options.announceGameEvents && !urgent) return;
        
        const announcer = urgent ? this.urgentAnnouncer : this.announcer;
        announcer.textContent = message;
        
        // Clear after announcement to allow repeated messages
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    }

    addSkipLinks() {
        if (!this.options.skipLinksEnabled) return;

        const skipContainer = document.createElement('div');
        skipContainer.className = 'skip-links';
        skipContainer.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#navigation" class="skip-link">Skip to navigation</a>
            <a href="#game-area" class="skip-link">Skip to game</a>
        `;
        
        document.body.insertBefore(skipContainer, document.body.firstChild);
    }

    enhanceKeyboardNavigation() {
        // Improve focus management
        document.addEventListener('keydown', (e) => {
            // Tab trapping for modals
            if (e.key === 'Tab') {
                this.handleTabKey(e);
            }
            
            // Escape key handling
            if (e.key === 'Escape') {
                this.handleEscapeKey(e);
            }
            
            // Arrow key navigation for grids
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                this.handleArrowKeys(e);
            }
        });

        // Track focus for history
        document.addEventListener('focusin', (e) => {
            this.focusHistory.push(e.target);
            if (this.focusHistory.length > 10) {
                this.focusHistory.shift();
            }
        });
    }

    handleTabKey(e) {
        const modal = document.querySelector('.modal.active, .dialog[open]');
        if (modal) {
            this.trapFocus(e, modal);
        }
    }

    handleEscapeKey(e) {
        // Close modals
        const modal = document.querySelector('.modal.active, .dialog[open]');
        if (modal) {
            const closeBtn = modal.querySelector('.close, [data-close]');
            if (closeBtn) closeBtn.click();
            return;
        }

        // Clear game selections
        const selectedElements = document.querySelectorAll('.selected, .highlighted');
        if (selectedElements.length > 0) {
            selectedElements.forEach(el => {
                el.classList.remove('selected', 'highlighted');
            });
            this.announce('Selection cleared');
        }
    }

    handleArrowKeys(e) {
        const target = e.target;
        const grid = target.closest('.grid, .game-board, .sudoku-grid, .memory-grid');
        
        if (grid) {
            e.preventDefault();
            this.navigateGrid(target, e.key, grid);
        }
    }

    navigateGrid(current, direction, grid) {
        const cells = Array.from(grid.querySelectorAll('.cell, .grid-cell, .checker, .card, button'));
        const currentIndex = cells.indexOf(current);
        
        if (currentIndex === -1) return;

        const gridColumns = this.getGridColumns(grid);
        let newIndex;

        switch (direction) {
            case 'ArrowUp':
                newIndex = currentIndex - gridColumns;
                break;
            case 'ArrowDown':
                newIndex = currentIndex + gridColumns;
                break;
            case 'ArrowLeft':
                newIndex = currentIndex - 1;
                break;
            case 'ArrowRight':
                newIndex = currentIndex + 1;
                break;
        }

        if (newIndex >= 0 && newIndex < cells.length && cells[newIndex]) {
            cells[newIndex].focus();
            this.announceGridPosition(cells[newIndex], newIndex, gridColumns);
        }
    }

    getGridColumns(grid) {
        // Detect grid columns from CSS or data attribute
        const computedStyle = window.getComputedStyle(grid);
        const gridTemplateColumns = computedStyle.gridTemplateColumns;
        
        if (gridTemplateColumns && gridTemplateColumns !== 'none') {
            return gridTemplateColumns.split(' ').length;
        }
        
        // Fallback: count cells in first row
        const firstRowCells = grid.querySelectorAll('.cell, .grid-cell');
        return Math.sqrt(firstRowCells.length) || 4; // Default to 4x4
    }

    announceGridPosition(cell, index, columns) {
        const row = Math.floor(index / columns) + 1;
        const col = (index % columns) + 1;
        const content = cell.textContent?.trim() || cell.getAttribute('aria-label') || 'empty';
        
        this.announce(`Row ${row}, Column ${col}, ${content}`);
    }

    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }

    addARIALabels() {
        // Add missing labels and roles
        this.enhanceButtons();
        this.enhanceInputs();
        this.enhanceNavigationStructure();
        this.enhanceGameElements();
    }

    enhanceButtons() {
        document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').forEach(btn => {
            const text = btn.textContent?.trim();
            const icon = btn.querySelector('i, svg, .icon');
            
            if (!text && icon) {
                // Button with only icon
                const className = icon.className || '';
                if (className.includes('close')) {
                    btn.setAttribute('aria-label', 'Close');
                } else if (className.includes('menu')) {
                    btn.setAttribute('aria-label', 'Open menu');
                } else if (className.includes('play')) {
                    btn.setAttribute('aria-label', 'Play');
                } else if (className.includes('pause')) {
                    btn.setAttribute('aria-label', 'Pause');
                } else if (className.includes('stop')) {
                    btn.setAttribute('aria-label', 'Stop');
                } else {
                    btn.setAttribute('aria-label', 'Button');
                }
            }
        });
    }

    enhanceInputs() {
        document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').forEach(input => {
            const label = document.querySelector(`label[for="${input.id}"]`);
            const placeholder = input.getAttribute('placeholder');
            
            if (!label && placeholder) {
                input.setAttribute('aria-label', placeholder);
            } else if (!label && !placeholder) {
                input.setAttribute('aria-label', input.type === 'search' ? 'Search' : 'Input field');
            }
        });
    }

    enhanceNavigationStructure() {
        // Add navigation landmarks
        const nav = document.querySelector('nav:not([aria-label]):not([aria-labelledby])');
        if (nav) {
            nav.setAttribute('aria-label', 'Main navigation');
        }

        const main = document.querySelector('main:not([aria-label]):not([aria-labelledby])');
        if (main) {
            main.setAttribute('aria-label', 'Main content');
        }

        // Add heading structure
        this.fixHeadingHierarchy();
    }

    fixHeadingHierarchy() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let previousLevel = 0;

        headings.forEach(heading => {
            const level = parseInt(heading.tagName.charAt(1));
            
            // Check for missing intermediate headings
            if (level > previousLevel + 1) {
                console.warn(`Heading hierarchy jump detected: ${heading.tagName} follows h${previousLevel}`);
            }
            
            previousLevel = level;
        });
    }

    enhanceGameElements() {
        // Add game-specific accessibility
        this.enhanceGameBoard();
        this.enhanceScoreDisplays();
        this.enhanceGameControls();
    }

    enhanceGameBoard() {
        const gameBoards = document.querySelectorAll('.game-board, .grid-container, .sudoku-grid');
        
        gameBoards.forEach(board => {
            if (!board.getAttribute('role')) {
                board.setAttribute('role', 'grid');
                board.setAttribute('aria-label', 'Game board');
            }

            // Add cell roles and labels
            const cells = board.querySelectorAll('.cell, .grid-cell');
            cells.forEach((cell, index) => {
                if (!cell.getAttribute('role')) {
                    cell.setAttribute('role', 'gridcell');
                    cell.setAttribute('tabindex', '0');
                }

                // Add position information
                const columns = this.getGridColumns(board);
                const row = Math.floor(index / columns) + 1;
                const col = (index % columns) + 1;
                
                if (!cell.getAttribute('aria-label')) {
                    const content = cell.textContent?.trim() || 'empty';
                    cell.setAttribute('aria-label', `Row ${row}, Column ${col}, ${content}`);
                }
            });
        });
    }

    enhanceScoreDisplays() {
        document.querySelectorAll('.score, .points, .timer').forEach(display => {
            if (!display.getAttribute('aria-live')) {
                display.setAttribute('aria-live', 'polite');
                display.setAttribute('aria-atomic', 'true');
            }
        });
    }

    enhanceGameControls() {
        // Add comprehensive labels for game controls
        const rollButton = document.querySelector('[onclick*="rollDice"], .roll-btn');
        if (rollButton && !rollButton.getAttribute('aria-label')) {
            rollButton.setAttribute('aria-label', 'Roll dice');
        }

        const newGameButton = document.querySelector('[onclick*="newGame"], .new-game-btn');
        if (newGameButton && !newGameButton.getAttribute('aria-label')) {
            newGameButton.setAttribute('aria-label', 'Start new game');
        }

        const undoButton = document.querySelector('[onclick*="undo"], .undo-btn');
        if (undoButton && !undoButton.getAttribute('aria-label')) {
            undoButton.setAttribute('aria-label', 'Undo last move');
        }
    }

    setupGameAccessibility() {
        // Game-specific accessibility setup
        this.setup2048Accessibility();
        this.setupBackgammonAccessibility();
        this.setupSudokuAccessibility();
        this.setupMemoryGameAccessibility();
    }

    setup2048Accessibility() {
        if (!document.querySelector('.grid-container, .tile-container')) return;

        this.announce('2048 game loaded. Use arrow keys to move tiles.');
        
        // Monitor score changes
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            const observer = new MutationObserver(() => {
                if (this.options.announceScore) {
                    this.announce(`Score: ${scoreElement.textContent}`);
                }
            });
            observer.observe(scoreElement, { childList: true, subtree: true });
        }
    }

    setupBackgammonAccessibility() {
        if (!document.querySelector('.checker, .point')) return;

        this.announce('Backgammon game loaded. Use tab to navigate pieces and points.');
        
        // Add checker descriptions
        document.querySelectorAll('.checker').forEach((checker, index) => {
            const color = checker.classList.contains('white') ? 'white' : 'black';
            const point = checker.closest('.point');
            const pointNum = point ? point.dataset.point || 'bar' : 'unknown';
            
            checker.setAttribute('aria-label', `${color} checker on point ${pointNum}`);
            checker.setAttribute('tabindex', '0');
        });
    }

    setupSudokuAccessibility() {
        if (!document.querySelector('.sudoku-grid')) return;

        this.announce('Sudoku puzzle loaded. Use arrow keys to navigate cells, number keys to enter values.');
        
        // Add cell navigation instructions
        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            cell.addEventListener('focus', () => {
                const value = cell.textContent?.trim() || 'empty';
                const position = cell.getAttribute('aria-label') || '';
                this.announce(`${position}, ${value}`);
            });
        });
    }

    setupMemoryGameAccessibility() {
        if (!document.querySelector('.memory-grid, .memory-card')) return;

        this.announce('Memory matching game loaded. Use tab or arrow keys to navigate cards.');
        
        document.querySelectorAll('.memory-card, .card').forEach(card => {
            card.addEventListener('click', () => {
                const content = card.getAttribute('data-content') || card.textContent?.trim();
                this.announce(`Card revealed: ${content}`);
            });
        });
    }

    addKeyboardShortcuts() {
        if (!this.options.keyboardShortcuts) return;

        this.shortcuts.set('h', () => this.showKeyboardHelp());
        this.shortcuts.set('?', () => this.showKeyboardHelp());
        this.shortcuts.set('/', () => this.focusSearch());
        this.shortcuts.set('g+h', () => this.goToHome());
        this.shortcuts.set('g+g', () => this.goToGames());
        this.shortcuts.set('g+m', () => this.goToMarketplace());

        document.addEventListener('keydown', (e) => {
            // Don't intercept when typing in inputs
            if (e.target.matches('input, textarea, select')) return;

            const key = e.key.toLowerCase();
            const combo = e.ctrlKey ? `ctrl+${key}` : e.altKey ? `alt+${key}` : key;
            
            if (this.shortcuts.has(combo)) {
                e.preventDefault();
                this.shortcuts.get(combo)();
            }
        });
    }

    showKeyboardHelp() {
        const helpText = `
Keyboard Shortcuts:
- H or ?: Show this help
- /: Focus search
- Tab: Navigate interactive elements
- Arrow keys: Navigate game grids
- Escape: Close dialogs or clear selections
- G+H: Go to home page
- G+G: Go to games
- G+M: Go to marketplace

Game Controls:
- Arrow keys: Move in 2048
- Tab/Arrow keys: Navigate pieces in Backgammon
- Number keys: Enter values in Sudoku
- Space/Enter: Select cards in Memory games
        `;
        
        this.announce(helpText, true);
        console.log(helpText);
    }

    focusSearch() {
        const searchInput = document.querySelector('#product-search, .search-input, input[type="search"]');
        if (searchInput) {
            searchInput.focus();
            this.announce('Search focused');
        }
    }

    goToHome() {
        window.location.href = '/';
    }

    goToGames() {
        window.location.href = '/games/';
    }

    goToMarketplace() {
        window.location.href = '/marketplace.html';
    }

    handleUserPreferences() {
        // Respect user's motion preferences
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.options.reducedMotion = true;
            document.documentElement.style.setProperty('--animation-duration', '0s');
        }

        // Respect user's contrast preferences
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            this.options.highContrastMode = true;
            document.body.classList.add('high-contrast');
        }

        // Listen for preference changes
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            this.options.reducedMotion = e.matches;
            document.documentElement.style.setProperty('--animation-duration', e.matches ? '0s' : '');
        });
    }

    // Public methods for game integration
    announceGameEvent(event, details = '') {
        if (this.options.announceGameEvents) {
            this.announce(`${event}${details ? ': ' + details : ''}`);
        }
    }

    announceScore(score, label = 'Score') {
        if (this.options.announceScore) {
            this.announce(`${label}: ${score}`);
        }
    }

    focusElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.focus();
            return true;
        }
        return false;
    }
}

// Add required CSS for screen reader and accessibility features
const accessibilityCSS = `
/* Screen reader only content */
.sr-only, .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* Skip links */
.skip-links {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
}

.skip-link {
    position: absolute;
    top: -40px;
    left: 6px;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    border-radius: 0 0 6px 6px;
    transition: top 0.3s;
}

.skip-link:focus {
    top: 0;
}

/* Enhanced focus indicators */
:focus {
    outline: 2px solid #91D9F8;
    outline-offset: 2px;
    border-radius: 2px;
}

button:focus, .btn:focus {
    box-shadow: 0 0 0 3px rgba(145, 217, 248, 0.5);
}

/* High contrast mode */
.high-contrast {
    filter: contrast(150%);
}

.high-contrast button,
.high-contrast .btn {
    border: 2px solid currentColor;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}

/* Grid navigation indicators */
.grid-cell:focus::after,
.cell:focus::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border: 3px solid #91D9F8;
    border-radius: 4px;
    pointer-events: none;
}

/* Modal focus trapping */
.modal.active,
.dialog[open] {
    isolation: isolate;
}

/* Touch target enhancement for accessibility */
@media (pointer: coarse) {
    button, .btn, a, input[type="button"], input[type="submit"] {
        min-height: 44px;
        min-width: 44px;
    }
}
`;

// Add CSS to document
const style = document.createElement('style');
style.textContent = accessibilityCSS;
document.head.appendChild(style);

// Auto-initialize accessibility enhancements
window.addEventListener('DOMContentLoaded', () => {
    window.accessibilityEnhancer = new AccessibilityEnhancer();
    
    // Make it globally available for games to use
    window.announceGameEvent = (event, details) => {
        window.accessibilityEnhancer.announceGameEvent(event, details);
    };
    
    window.announceScore = (score, label) => {
        window.accessibilityEnhancer.announceScore(score, label);
    };
});
// Search Functionality for Jerusalem Hills
(function() {
    'use strict';

    // Search configuration
    const SEARCH_CONFIG = {
        minSearchLength: 2,
        maxResults: 20,
        debounceDelay: 300,
        searchablePages: [
            { url: '/', title: 'Home', description: 'Jerusalem Hills homepage', keywords: ['home', 'main', 'jerusalem', 'hills'] },
            { url: '/about.html', title: 'About Us', description: 'Learn about Jerusalem Hills', keywords: ['about', 'information', 'history', 'mission'] },
            { url: '/contact.html', title: 'Contact', description: 'Get in touch with us', keywords: ['contact', 'email', 'support', 'help'] },
            { url: '/marketplace.html', title: 'Marketplace', description: 'Jerusalem marketplace for authentic products', keywords: ['market', 'shop', 'products', 'buy', 'sell', 'stripe', 'checkout'] },
            { url: '/games/', title: 'Games', description: 'Play online games', keywords: ['games', 'play', 'backgammon', 'chess', 'tetris', 'snake', '2048', 'trivia'] },
            { url: '/services-directory.html', title: 'Services', description: 'Local services directory', keywords: ['services', 'directory', 'local', 'utilities', 'emergency'] },
            { url: '/privacy-policy.html', title: 'Privacy Policy', description: 'Our privacy policy', keywords: ['privacy', 'policy', 'data', 'cookies'] },
            { url: '/terms-of-service.html', title: 'Terms of Service', description: 'Terms and conditions', keywords: ['terms', 'service', 'conditions', 'legal'] },
            { url: '/sidur.html', title: 'Siddur', description: 'Online prayer book', keywords: ['siddur', 'prayer', 'jewish', 'hebrew', 'תפילה'] },
            
            // Games
            { url: '/games/backgammon/backgammon.html', title: 'Backgammon', description: 'Play Backgammon online', keywords: ['backgammon', 'board game', 'strategy', 'classic'] },
            { url: '/games/tetris/', title: 'Tetris', description: 'Classic Tetris game', keywords: ['tetris', 'puzzle', 'blocks', 'classic'] },
            { url: '/games/snake/', title: 'Snake', description: 'Classic Snake game', keywords: ['snake', 'arcade', 'classic'] },
            { url: '/games/permutations/permutations.html', title: 'צירופים', description: 'Hebrew word game', keywords: ['hebrew', 'words', 'permutations', 'צירופים', 'cultural'] },
            { url: '/games/2048/2048.html', title: '2048', description: 'Classic addictive puzzle game', keywords: ['2048', 'puzzle', 'numbers', 'tiles', 'brain training'] },
            { url: '/games/trivia/trivia.html', title: 'Jerusalem Heritage Quiz', description: 'Test your knowledge of Jerusalem history and culture', keywords: ['trivia', 'quiz', 'jerusalem', 'heritage', 'history', 'culture', 'educational'] },
            { url: '/games/bcodes/bcodes.html', title: 'קודי תורה', description: 'Search for Torah Codes (ELS)', keywords: ['torah codes', 'bible codes', 'els', 'hebrew', 'religious', 'קודי תורה'] },
            
            // Kids Zone
            { url: '/kids/', title: 'Kids Zone', description: 'Safe educational games for children ages 5-12', keywords: ['kids', 'children', 'educational', 'safe', 'family', 'coppa', 'games'] },
            { url: '/kids/games/math.html', title: 'Math Quest', description: 'Addition practice game for kids', keywords: ['math', 'addition', 'kids', 'educational', 'arithmetic', 'practice'] },
            { url: '/kids/games/subtraction.html', title: 'Subtraction Quest', description: 'Subtraction practice game for kids', keywords: ['subtraction', 'math', 'kids', 'educational', 'arithmetic', 'practice'] },
            { url: '/kids/games/multiplication.html', title: 'Multiplication Master', description: 'Times tables practice game for kids', keywords: ['multiplication', 'times tables', 'math', 'kids', 'educational', 'arithmetic'] },
            { url: '/kids/games/words.html', title: 'Word Builder', description: 'Word building game for kids', keywords: ['words', 'spelling', 'kids', 'educational', 'vocabulary'] },
            { url: '/kids/games/memory.html', title: 'Memory Match', description: 'Memory matching game for kids', keywords: ['memory', 'matching', 'kids', 'educational', 'brain training'] },
            
            // Forum
            { url: '/forum/', title: 'Community Forum', description: 'Jerusalem Hills community discussions', keywords: ['forum', 'community', 'discussion', 'chat'] },
            { url: '/forum/forum.html', title: 'Forum', description: 'Community discussions and support', keywords: ['forum', 'community', 'discussion', 'support'] }
        ]
    };

    // Search Manager
    const SearchManager = {
        searchInput: null,
        searchResults: null,
        searchOverlay: null,
        debounceTimer: null,
        initialized: false,

        // Initialize search functionality
        init: function() {
            if (this.initialized) return;

            // Find search input
            this.searchInput = document.querySelector('.search-input');
            if (!this.searchInput) return;

            // Create search UI components
            this.createSearchUI();

            // Add event listeners
            this.addEventListeners();

            // Load search index from localStorage if available
            this.loadSearchIndex();

            this.initialized = true;
        },

        // Create search UI components
        createSearchUI: function() {
            // Create search results dropdown
            const searchContainer = this.searchInput.closest('.search-container');
            if (!searchContainer) return;

            // Create results container
            const resultsDiv = document.createElement('div');
            resultsDiv.className = 'search-results';
            resultsDiv.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                margin-top: 5px;
                max-height: 400px;
                overflow-y: auto;
                display: none;
                z-index: 1000;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            `;
            searchContainer.appendChild(resultsDiv);
            this.searchResults = resultsDiv;

            // Create overlay for mobile
            const overlay = document.createElement('div');
            overlay.className = 'search-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: none;
                z-index: 999;
            `;
            document.body.appendChild(overlay);
            this.searchOverlay = overlay;
        },

        // Add event listeners
        addEventListeners: function() {
            // Search input events
            this.searchInput.addEventListener('input', this.handleSearch.bind(this));
            this.searchInput.addEventListener('focus', this.handleFocus.bind(this));
            this.searchInput.addEventListener('blur', this.handleBlur.bind(this));

            // Keyboard navigation
            this.searchInput.addEventListener('keydown', this.handleKeydown.bind(this));

            // Click outside to close
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-container')) {
                    this.hideResults();
                }
            });

            // Overlay click to close
            if (this.searchOverlay) {
                this.searchOverlay.addEventListener('click', () => {
                    this.hideResults();
                });
            }
        },

        // Handle search input
        handleSearch: function(e) {
            const query = e.target.value.trim();

            // Clear previous timer
            clearTimeout(this.debounceTimer);

            // Debounce search
            this.debounceTimer = setTimeout(() => {
                if (query.length >= SEARCH_CONFIG.minSearchLength) {
                    this.performSearch(query);
                } else {
                    this.hideResults();
                }
            }, SEARCH_CONFIG.debounceDelay);
        },

        // Perform search
        performSearch: function(query) {
            const results = this.searchPages(query);
            this.displayResults(results, query);
        },

        // Search through pages
        searchPages: function(query) {
            const searchTerms = query.toLowerCase().split(' ');
            const results = [];

            SEARCH_CONFIG.searchablePages.forEach(page => {
                let score = 0;

                // Check title
                searchTerms.forEach(term => {
                    if (page.title.toLowerCase().includes(term)) {
                        score += 10;
                    }
                });

                // Check description
                searchTerms.forEach(term => {
                    if (page.description.toLowerCase().includes(term)) {
                        score += 5;
                    }
                });

                // Check keywords
                searchTerms.forEach(term => {
                    page.keywords.forEach(keyword => {
                        if (keyword.toLowerCase().includes(term)) {
                            score += 3;
                        }
                    });
                });

                if (score > 0) {
                    results.push({ ...page, score });
                }
            });

            // Sort by score
            results.sort((a, b) => b.score - a.score);

            // Return top results
            return results.slice(0, SEARCH_CONFIG.maxResults);
        },

        // Display search results
        displayResults: function(results, query) {
            if (!this.searchResults) return;

            if (results.length === 0) {
                this.searchResults.innerHTML = `
                    <div style="padding: 20px; text-align: center; color: #6b7280;">
                        No results found for "${this.escapeHtml(query)}"
                    </div>
                `;
            } else {
                const resultsHTML = results.map((result, index) => `
                    <a href="${result.url}" class="search-result-item" data-index="${index}" style="
                        display: block;
                        padding: 12px 15px;
                        text-decoration: none;
                        border-bottom: 1px solid #f3f4f6;
                        transition: background 0.2s;
                    " onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
                        <div style="font-weight: 500; color: #1f2937; margin-bottom: 3px;">
                            ${this.highlightText(result.title, query)}
                        </div>
                        <div style="font-size: 14px; color: #6b7280;">
                            ${this.highlightText(result.description, query)}
                        </div>
                    </a>
                `).join('');

                this.searchResults.innerHTML = resultsHTML;
            }

            this.showResults();
        },

        // Highlight search terms in text
        highlightText: function(text, query) {
            const terms = query.split(' ').filter(t => t.length > 0);
            let highlighted = text;

            terms.forEach(term => {
                const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
                highlighted = highlighted.replace(regex, '<mark style="background: #fef3c7; padding: 2px;">$1</mark>');
            });

            return highlighted;
        },

        // Show search results
        showResults: function() {
            if (this.searchResults) {
                this.searchResults.style.display = 'block';
            }
            if (window.innerWidth < 768 && this.searchOverlay) {
                this.searchOverlay.style.display = 'block';
            }
        },

        // Hide search results
        hideResults: function() {
            if (this.searchResults) {
                this.searchResults.style.display = 'none';
            }
            if (this.searchOverlay) {
                this.searchOverlay.style.display = 'none';
            }
        },

        // Handle focus event
        handleFocus: function() {
            if (this.searchInput.value.length >= SEARCH_CONFIG.minSearchLength) {
                this.performSearch(this.searchInput.value);
            }
        },

        // Handle blur event
        handleBlur: function() {
            // Delay hiding to allow click on results
            setTimeout(() => {
                this.hideResults();
            }, 200);
        },

        // Handle keyboard navigation
        handleKeydown: function(e) {
            const results = this.searchResults?.querySelectorAll('.search-result-item');
            if (!results || results.length === 0) return;

            let currentIndex = -1;
            results.forEach((result, index) => {
                if (result.classList.contains('selected')) {
                    currentIndex = index;
                }
            });

            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    currentIndex = (currentIndex + 1) % results.length;
                    this.selectResult(results, currentIndex);
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    currentIndex = currentIndex <= 0 ? results.length - 1 : currentIndex - 1;
                    this.selectResult(results, currentIndex);
                    break;

                case 'Enter':
                    e.preventDefault();
                    if (currentIndex >= 0) {
                        results[currentIndex].click();
                    }
                    break;

                case 'Escape':
                    this.hideResults();
                    this.searchInput.blur();
                    break;
            }
        },

        // Select a search result
        selectResult: function(results, index) {
            results.forEach((result, i) => {
                if (i === index) {
                    result.classList.add('selected');
                    result.style.background = '#f3f4f6';
                } else {
                    result.classList.remove('selected');
                    result.style.background = 'white';
                }
            });
        },

        // Load search index (for future enhancement)
        loadSearchIndex: function() {
            // In the future, this could load a more comprehensive search index
            // from an API or pre-generated JSON file
        },

        // Utility: Escape HTML
        escapeHtml: function(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        // Utility: Escape regex
        escapeRegex: function(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
    };

    // Quick search function for programmatic use
    window.quickSearch = function(query) {
        const results = SearchManager.searchPages(query);
        return results;
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            SearchManager.init();
        });
    } else {
        SearchManager.init();
    }

    // Expose to global scope
    window.SearchManager = SearchManager;
})();
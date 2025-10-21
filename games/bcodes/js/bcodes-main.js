/**
 * Torah Codes Main Application Controller
 * Handles UI interactions, search orchestration, and result display
 */

class TorahCodesApp {
    constructor() {
        this.engine = new ELSEngine();
        this.visualizer = null;
        this.currentResults = null;
        this.isSearching = false;
        
        // UI elements
        this.elements = {
            searchTerm: document.getElementById('search-term'),
            maxSkip: document.getElementById('max-skip'),
            textSource: document.getElementById('text-source'),
            searchBtn: document.getElementById('search-btn'),
            progressContainer: document.getElementById('progress-container'),
            progressFill: document.getElementById('progress-fill'),
            progressText: document.getElementById('progress-text'),
            resultsSection: document.getElementById('results-section'),
            searchSummary: document.getElementById('search-summary'),
            resultsList: document.getElementById('results-list'),
            matrixCanvas: document.getElementById('matrix-canvas'),
            zoomIn: document.getElementById('zoom-in'),
            zoomOut: document.getElementById('zoom-out'),
            resetView: document.getElementById('reset-view'),
            hebrewKeyboard: document.getElementById('hebrew-keyboard'),
            closeKeyboard: document.getElementById('close-keyboard')
        };

        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.setupEventListeners();
        this.setupVisualizer();
        this.setupHebrewKeyboard();
        this.loadSampleText();
        
        // Show welcome message
        this.showMessage('ברוכים הבאים לחיפוש קודי תורה', 'success');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search button
        this.elements.searchBtn.addEventListener('click', () => this.performSearch());
        
        // Enter key in search input
        this.elements.searchTerm.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.performSearch();
            }
        });

        // Visualization controls
        this.elements.zoomIn.addEventListener('click', () => {
            if (this.visualizer) this.visualizer.zoomIn();
        });

        this.elements.zoomOut.addEventListener('click', () => {
            if (this.visualizer) this.visualizer.zoomOut();
        });

        this.elements.resetView.addEventListener('click', () => {
            if (this.visualizer) this.visualizer.resetView();
        });

        // Hebrew keyboard
        this.elements.searchTerm.addEventListener('focus', () => {
            this.showHebrewKeyboard();
        });

        this.elements.closeKeyboard.addEventListener('click', () => {
            this.hideHebrewKeyboard();
        });

        // Text source change
        this.elements.textSource.addEventListener('change', () => {
            this.loadSelectedText();
        });

        // Window events
        window.addEventListener('beforeunload', () => {
            if (this.isSearching) {
                this.engine.cancelSearch();
            }
        });
    }

    /**
     * Setup the visualizer
     */
    setupVisualizer() {
        if (this.elements.matrixCanvas) {
            this.visualizer = new ELSVisualizer(this.elements.matrixCanvas);
        }
    }

    /**
     * Setup Hebrew keyboard functionality
     */
    setupHebrewKeyboard() {
        const keyboardKeys = this.elements.hebrewKeyboard.querySelectorAll('.key');
        
        keyboardKeys.forEach(key => {
            key.addEventListener('click', () => {
                const keyText = key.textContent;
                
                if (keyText === '⌫') {
                    // Backspace
                    const currentValue = this.elements.searchTerm.value;
                    this.elements.searchTerm.value = currentValue.slice(0, -1);
                } else if (keyText === 'רווח') {
                    // Space
                    this.elements.searchTerm.value += ' ';
                } else {
                    // Regular Hebrew letter
                    this.elements.searchTerm.value += keyText;
                }
                
                this.elements.searchTerm.focus();
            });
        });
    }

    /**
     * Show Hebrew keyboard
     */
    showHebrewKeyboard() {
        this.elements.hebrewKeyboard.style.display = 'block';
    }

    /**
     * Hide Hebrew keyboard
     */
    hideHebrewKeyboard() {
        this.elements.hebrewKeyboard.style.display = 'none';
    }

    /**
     * Load sample text for demo
     */
    async loadSampleText() {
        try {
            this.showMessage('טוען טקסט התחלתי...', 'info');
            
            // Use the Torah data loader to get Genesis
            const dataLoader = new TorahDataLoader();
            const bookData = await dataLoader.loadBook('genesis', 'leningrad');
            
            if (this.visualizer) {
                this.visualizer.setText(bookData.fullText);
            }
            
            this.showMessage(`נטען: ${bookData.title} (${bookData.statistics.totalLetters} אותיות)`, 'success');
            
        } catch (error) {
            console.error('Error loading text from repository:', error);
            this.showMessage('שגיאה בטעינה מהמאגר, משתמש בטקסט לדוגמה', 'warning');
            
            // Fall back to built-in sample
            const sampleText = HebrewUtils.getSampleText();
            if (this.visualizer) {
                this.visualizer.setText(sampleText);
            }
        }
    }

    /**
     * Load selected text source
     */
    async loadSelectedText() {
        const textSource = this.elements.textSource.value;
        
        try {
            this.showMessage('טוען טקסט...', 'info');
            
            const dataLoader = new TorahDataLoader();
            let bookData;
            
            if (textSource === 'torah') {
                bookData = await dataLoader.loadCompleteTorah('leningrad');
            } else {
                bookData = await dataLoader.loadBook(textSource, 'leningrad');
            }
            
            if (this.visualizer) {
                this.visualizer.setText(bookData.fullText);
            }
            
            const title = bookData.title || bookData.englishTitle;
            const stats = bookData.statistics;
            this.showMessage(`נטען: ${title} (${stats.totalLetters} אותיות, ${stats.totalWords} מילים)`, 'success');
            
        } catch (error) {
            console.error('Error loading text from repository:', error);
            this.showMessage('שגיאה בטעינת הטקסט מהמאגר, משתמש בטקסט לדוגמה', 'warning');
            
            // Fall back to sample text
            const sampleText = HebrewUtils.getSampleText();
            if (this.visualizer) {
                this.visualizer.setText(sampleText);
            }
        }
    }

    /**
     * Perform ELS search
     */
    async performSearch() {
        if (this.isSearching) {
            this.engine.cancelSearch();
            this.resetSearchUI();
            return;
        }

        const searchTerm = this.elements.searchTerm.value.trim();
        const maxSkip = parseInt(this.elements.maxSkip.value) || 100;
        const textSource = this.elements.textSource.value;

        // Validate input
        const validation = HebrewUtils.validateSearchTerm(searchTerm);
        if (!validation.isValid) {
            this.showMessage(validation.message, 'error');
            return;
        }

        this.startSearch();

        try {
            const options = {
                maxSkipDistance: maxSkip,
                minSkipDistance: 1,
                searchForward: true,
                searchBackward: false,
                maxResults: 100,
                progressCallback: (progress) => this.updateProgress(progress)
            };

            this.currentResults = await this.engine.searchELS(searchTerm, textSource, options);
            this.displayResults();
            
        } catch (error) {
            console.error('Search error:', error);
            this.showMessage(`שגיאה בחיפוש: ${error.message}`, 'error');
        } finally {
            this.finishSearch();
        }
    }

    /**
     * Start search UI state
     */
    startSearch() {
        this.isSearching = true;
        this.elements.searchBtn.textContent = 'בטל חיפוש';
        this.elements.searchBtn.classList.add('loading');
        this.elements.progressContainer.style.display = 'block';
        this.elements.resultsSection.style.display = 'none';
        this.hideHebrewKeyboard();
    }

    /**
     * Update search progress
     * @param {Object} progress - Progress information
     */
    updateProgress(progress) {
        const percentage = Math.round(progress.progress);
        this.elements.progressFill.style.width = `${percentage}%`;
        this.elements.progressText.textContent = `${percentage}%`;
        
        if (progress.elapsedTime) {
            const seconds = Math.round(progress.elapsedTime / 1000);
            this.elements.progressText.textContent += ` (${seconds}s)`;
        }
    }

    /**
     * Finish search UI state
     */
    finishSearch() {
        this.isSearching = false;
        this.elements.searchBtn.textContent = 'חפש';
        this.elements.searchBtn.classList.remove('loading');
        this.elements.progressContainer.style.display = 'none';
    }

    /**
     * Reset search UI
     */
    resetSearchUI() {
        this.finishSearch();
        this.elements.resultsSection.style.display = 'none';
    }

    /**
     * Display search results
     */
    displayResults() {
        if (!this.currentResults) return;

        const stats = this.currentResults.getStatistics();
        
        // Show results section
        this.elements.resultsSection.style.display = 'block';
        
        // Display summary
        this.displaySearchSummary(stats);
        
        // Display results list
        this.displayResultsList();
        
        // Update visualization
        this.updateVisualization();
        
        // Success message
        const message = stats.count > 0 
            ? `נמצאו ${stats.count} תוצאות`
            : 'לא נמצאו תוצאות';
        this.showMessage(message, stats.count > 0 ? 'success' : 'warning');
    }

    /**
     * Display search summary
     * @param {Object} stats - Search statistics
     */
    displaySearchSummary(stats) {
        const summaryHTML = `
            <div class="summary-item">
                <strong>מונח חיפוש:</strong> ${stats.searchTerm}
            </div>
            <div class="summary-item">
                <strong>מקור טקסט:</strong> ${stats.textSource}
            </div>
            <div class="summary-item">
                <strong>תוצאות:</strong> ${stats.count}
            </div>
            <div class="summary-item">
                <strong>זמן חיפוש:</strong> ${Math.round(stats.searchTime / 1000)} שניות
            </div>
            ${stats.count > 0 ? `
                <div class="summary-item">
                    <strong>מרחק מינימלי:</strong> ${stats.skipDistance.min}
                </div>
                <div class="summary-item">
                    <strong>מרחק מקסימלי:</strong> ${stats.skipDistance.max}
                </div>
                <div class="summary-item">
                    <strong>גימטריה:</strong> ${Gematria.calculateStandard(stats.searchTerm)}
                </div>
            ` : ''}
        `;
        
        this.elements.searchSummary.innerHTML = summaryHTML;
    }

    /**
     * Display results list
     */
    displayResultsList() {
        if (!this.currentResults || this.currentResults.results.length === 0) {
            this.elements.resultsList.innerHTML = '<p>לא נמצאו תוצאות</p>';
            return;
        }

        const topResults = this.currentResults.getTopResults(20);
        const resultsHTML = topResults.map((result, index) => {
            const display = result.formatForDisplay();
            return `
                <div class="result-item" data-result-index="${index}">
                    <div class="result-header">
                        <span class="result-term">${display.term}</span>
                        <span class="result-skip">מרחק: ${display.skipDistance}</span>
                    </div>
                    <div class="result-positions">
                        מיקומים: ${display.positionsText}
                    </div>
                    <div class="gematria-value">
                        גימטריה: ${display.gematria}
                    </div>
                    <div class="result-details">
                        טווח: ${display.startPosition} - ${display.endPosition} 
                        (${display.totalSpan} תווים)
                    </div>
                </div>
            `;
        }).join('');

        this.elements.resultsList.innerHTML = resultsHTML;

        // Add click handlers for result items
        this.elements.resultsList.querySelectorAll('.result-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.highlightResult(topResults[index]);
            });
        });
    }

    /**
     * Update visualization with results
     */
    updateVisualization() {
        if (this.visualizer && this.currentResults) {
            this.visualizer.setResults(this.currentResults.results);
        }
    }

    /**
     * Highlight specific result
     * @param {ELSResult} result - Result to highlight
     */
    highlightResult(result) {
        if (this.visualizer) {
            this.visualizer.highlightResult(result);
            
            // Animate to first position
            const positions = result.getPositions();
            if (positions.length > 0) {
                this.visualizer.animateToPosition(positions[0]);
            }
        }

        // Update UI to show selected result
        this.elements.resultsList.querySelectorAll('.result-item').forEach(item => {
            item.classList.remove('selected');
        });

        const selectedItem = this.elements.resultsList.querySelector(`[data-result-index]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
    }

    /**
     * Show message to user
     * @param {string} message - Message text
     * @param {string} type - Message type (success, error, warning, info)
     */
    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem;
            border-radius: 5px;
            z-index: 9999;
            max-width: 300px;
            font-family: 'Noto Sans Hebrew', Arial, sans-serif;
            direction: rtl;
        `;

        // Add to page
        document.body.appendChild(messageDiv);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    /**
     * Export results to JSON
     * @returns {string} - JSON string
     */
    exportResults() {
        if (!this.currentResults) {
            this.showMessage('אין תוצאות לייצוא', 'warning');
            return null;
        }

        const exportData = {
            searchTerm: this.currentResults.searchTerm,
            textSource: this.currentResults.textSource,
            timestamp: new Date().toISOString(),
            results: this.currentResults.toJSON(),
            statistics: this.currentResults.getStatistics()
        };

        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Download exported results
     */
    downloadResults() {
        const jsonData = this.exportResults();
        if (!jsonData) return;

        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `torah-codes-${this.currentResults.searchTerm}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        this.showMessage('התוצאות יוצאו בהצלחה', 'success');
    }

    /**
     * Get application statistics
     * @returns {Object} - App statistics
     */
    getAppStatistics() {
        return {
            currentSearch: this.currentResults ? {
                term: this.currentResults.searchTerm,
                resultCount: this.currentResults.results.length
            } : null,
            engine: this.engine.getCacheStats(),
            visualizer: this.visualizer ? this.visualizer.getStats() : null,
            isSearching: this.isSearching
        };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.torahCodesApp = new TorahCodesApp();
});

// Global utility functions
window.TorahCodes = {
    // Export utilities for debugging/advanced usage
    HebrewUtils,
    Gematria,
    ELSEngine,
    ELSVisualizer,
    
    // Quick access functions
    searchTerm: (term) => {
        if (window.torahCodesApp) {
            document.getElementById('search-term').value = term;
            window.torahCodesApp.performSearch();
        }
    },
    
    exportResults: () => {
        if (window.torahCodesApp) {
            return window.torahCodesApp.exportResults();
        }
    },
    
    getStats: () => {
        if (window.torahCodesApp) {
            return window.torahCodesApp.getAppStatistics();
        }
    }
};
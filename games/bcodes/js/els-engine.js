/**
 * ELS Search Engine for Torah Codes
 * Core algorithm implementation for finding Equidistant Letter Sequences
 */

class ELSEngine {
    constructor() {
        this.isSearching = false;
        this.currentSearch = null;
        this.worker = null;
        this.textCache = new Map();
        this.resultCache = new Map();
        this.maxCacheSize = 10; // Limit cache size
        this.dataLoader = new TorahDataLoader();
    }

    /**
     * Main search function for ELS patterns
     * @param {string} searchTerm - Hebrew search term
     * @param {string} textSource - Source text identifier
     * @param {Object} options - Search options
     * @returns {Promise<ELSResultSet>} - Search results
     */
    async searchELS(searchTerm, textSource, options = {}) {
        // Validate input
        const validation = HebrewUtils.validateSearchTerm(searchTerm);
        if (!validation.isValid) {
            throw new Error(validation.message);
        }

        // Create search context
        const context = new SearchContext(searchTerm, textSource, options);
        this.currentSearch = context;
        this.isSearching = true;

        try {
            // Check cache first
            const cacheKey = this.generateCacheKey(searchTerm, textSource, options);
            if (this.resultCache.has(cacheKey)) {
                this.isSearching = false;
                return this.resultCache.get(cacheKey);
            }

            // Load text data
            const text = await this.loadText(textSource);
            if (!text) {
                throw new Error(`לא ניתן לטעון את הטקסט: ${textSource}`);
            }

            // Perform search
            const resultSet = await this.performSearch(context, text);

            // Cache results
            this.cacheResult(cacheKey, resultSet);

            return resultSet;

        } catch (error) {
            throw error;
        } finally {
            this.isSearching = false;
            this.currentSearch = null;
        }
    }

    /**
     * Perform the actual ELS search
     * @param {SearchContext} context - Search context
     * @param {string} text - Text to search
     * @returns {Promise<ELSResultSet>} - Search results
     */
    async performSearch(context, text) {
        const resultSet = new ELSResultSet(context.searchTerm, context.textSource);
        const normalizedText = HebrewUtils.normalizeText(text);
        const textArray = HebrewUtils.textToLetterArray(normalizedText);
        const termArray = HebrewUtils.textToLetterArray(context.normalizedTerm);

        if (termArray.length === 0) {
            throw new Error('מונח החיפוש ריק');
        }

        // Calculate total search space
        const totalPositions = this.calculateTotalPositions(
            textArray.length, 
            termArray.length, 
            context.options
        );
        
        let searchedPositions = 0;
        const chunkSize = context.options.chunkSize;

        // Search forward
        if (context.options.searchForward) {
            for (let startPos = 0; startPos < textArray.length - termArray.length + 1; startPos += chunkSize) {
                if (context.shouldTerminate()) break;

                const endPos = Math.min(startPos + chunkSize, textArray.length - termArray.length + 1);
                const chunkResults = await this.searchChunk(
                    textArray, 
                    termArray, 
                    startPos, 
                    endPos, 
                    context.options, 
                    'forward'
                );

                chunkResults.forEach(result => resultSet.addResult(result));
                
                searchedPositions += endPos - startPos;
                context.updateProgress(searchedPositions, totalPositions);

                // Allow UI to update
                await this.sleep(1);
            }
        }

        // Search backward
        if (context.options.searchBackward) {
            const reversedText = [...textArray].reverse();
            const reversedTerm = [...termArray].reverse();

            for (let startPos = 0; startPos < reversedText.length - reversedTerm.length + 1; startPos += chunkSize) {
                if (context.shouldTerminate()) break;

                const endPos = Math.min(startPos + chunkSize, reversedText.length - reversedTerm.length + 1);
                const chunkResults = await this.searchChunk(
                    reversedText, 
                    reversedTerm, 
                    startPos, 
                    endPos, 
                    context.options, 
                    'backward'
                );

                // Convert positions back to forward direction
                const convertedResults = chunkResults.map(result => 
                    this.convertBackwardResult(result, textArray.length)
                );

                convertedResults.forEach(result => resultSet.addResult(result));
                
                searchedPositions += endPos - startPos;
                context.updateProgress(searchedPositions, totalPositions);

                await this.sleep(1);
            }
        }

        resultSet.completeSearch();
        resultSet.removeDuplicates();
        resultSet.sort();

        return resultSet;
    }

    /**
     * Search a chunk of text for ELS patterns
     * @param {string[]} textArray - Array of text letters
     * @param {string[]} termArray - Array of search term letters
     * @param {number} startPos - Start position
     * @param {number} endPos - End position
     * @param {Object} options - Search options
     * @param {string} direction - Search direction
     * @returns {ELSResult[]} - Found results
     */
    async searchChunk(textArray, termArray, startPos, endPos, options, direction) {
        const results = [];

        for (let pos = startPos; pos < endPos; pos++) {
            for (let skip = options.minSkipDistance; skip <= options.maxSkipDistance; skip++) {
                const match = this.checkELSMatch(textArray, termArray, pos, skip);
                
                if (match.isComplete) {
                    const result = new ELSResult(
                        termArray.join(''),
                        match.letterMatches,
                        skip,
                        pos,
                        direction
                    );

                    if (result.isValid) {
                        results.push(result);
                        
                        // Stop if we've found enough results
                        if (results.length >= options.maxResults) {
                            return results;
                        }
                    }
                }
            }
        }

        return results;
    }

    /**
     * Check if an ELS match exists at a specific position and skip distance
     * @param {string[]} textArray - Text array
     * @param {string[]} termArray - Term array
     * @param {number} startPos - Starting position
     * @param {number} skipDistance - Skip distance
     * @returns {Object} - Match result
     */
    checkELSMatch(textArray, termArray, startPos, skipDistance) {
        const letterMatches = [];
        let isComplete = true;

        for (let i = 0; i < termArray.length; i++) {
            const currentPos = startPos + (i * skipDistance);
            
            if (currentPos >= textArray.length) {
                isComplete = false;
                break;
            }

            const expectedLetter = termArray[i];
            const actualLetter = textArray[currentPos];

            if (expectedLetter === actualLetter) {
                letterMatches.push(new LetterMatch(
                    actualLetter,
                    currentPos,
                    currentPos, // For simplified implementation
                    null
                ));
            } else {
                isComplete = false;
                break;
            }
        }

        return {
            isComplete,
            letterMatches,
            startPosition: startPos,
            skipDistance: skipDistance,
            endPosition: startPos + ((termArray.length - 1) * skipDistance)
        };
    }

    /**
     * Convert backward search result to forward coordinates
     * @param {ELSResult} result - Backward search result
     * @param {number} textLength - Total text length
     * @returns {ELSResult} - Converted result
     */
    convertBackwardResult(result, textLength) {
        const convertedMatches = result.matches.map(match => 
            new LetterMatch(
                match.letter,
                textLength - 1 - match.position,
                textLength - 1 - match.textIndex,
                match.verseRef
            )
        ).reverse();

        return new ELSResult(
            result.searchTerm,
            convertedMatches,
            result.skipDistance,
            textLength - 1 - result.startPosition,
            'backward'
        );
    }

    /**
     * Calculate total number of positions to search
     * @param {number} textLength - Length of text
     * @param {number} termLength - Length of search term
     * @param {Object} options - Search options
     * @returns {number} - Total positions
     */
    calculateTotalPositions(textLength, termLength, options) {
        const maxStartPos = textLength - termLength + 1;
        const skipRange = options.maxSkipDistance - options.minSkipDistance + 1;
        let total = maxStartPos * skipRange;

        if (options.searchForward && options.searchBackward) {
            total *= 2;
        }

        return total;
    }

    /**
     * Load text data from source
     * @param {string} textSource - Text source identifier
     * @returns {Promise<string>} - Loaded text
     */
    async loadText(textSource) {
        // Check cache first
        if (this.textCache.has(textSource)) {
            return this.textCache.get(textSource);
        }

        try {
            let text;
            
            // Load from torahcodes_fork repository
            if (['genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy'].includes(textSource)) {
                const bookData = await this.dataLoader.loadBook(textSource, 'leningrad');
                text = bookData.fullText;
            } else if (textSource === 'torah') {
                const torahData = await this.dataLoader.loadCompleteTorah('leningrad');
                text = torahData.fullText;
            } else {
                // Fall back to sample text
                text = HebrewUtils.getSampleText();
            }

            // Cache the text
            this.cacheText(textSource, text);
            return text;

        } catch (error) {
            console.error('Error loading text from repository:', error);
            // Fall back to sample text
            const sampleText = HebrewUtils.getSampleText();
            this.cacheText(textSource, sampleText);
            return sampleText;
        }
    }

    /**
     * Load text from JSON file
     * @param {string} filePath - Path to JSON file
     * @returns {Promise<string>} - Text content
     */
    async loadTextFile(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.fullText || data.text || '';
        } catch (error) {
            console.error(`Error loading ${filePath}:`, error);
            throw error;
        }
    }

    /**
     * Cache text data
     * @param {string} source - Text source
     * @param {string} text - Text content
     */
    cacheText(source, text) {
        if (this.textCache.size >= this.maxCacheSize) {
            // Remove oldest entry
            const firstKey = this.textCache.keys().next().value;
            this.textCache.delete(firstKey);
        }
        this.textCache.set(source, text);
    }

    /**
     * Generate cache key for results
     * @param {string} searchTerm - Search term
     * @param {string} textSource - Text source
     * @param {Object} options - Search options
     * @returns {string} - Cache key
     */
    generateCacheKey(searchTerm, textSource, options) {
        const normalizedTerm = HebrewUtils.normalizeText(searchTerm);
        const optionsHash = JSON.stringify({
            maxSkip: options.maxSkipDistance,
            minSkip: options.minSkipDistance,
            forward: options.searchForward,
            backward: options.searchBackward
        });
        return `${normalizedTerm}_${textSource}_${btoa(optionsHash)}`;
    }

    /**
     * Cache search results
     * @param {string} cacheKey - Cache key
     * @param {ELSResultSet} resultSet - Results to cache
     */
    cacheResult(cacheKey, resultSet) {
        if (this.resultCache.size >= this.maxCacheSize) {
            const firstKey = this.resultCache.keys().next().value;
            this.resultCache.delete(firstKey);
        }
        this.resultCache.set(cacheKey, resultSet);
    }

    /**
     * Cancel current search
     */
    cancelSearch() {
        if (this.currentSearch) {
            this.currentSearch.cancel();
        }
        this.isSearching = false;
        
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }

    /**
     * Get search status
     * @returns {Object} - Current search status
     */
    getSearchStatus() {
        return {
            isSearching: this.isSearching,
            searchTerm: this.currentSearch ? this.currentSearch.searchTerm : null,
            progress: this.currentSearch ? this.currentSearch.progress : 0,
            elapsedTime: this.currentSearch ? Date.now() - this.currentSearch.startTime : 0
        };
    }

    /**
     * Clear all caches
     */
    clearCaches() {
        this.textCache.clear();
        this.resultCache.clear();
    }

    /**
     * Get cache statistics
     * @returns {Object} - Cache statistics
     */
    getCacheStats() {
        return {
            textCacheSize: this.textCache.size,
            resultCacheSize: this.resultCache.size,
            maxCacheSize: this.maxCacheSize,
            textSources: Array.from(this.textCache.keys()),
            cachedSearches: Array.from(this.resultCache.keys())
        };
    }

    /**
     * Sleep for specified milliseconds (for yielding control)
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise} - Sleep promise
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Search for multiple terms simultaneously
     * @param {string[]} searchTerms - Array of search terms
     * @param {string} textSource - Text source
     * @param {Object} options - Search options
     * @returns {Promise<Map<string, ELSResultSet>>} - Results for each term
     */
    async searchMultipleTerms(searchTerms, textSource, options = {}) {
        const results = new Map();
        
        for (const term of searchTerms) {
            try {
                const resultSet = await this.searchELS(term, textSource, options);
                results.set(term, resultSet);
            } catch (error) {
                console.error(`Error searching for term "${term}":`, error);
                results.set(term, new ELSResultSet(term, textSource));
            }
        }
        
        return results;
    }

    /**
     * Find ELS patterns that intersect
     * @param {ELSResultSet} resultSet1 - First result set
     * @param {ELSResultSet} resultSet2 - Second result set
     * @returns {Array} - Intersecting patterns
     */
    findIntersections(resultSet1, resultSet2) {
        const intersections = [];
        
        for (const result1 of resultSet1.results) {
            for (const result2 of resultSet2.results) {
                const intersection = this.checkResultIntersection(result1, result2);
                if (intersection.hasIntersection) {
                    intersections.push({
                        result1: result1,
                        result2: result2,
                        intersectionPoints: intersection.points,
                        intersectionType: intersection.type
                    });
                }
            }
        }
        
        return intersections;
    }

    /**
     * Check if two ELS results intersect
     * @param {ELSResult} result1 - First result
     * @param {ELSResult} result2 - Second result
     * @returns {Object} - Intersection information
     */
    checkResultIntersection(result1, result2) {
        const positions1 = new Set(result1.getPositions());
        const positions2 = new Set(result2.getPositions());
        const intersectionPoints = [];

        for (const pos of positions1) {
            if (positions2.has(pos)) {
                intersectionPoints.push(pos);
            }
        }

        return {
            hasIntersection: intersectionPoints.length > 0,
            points: intersectionPoints,
            type: intersectionPoints.length === 1 ? 'single' : 'multiple'
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ELSEngine;
}
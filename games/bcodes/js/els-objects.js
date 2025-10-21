/**
 * ELS Data Structures and Objects for Torah Codes
 * Defines classes for managing search results, letter matches, and search contexts
 */

/**
 * Represents a single letter match in an ELS sequence
 */
class LetterMatch {
    constructor(letter, position, textIndex, verseRef = null) {
        this.letter = letter;           // Hebrew letter
        this.position = position;       // Position in normalized text
        this.textIndex = textIndex;     // Original text index (with spaces/punctuation)
        this.verseRef = verseRef;       // Verse reference (book:chapter:verse)
        this.timestamp = Date.now();
    }

    /**
     * Get display representation of the match
     * @returns {string} - Formatted match info
     */
    toString() {
        return `${this.letter} @ ${this.position}`;
    }

    /**
     * Get detailed information about the match
     * @returns {Object} - Detailed match information
     */
    getDetails() {
        return {
            letter: this.letter,
            hebrewValue: HebrewUtils.letterToNumber(this.letter),
            gematriaValue: Gematria.calculateStandard(this.letter),
            position: this.position,
            textIndex: this.textIndex,
            verseReference: this.verseRef,
            timestamp: this.timestamp
        };
    }
}

/**
 * Represents a complete ELS search result
 */
class ELSResult {
    constructor(searchTerm, matches, skipDistance, startPosition, direction = 'forward') {
        this.searchTerm = searchTerm;           // Original search term
        this.normalizedTerm = HebrewUtils.normalizeText(searchTerm);
        this.matches = matches;                 // Array of LetterMatch objects
        this.skipDistance = skipDistance;       // Skip distance used
        this.startPosition = startPosition;     // Starting position in text
        this.direction = direction;             // 'forward' or 'backward'
        this.endPosition = this.calculateEndPosition();
        this.totalSpan = this.endPosition - this.startPosition;
        this.gematriaValue = Gematria.calculateStandard(this.normalizedTerm);
        this.id = this.generateId();
        this.timestamp = Date.now();
        this.isValid = this.validateResult();
    }

    /**
     * Calculate the end position of the ELS sequence
     * @returns {number} - End position
     */
    calculateEndPosition() {
        if (this.matches.length === 0) return this.startPosition;
        return this.matches[this.matches.length - 1].position;
    }

    /**
     * Generate unique ID for this result
     * @returns {string} - Unique identifier
     */
    generateId() {
        const termHash = this.normalizedTerm.split('').reduce((hash, char) => {
            return hash + HebrewUtils.letterToNumber(char);
        }, 0);
        return `els_${termHash}_${this.startPosition}_${this.skipDistance}_${this.direction}`;
    }

    /**
     * Validate that the result is correctly formed
     * @returns {boolean} - True if valid
     */
    validateResult() {
        if (!this.matches || this.matches.length === 0) return false;
        if (this.matches.length !== this.normalizedTerm.length) return false;
        
        // Check that matches follow the expected pattern
        for (let i = 0; i < this.matches.length; i++) {
            const expectedLetter = this.normalizedTerm[i];
            const actualLetter = this.matches[i].letter;
            if (expectedLetter !== actualLetter) return false;
            
            // Check position pattern (except for first letter)
            if (i > 0) {
                const expectedPos = this.startPosition + (i * this.skipDistance);
                const actualPos = this.matches[i].position;
                if (expectedPos !== actualPos) return false;
            }
        }
        
        return true;
    }

    /**
     * Get all positions in the ELS sequence
     * @returns {number[]} - Array of positions
     */
    getPositions() {
        return this.matches.map(match => match.position);
    }

    /**
     * Get the complete word formed by the ELS sequence
     * @returns {string} - Hebrew word
     */
    getWord() {
        return this.matches.map(match => match.letter).join('');
    }

    /**
     * Calculate statistical measures for this result
     * @returns {Object} - Statistical analysis
     */
    getStatistics() {
        return {
            termLength: this.normalizedTerm.length,
            skipDistance: this.skipDistance,
            totalSpan: this.totalSpan,
            efficiency: this.normalizedTerm.length / this.totalSpan,
            density: this.skipDistance > 0 ? 1 / this.skipDistance : 0,
            gematriaValue: this.gematriaValue,
            gematriaAnalysis: Gematria.analyzeNumericalPatterns(this.gematriaValue)
        };
    }

    /**
     * Format result for display
     * @returns {Object} - Display-formatted result
     */
    formatForDisplay() {
        return {
            id: this.id,
            term: this.searchTerm,
            word: this.getWord(),
            positions: this.getPositions(),
            positionsText: HebrewUtils.formatPositions(this.getPositions()),
            skipDistance: this.skipDistance,
            startPosition: this.startPosition,
            endPosition: this.endPosition,
            totalSpan: this.totalSpan,
            direction: this.direction,
            gematria: this.gematriaValue,
            statistics: this.getStatistics(),
            isValid: this.isValid,
            timestamp: this.timestamp
        };
    }

    /**
     * Export result to JSON
     * @returns {Object} - JSON-serializable object
     */
    toJSON() {
        return {
            searchTerm: this.searchTerm,
            normalizedTerm: this.normalizedTerm,
            matches: this.matches.map(match => match.getDetails()),
            skipDistance: this.skipDistance,
            startPosition: this.startPosition,
            direction: this.direction,
            gematriaValue: this.gematriaValue,
            statistics: this.getStatistics(),
            id: this.id,
            timestamp: this.timestamp,
            isValid: this.isValid
        };
    }
}

/**
 * Manages a collection of ELS search results
 */
class ELSResultSet {
    constructor(searchTerm, textSource = null) {
        this.searchTerm = searchTerm;
        this.textSource = textSource;
        this.results = [];
        this.searchStartTime = Date.now();
        this.searchEndTime = null;
        this.maxResults = 1000; // Limit to prevent memory issues
        this.sortBy = 'skipDistance'; // Default sort criterion
        this.sortOrder = 'asc'; // 'asc' or 'desc'
    }

    /**
     * Add a result to the set
     * @param {ELSResult} result - ELS result to add
     */
    addResult(result) {
        if (this.results.length >= this.maxResults) {
            console.warn(`Maximum results limit (${this.maxResults}) reached`);
            return false;
        }
        
        if (result.isValid) {
            this.results.push(result);
            return true;
        }
        
        return false;
    }

    /**
     * Remove duplicate results
     */
    removeDuplicates() {
        const seen = new Set();
        this.results = this.results.filter(result => {
            const key = `${result.startPosition}_${result.skipDistance}_${result.direction}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    /**
     * Sort results by specified criteria
     * @param {string} criterion - Sort criterion
     * @param {string} order - Sort order ('asc' or 'desc')
     */
    sort(criterion = null, order = null) {
        const sortBy = criterion || this.sortBy;
        const sortOrder = order || this.sortOrder;

        this.results.sort((a, b) => {
            let valueA, valueB;

            switch (sortBy) {
                case 'skipDistance':
                    valueA = a.skipDistance;
                    valueB = b.skipDistance;
                    break;
                case 'startPosition':
                    valueA = a.startPosition;
                    valueB = b.startPosition;
                    break;
                case 'totalSpan':
                    valueA = a.totalSpan;
                    valueB = b.totalSpan;
                    break;
                case 'gematria':
                    valueA = a.gematriaValue;
                    valueB = b.gematriaValue;
                    break;
                case 'timestamp':
                    valueA = a.timestamp;
                    valueB = b.timestamp;
                    break;
                default:
                    valueA = a.skipDistance;
                    valueB = b.skipDistance;
            }

            const comparison = valueA - valueB;
            return sortOrder === 'desc' ? -comparison : comparison;
        });

        this.sortBy = sortBy;
        this.sortOrder = sortOrder;
    }

    /**
     * Filter results by criteria
     * @param {Object} criteria - Filter criteria
     * @returns {ELSResult[]} - Filtered results
     */
    filter(criteria) {
        return this.results.filter(result => {
            if (criteria.minSkip && result.skipDistance < criteria.minSkip) return false;
            if (criteria.maxSkip && result.skipDistance > criteria.maxSkip) return false;
            if (criteria.minSpan && result.totalSpan < criteria.minSpan) return false;
            if (criteria.maxSpan && result.totalSpan > criteria.maxSpan) return false;
            if (criteria.direction && result.direction !== criteria.direction) return false;
            if (criteria.minGematria && result.gematriaValue < criteria.minGematria) return false;
            if (criteria.maxGematria && result.gematriaValue > criteria.maxGematria) return false;
            return true;
        });
    }

    /**
     * Get statistical summary of all results
     * @returns {Object} - Statistical summary
     */
    getStatistics() {
        if (this.results.length === 0) {
            return {
                count: 0,
                searchTerm: this.searchTerm,
                textSource: this.textSource,
                searchTime: this.getSearchTime()
            };
        }

        const skipDistances = this.results.map(r => r.skipDistance);
        const totalSpans = this.results.map(r => r.totalSpan);
        const gematriaValues = this.results.map(r => r.gematriaValue);

        return {
            count: this.results.length,
            searchTerm: this.searchTerm,
            textSource: this.textSource,
            searchTime: this.getSearchTime(),
            skipDistance: {
                min: Math.min(...skipDistances),
                max: Math.max(...skipDistances),
                average: skipDistances.reduce((a, b) => a + b, 0) / skipDistances.length
            },
            totalSpan: {
                min: Math.min(...totalSpans),
                max: Math.max(...totalSpans),
                average: totalSpans.reduce((a, b) => a + b, 0) / totalSpans.length
            },
            gematria: {
                min: Math.min(...gematriaValues),
                max: Math.max(...gematriaValues),
                average: gematriaValues.reduce((a, b) => a + b, 0) / gematriaValues.length,
                unique: [...new Set(gematriaValues)].length
            },
            directionBreakdown: this.getDirectionBreakdown()
        };
    }

    /**
     * Get breakdown of results by direction
     * @returns {Object} - Direction statistics
     */
    getDirectionBreakdown() {
        const breakdown = { forward: 0, backward: 0 };
        this.results.forEach(result => {
            breakdown[result.direction]++;
        });
        return breakdown;
    }

    /**
     * Get search execution time
     * @returns {number} - Time in milliseconds
     */
    getSearchTime() {
        if (!this.searchEndTime) {
            return Date.now() - this.searchStartTime;
        }
        return this.searchEndTime - this.searchStartTime;
    }

    /**
     * Mark search as completed
     */
    completeSearch() {
        this.searchEndTime = Date.now();
    }

    /**
     * Get top results by criteria
     * @param {number} count - Number of results to return
     * @param {string} criterion - Sorting criterion
     * @returns {ELSResult[]} - Top results
     */
    getTopResults(count = 10, criterion = 'skipDistance') {
        const sortedResults = [...this.results];
        
        sortedResults.sort((a, b) => {
            switch (criterion) {
                case 'skipDistance':
                    return a.skipDistance - b.skipDistance;
                case 'totalSpan':
                    return a.totalSpan - b.totalSpan;
                case 'efficiency':
                    const effA = a.normalizedTerm.length / a.totalSpan;
                    const effB = b.normalizedTerm.length / b.totalSpan;
                    return effB - effA; // Higher efficiency first
                default:
                    return a.skipDistance - b.skipDistance;
            }
        });

        return sortedResults.slice(0, count);
    }

    /**
     * Export all results to JSON
     * @returns {Object} - Complete result set data
     */
    toJSON() {
        return {
            searchTerm: this.searchTerm,
            textSource: this.textSource,
            searchStartTime: this.searchStartTime,
            searchEndTime: this.searchEndTime,
            searchTime: this.getSearchTime(),
            resultCount: this.results.length,
            maxResults: this.maxResults,
            results: this.results.map(result => result.toJSON()),
            statistics: this.getStatistics(),
            sortBy: this.sortBy,
            sortOrder: this.sortOrder
        };
    }

    /**
     * Load results from JSON
     * @param {Object} data - JSON data
     * @returns {ELSResultSet} - Reconstructed result set
     */
    static fromJSON(data) {
        const resultSet = new ELSResultSet(data.searchTerm, data.textSource);
        resultSet.searchStartTime = data.searchStartTime;
        resultSet.searchEndTime = data.searchEndTime;
        resultSet.maxResults = data.maxResults;
        resultSet.sortBy = data.sortBy;
        resultSet.sortOrder = data.sortOrder;

        // Reconstruct results
        data.results.forEach(resultData => {
            const matches = resultData.matches.map(matchData => 
                new LetterMatch(
                    matchData.letter,
                    matchData.position,
                    matchData.textIndex,
                    matchData.verseReference
                )
            );

            const result = new ELSResult(
                resultData.searchTerm,
                matches,
                resultData.skipDistance,
                resultData.startPosition,
                resultData.direction
            );

            resultSet.addResult(result);
        });

        return resultSet;
    }
}

/**
 * Context object for search operations
 */
class SearchContext {
    constructor(searchTerm, textSource, options = {}) {
        this.searchTerm = searchTerm;
        this.normalizedTerm = HebrewUtils.normalizeText(searchTerm);
        this.textSource = textSource;
        
        // Search options with defaults
        this.options = {
            maxSkipDistance: options.maxSkipDistance || 1000,
            minSkipDistance: options.minSkipDistance || 1,
            searchForward: options.searchForward !== false,
            searchBackward: options.searchBackward || false,
            maxResults: options.maxResults || 1000,
            timeoutMs: options.timeoutMs || 60000,
            progressCallback: options.progressCallback || null,
            chunkSize: options.chunkSize || 1000
        };

        this.startTime = Date.now();
        this.isCancelled = false;
        this.progress = 0;
        this.currentPosition = 0;
        this.totalPositions = 0;
    }

    /**
     * Update search progress
     * @param {number} position - Current search position
     * @param {number} total - Total positions to search
     */
    updateProgress(position, total) {
        this.currentPosition = position;
        this.totalPositions = total;
        this.progress = total > 0 ? (position / total) * 100 : 0;

        if (this.options.progressCallback) {
            this.options.progressCallback({
                progress: this.progress,
                position: position,
                total: total,
                elapsedTime: Date.now() - this.startTime,
                searchTerm: this.searchTerm,
                isCancelled: this.isCancelled
            });
        }
    }

    /**
     * Cancel the search operation
     */
    cancel() {
        this.isCancelled = true;
    }

    /**
     * Check if search should be terminated
     * @returns {boolean} - True if search should stop
     */
    shouldTerminate() {
        const elapsedTime = Date.now() - this.startTime;
        return this.isCancelled || elapsedTime > this.options.timeoutMs;
    }

    /**
     * Get search configuration summary
     * @returns {Object} - Configuration summary
     */
    getSummary() {
        return {
            searchTerm: this.searchTerm,
            normalizedTerm: this.normalizedTerm,
            textSource: this.textSource,
            options: { ...this.options },
            progress: this.progress,
            elapsedTime: Date.now() - this.startTime,
            isCancelled: this.isCancelled
        };
    }
}

// Export classes for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LetterMatch, ELSResult, ELSResultSet, SearchContext };
}
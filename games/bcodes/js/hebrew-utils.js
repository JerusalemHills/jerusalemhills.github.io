/**
 * Hebrew Text Processing Utilities for Torah Codes
 * Handles Hebrew text normalization, validation, and processing
 */

class HebrewUtils {
    
    // Hebrew alphabet mapping for text processing
    static HEBREW_LETTERS = {
        'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9, 'י': 10,
        'כ': 11, 'ל': 12, 'מ': 13, 'נ': 14, 'ס': 15, 'ע': 16, 'פ': 17, 'צ': 18, 'ק': 19, 'ר': 20,
        'ש': 21, 'ת': 22,
        // Final forms
        'ך': 11, 'ם': 13, 'ן': 14, 'ף': 17, 'ץ': 18
    };

    // Hebrew vowel marks (nikkud) to be removed
    static HEBREW_VOWELS = [
        '\u05B0', '\u05B1', '\u05B2', '\u05B3', '\u05B4', '\u05B5', '\u05B6', '\u05B7',
        '\u05B8', '\u05B9', '\u05BA', '\u05BB', '\u05BC', '\u05BD', '\u05BE', '\u05BF',
        '\u05C0', '\u05C1', '\u05C2', '\u05C3', '\u05C4', '\u05C5', '\u05C6', '\u05C7'
    ];

    // Hebrew punctuation marks to be removed
    static HEBREW_PUNCTUATION = [
        '\u05BE', // Maqaf (Hebrew hyphen)
        '\u05C0', // Paseq
        '\u05C3', // Sof pasuq (end of verse)
        '\u05C6', // Nun hafukha
        ' ', '\t', '\n', '\r', // Whitespace
        '.', ',', ':', ';', '!', '?', '"', "'", // Latin punctuation
        '׃', '׀', '׆' // Hebrew punctuation
    ];

    /**
     * Normalize Hebrew text for ELS processing
     * Removes vowels, punctuation, and non-Hebrew characters
     * @param {string} text - Raw Hebrew text
     * @returns {string} - Normalized text with only Hebrew letters
     */
    static normalizeText(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        let normalized = text;

        // Remove vowel marks (nikkud)
        this.HEBREW_VOWELS.forEach(vowel => {
            normalized = normalized.replace(new RegExp(vowel, 'g'), '');
        });

        // Remove punctuation and spaces
        this.HEBREW_PUNCTUATION.forEach(punct => {
            normalized = normalized.replace(new RegExp('\\' + punct, 'g'), '');
        });

        // Keep only Hebrew letters
        normalized = normalized.replace(/[^\u05D0-\u05EA]/g, '');

        return normalized;
    }

    /**
     * Validate if text contains Hebrew characters
     * @param {string} text - Text to validate
     * @returns {boolean} - True if text contains Hebrew characters
     */
    static isHebrewText(text) {
        if (!text || typeof text !== 'string') {
            return false;
        }
        return /[\u05D0-\u05EA]/.test(text);
    }

    /**
     * Validate Hebrew search term
     * @param {string} term - Search term to validate
     * @returns {object} - Validation result with isValid boolean and message
     */
    static validateSearchTerm(term) {
        if (!term || typeof term !== 'string') {
            return { isValid: false, message: 'חובה להכניס מונח חיפוש' };
        }

        const trimmed = term.trim();
        if (trimmed.length === 0) {
            return { isValid: false, message: 'חובה להכניס מונח חיפוש' };
        }

        if (!this.isHebrewText(trimmed)) {
            return { isValid: false, message: 'המונח חייב להכיל אותיות עבריות בלבד' };
        }

        const normalized = this.normalizeText(trimmed);
        if (normalized.length < 2) {
            return { isValid: false, message: 'המונח חייב להכיל לפחות 2 אותיות עבריות' };
        }

        if (normalized.length > 20) {
            return { isValid: false, message: 'המונח לא יכול להכיל יותר מ-20 אותיות' };
        }

        return { isValid: true, message: 'המונח תקין', normalizedTerm: normalized };
    }

    /**
     * Convert Hebrew text to array of letters
     * @param {string} text - Hebrew text
     * @returns {string[]} - Array of Hebrew letters
     */
    static textToLetterArray(text) {
        const normalized = this.normalizeText(text);
        return Array.from(normalized);
    }

    /**
     * Convert Hebrew letter to its numerical value
     * @param {string} letter - Hebrew letter
     * @returns {number} - Numerical value (1-22)
     */
    static letterToNumber(letter) {
        return this.HEBREW_LETTERS[letter] || 0;
    }

    /**
     * Convert array of Hebrew letters to numerical array
     * @param {string[]} letters - Array of Hebrew letters
     * @returns {number[]} - Array of numerical values
     */
    static lettersToNumbers(letters) {
        return letters.map(letter => this.letterToNumber(letter));
    }

    /**
     * Format Hebrew text for display (right-to-left)
     * @param {string} text - Hebrew text
     * @returns {string} - Formatted text with proper direction
     */
    static formatForDisplay(text) {
        return `\u202E${text}\u202C`; // RTL override characters
    }

    /**
     * Create Hebrew letter frequency map for a text
     * @param {string} text - Hebrew text
     * @returns {Map} - Map of letter frequencies
     */
    static getLetterFrequency(text) {
        const letters = this.textToLetterArray(text);
        const frequency = new Map();

        letters.forEach(letter => {
            frequency.set(letter, (frequency.get(letter) || 0) + 1);
        });

        return frequency;
    }

    /**
     * Find all positions of a specific letter in text
     * @param {string} text - Hebrew text to search
     * @param {string} letter - Hebrew letter to find
     * @returns {number[]} - Array of positions where letter appears
     */
    static findLetterPositions(text, letter) {
        const letters = this.textToLetterArray(text);
        const positions = [];

        letters.forEach((currentLetter, index) => {
            if (currentLetter === letter) {
                positions.push(index);
            }
        });

        return positions;
    }

    /**
     * Check if a sequence of positions forms a valid ELS pattern
     * @param {number[]} positions - Array of letter positions
     * @returns {object} - Analysis of the sequence pattern
     */
    static analyzeSequencePattern(positions) {
        if (positions.length < 2) {
            return { isValid: false, skipDistance: 0, isRegular: false };
        }

        const differences = [];
        for (let i = 1; i < positions.length; i++) {
            differences.push(positions[i] - positions[i - 1]);
        }

        // Check if all differences are equal (regular ELS)
        const firstDiff = differences[0];
        const isRegular = differences.every(diff => diff === firstDiff);

        return {
            isValid: positions.length >= 2,
            skipDistance: firstDiff,
            isRegular: isRegular,
            differences: differences,
            totalSpan: positions[positions.length - 1] - positions[0]
        };
    }

    /**
     * Generate sample Hebrew text for testing
     * @returns {string} - Sample Hebrew text (beginning of Genesis)
     */
    static getSampleText() {
        return `בראשית ברא אלהים את השמים ואת הארץ והארץ היתה תהו ובהו וחשך על פני תהום ורוח אלהים מרחפת על פני המים ויאמר אלהים יהי אור ויהי אור וירא אלהים את האור כי טוב ויבדל אלהים בין האור ובין החשך ויקרא אלהים לאור יום ולחשך קרא לילה ויהי ערב ויהי בקר יום אחד ויאמר אלהים יהי רקיע בתוך המים ויהי מבדיל בין מים למים ויעש אלהים את הרקיע ויבדל בין המים אשר מתחת לרקיע ובין המים אשר מעל לרקיע ויהי כן ויקרא אלהים לרקיע שמים ויהי ערב ויהי בקר יום שני`;
    }

    /**
     * Format positions array for display
     * @param {number[]} positions - Array of positions
     * @returns {string} - Formatted position string
     */
    static formatPositions(positions) {
        if (!positions || positions.length === 0) {
            return 'אין תוצאות';
        }
        return positions.join(', ');
    }

    /**
     * Calculate text statistics
     * @param {string} text - Hebrew text
     * @returns {object} - Text statistics
     */
    static getTextStatistics(text) {
        const normalized = this.normalizeText(text);
        const letters = this.textToLetterArray(normalized);
        const frequency = this.getLetterFrequency(normalized);

        return {
            totalLetters: letters.length,
            uniqueLetters: frequency.size,
            letterFrequency: Object.fromEntries(frequency),
            averageWordLength: this.calculateAverageWordLength(text)
        };
    }

    /**
     * Calculate average word length in Hebrew text
     * @param {string} text - Hebrew text
     * @returns {number} - Average word length
     */
    static calculateAverageWordLength(text) {
        const words = text.split(/[\s\u05BE\u05C0\u05C3\u05C6]+/).filter(word => 
            this.normalizeText(word).length > 0
        );
        
        if (words.length === 0) return 0;
        
        const totalLength = words.reduce((sum, word) => 
            sum + this.normalizeText(word).length, 0
        );
        
        return Math.round((totalLength / words.length) * 100) / 100;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HebrewUtils;
}
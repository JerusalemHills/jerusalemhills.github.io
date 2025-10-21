/**
 * Gematria Calculation System for Torah Codes
 * Handles Hebrew letter-to-number conversions and various gematria systems
 */

class Gematria {
    
    // Standard Hebrew gematria values
    static STANDARD_VALUES = {
        'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
        'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90,
        'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400,
        // Final forms (sofit)
        'ך': 500, 'ם': 600, 'ן': 700, 'ף': 800, 'ץ': 900
    };

    // Alternative gematria system - Mispar Katan (reduced values)
    static MISPAR_KATAN_VALUES = {
        'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
        'י': 1, 'כ': 2, 'ל': 3, 'מ': 4, 'נ': 5, 'ס': 6, 'ע': 7, 'פ': 8, 'צ': 9,
        'ק': 1, 'ר': 2, 'ש': 3, 'ת': 4,
        'ך': 5, 'ם': 6, 'ן': 7, 'ף': 8, 'ץ': 9
    };

    // Ordinal values (position in alphabet)
    static ORDINAL_VALUES = {
        'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9, 'י': 10,
        'כ': 11, 'ל': 12, 'מ': 13, 'נ': 14, 'ס': 15, 'ע': 16, 'פ': 17, 'צ': 18, 'ק': 19, 'ר': 20,
        'ש': 21, 'ת': 22,
        // Final forms use same values as regular forms
        'ך': 11, 'ם': 13, 'ן': 14, 'ף': 17, 'ץ': 18
    };

    // Atbash cipher mapping (reverse alphabet)
    static ATBASH_MAP = {
        'א': 'ת', 'ב': 'ש', 'ג': 'ר', 'ד': 'ק', 'ה': 'צ', 'ו': 'פ', 'ז': 'ע', 'ח': 'ס', 'ט': 'נ', 'י': 'מ', 'כ': 'ל',
        'ל': 'כ', 'מ': 'י', 'נ': 'ט', 'ס': 'ח', 'ע': 'ז', 'פ': 'ו', 'צ': 'ה', 'ק': 'ד', 'ר': 'ג', 'ש': 'ב', 'ת': 'א',
        // Final forms
        'ך': 'ל', 'ם': 'י', 'ן': 'ט', 'ף': 'ו', 'ץ': 'ה'
    };

    // Gematria calculation methods
    static CALCULATION_METHODS = {
        STANDARD: 'standard',
        MISPAR_KATAN: 'mispar_katan',
        ORDINAL: 'ordinal',
        ATBASH: 'atbash'
    };

    /**
     * Calculate gematria value using standard method
     * @param {string} text - Hebrew text
     * @returns {number} - Gematria value
     */
    static calculateStandard(text) {
        return this.calculateWithValues(text, this.STANDARD_VALUES);
    }

    /**
     * Calculate gematria value using Mispar Katan method
     * @param {string} text - Hebrew text
     * @returns {number} - Reduced gematria value
     */
    static calculateMisparKatan(text) {
        return this.calculateWithValues(text, this.MISPAR_KATAN_VALUES);
    }

    /**
     * Calculate gematria value using ordinal method
     * @param {string} text - Hebrew text
     * @returns {number} - Ordinal gematria value
     */
    static calculateOrdinal(text) {
        return this.calculateWithValues(text, this.ORDINAL_VALUES);
    }

    /**
     * Apply Atbash cipher to Hebrew text
     * @param {string} text - Hebrew text
     * @returns {string} - Text with Atbash cipher applied
     */
    static applyAtbash(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        const normalized = HebrewUtils.normalizeText(text);
        return Array.from(normalized)
            .map(letter => this.ATBASH_MAP[letter] || letter)
            .join('');
    }

    /**
     * Calculate gematria with specific value mapping
     * @param {string} text - Hebrew text
     * @param {Object} valueMap - Letter to value mapping
     * @returns {number} - Calculated value
     */
    static calculateWithValues(text, valueMap) {
        if (!text || typeof text !== 'string') {
            return 0;
        }

        const normalized = HebrewUtils.normalizeText(text);
        return Array.from(normalized)
            .reduce((sum, letter) => sum + (valueMap[letter] || 0), 0);
    }

    /**
     * Calculate all gematria methods for a text
     * @param {string} text - Hebrew text
     * @returns {Object} - Object with all gematria calculations
     */
    static calculateAll(text) {
        const normalized = HebrewUtils.normalizeText(text);
        
        return {
            text: text,
            normalized: normalized,
            standard: this.calculateStandard(normalized),
            misparKatan: this.calculateMisparKatan(normalized),
            ordinal: this.calculateOrdinal(normalized),
            atbash: {
                text: this.applyAtbash(normalized),
                value: this.calculateStandard(this.applyAtbash(normalized))
            },
            letterCount: normalized.length
        };
    }

    /**
     * Get detailed letter-by-letter breakdown
     * @param {string} text - Hebrew text
     * @param {string} method - Calculation method
     * @returns {Array} - Array of letter details
     */
    static getLetterBreakdown(text, method = 'standard') {
        const normalized = HebrewUtils.normalizeText(text);
        let valueMap;

        switch (method) {
            case this.CALCULATION_METHODS.MISPAR_KATAN:
                valueMap = this.MISPAR_KATAN_VALUES;
                break;
            case this.CALCULATION_METHODS.ORDINAL:
                valueMap = this.ORDINAL_VALUES;
                break;
            case this.CALCULATION_METHODS.ATBASH:
                const atbashText = this.applyAtbash(normalized);
                return this.getLetterBreakdown(atbashText, 'standard');
            default:
                valueMap = this.STANDARD_VALUES;
        }

        return Array.from(normalized).map((letter, index) => ({
            letter: letter,
            position: index + 1,
            value: valueMap[letter] || 0,
            ordinal: this.ORDINAL_VALUES[letter] || 0
        }));
    }

    /**
     * Find words with specific gematria value
     * @param {number} targetValue - Target gematria value
     * @param {string[]} wordList - List of words to search
     * @param {string} method - Calculation method
     * @returns {Array} - Matching words with their values
     */
    static findWordsWithValue(targetValue, wordList, method = 'standard') {
        const matches = [];
        
        for (const word of wordList) {
            let value;
            switch (method) {
                case this.CALCULATION_METHODS.MISPAR_KATAN:
                    value = this.calculateMisparKatan(word);
                    break;
                case this.CALCULATION_METHODS.ORDINAL:
                    value = this.calculateOrdinal(word);
                    break;
                case this.CALCULATION_METHODS.ATBASH:
                    value = this.calculateStandard(this.applyAtbash(word));
                    break;
                default:
                    value = this.calculateStandard(word);
            }
            
            if (value === targetValue) {
                matches.push({
                    word: word,
                    value: value,
                    method: method
                });
            }
        }
        
        return matches;
    }

    /**
     * Calculate digital root (repeated digit summing until single digit)
     * @param {number} value - Numerical value
     * @returns {number} - Digital root
     */
    static calculateDigitalRoot(value) {
        if (value < 10) return value;
        
        let sum = value;
        while (sum >= 10) {
            sum = sum.toString()
                .split('')
                .reduce((acc, digit) => acc + parseInt(digit), 0);
        }
        
        return sum;
    }

    /**
     * Check if two words are gematria equivalents
     * @param {string} word1 - First Hebrew word
     * @param {string} word2 - Second Hebrew word
     * @param {string} method - Calculation method
     * @returns {boolean} - True if values are equal
     */
    static areGematriaEquivalent(word1, word2, method = 'standard') {
        let value1, value2;
        
        switch (method) {
            case this.CALCULATION_METHODS.MISPAR_KATAN:
                value1 = this.calculateMisparKatan(word1);
                value2 = this.calculateMisparKatan(word2);
                break;
            case this.CALCULATION_METHODS.ORDINAL:
                value1 = this.calculateOrdinal(word1);
                value2 = this.calculateOrdinal(word2);
                break;
            case this.CALCULATION_METHODS.ATBASH:
                value1 = this.calculateStandard(this.applyAtbash(word1));
                value2 = this.calculateStandard(this.applyAtbash(word2));
                break;
            default:
                value1 = this.calculateStandard(word1);
                value2 = this.calculateStandard(word2);
        }
        
        return value1 === value2;
    }

    /**
     * Format gematria result for display
     * @param {Object} result - Gematria calculation result
     * @returns {string} - Formatted display string
     */
    static formatForDisplay(result) {
        const lines = [
            `מילה: ${result.text}`,
            `רגיל: ${result.standard}`,
            `קטן: ${result.misparKatan}`,
            `סדרתי: ${result.ordinal}`
        ];
        
        if (result.atbash.text !== result.normalized) {
            lines.push(`אתב"ש: ${result.atbash.text} (${result.atbash.value})`);
        }
        
        return lines.join('\n');
    }

    /**
     * Get common gematria values and their meanings
     * @returns {Object} - Map of common values to their significance
     */
    static getCommonValues() {
        return {
            1: 'אחד - Unity',
            3: 'אב - Father', 
            5: 'ה - The letter Heh',
            6: 'ו - The letter Vav',
            7: 'ז - The letter Zayin',
            10: 'י - The letter Yod',
            13: 'אחד - One, אהבה - Love',
            15: 'יה - Divine name',
            17: 'טוב - Good',
            18: 'חי - Life',
            26: 'יהוה - Divine name',
            32: 'לב - Heart',
            36: 'אמת - Truth',
            72: 'חסד - Kindness',
            86: 'אלהים - God',
            91: 'אמן - Amen',
            136: 'קול - Voice',
            248: 'אברהם - Abraham',
            358: 'משיח - Messiah',
            541: 'ישראל - Israel',
            611: 'תורה - Torah',
            913: 'בראשית - In the beginning'
        };
    }

    /**
     * Analyze numerical patterns in gematria value
     * @param {number} value - Gematria value to analyze
     * @returns {Object} - Pattern analysis
     */
    static analyzeNumericalPatterns(value) {
        const analysis = {
            value: value,
            digitalRoot: this.calculateDigitalRoot(value),
            isPrime: this.isPrime(value),
            isSquare: this.isPerfectSquare(value),
            factors: this.getFactors(value),
            digitSum: this.getDigitSum(value)
        };
        
        // Check for triangular numbers
        analysis.isTriangular = this.isTriangularNumber(value);
        
        // Check for Fibonacci sequence
        analysis.isFibonacci = this.isFibonacciNumber(value);
        
        return analysis;
    }

    /**
     * Check if number is prime
     * @param {number} n - Number to check
     * @returns {boolean} - True if prime
     */
    static isPrime(n) {
        if (n <= 1) return false;
        if (n <= 3) return true;
        if (n % 2 === 0 || n % 3 === 0) return false;
        
        for (let i = 5; i * i <= n; i += 6) {
            if (n % i === 0 || n % (i + 2) === 0) return false;
        }
        
        return true;
    }

    /**
     * Check if number is perfect square
     * @param {number} n - Number to check
     * @returns {boolean} - True if perfect square
     */
    static isPerfectSquare(n) {
        const sqrt = Math.sqrt(n);
        return sqrt === Math.floor(sqrt);
    }

    /**
     * Get all factors of a number
     * @param {number} n - Number to factorize
     * @returns {Array} - Array of factors
     */
    static getFactors(n) {
        const factors = [];
        for (let i = 1; i <= Math.sqrt(n); i++) {
            if (n % i === 0) {
                factors.push(i);
                if (i !== n / i) {
                    factors.push(n / i);
                }
            }
        }
        return factors.sort((a, b) => a - b);
    }

    /**
     * Calculate sum of digits
     * @param {number} n - Number
     * @returns {number} - Sum of digits
     */
    static getDigitSum(n) {
        return n.toString()
            .split('')
            .reduce((sum, digit) => sum + parseInt(digit), 0);
    }

    /**
     * Check if number is triangular
     * @param {number} n - Number to check
     * @returns {boolean} - True if triangular
     */
    static isTriangularNumber(n) {
        const x = (Math.sqrt(8 * n + 1) - 1) / 2;
        return x === Math.floor(x);
    }

    /**
     * Check if number is in Fibonacci sequence
     * @param {number} n - Number to check
     * @returns {boolean} - True if Fibonacci number
     */
    static isFibonacciNumber(n) {
        const check1 = 5 * n * n + 4;
        const check2 = 5 * n * n - 4;
        return this.isPerfectSquare(check1) || this.isPerfectSquare(check2);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Gematria;
}
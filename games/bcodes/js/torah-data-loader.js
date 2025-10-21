/**
 * Torah Data Loader
 * Fetches Hebrew text data directly from torahcodes_fork repository
 */

class TorahDataLoader {
    constructor() {
        this.baseUrl = 'https://raw.githubusercontent.com/roni762583/torahcodes_fork/main/texts/';
        this.cache = new Map();
        
        // Torah books configuration
        this.books = {
            genesis: {
                id: 'genesis',
                hebrewName: 'בראשית',
                englishName: 'Genesis',
                number: 1,
                korenFile: 'text_koren_1genesis.txt',
                leningradFile: 'text_leningrad_1genesis.json'
            },
            exodus: {
                id: 'exodus',
                hebrewName: 'שמות',
                englishName: 'Exodus',
                number: 2,
                korenFile: 'text_koren_2exodus.txt',
                leningradFile: 'text_leningrad_2exodus.json'
            },
            leviticus: {
                id: 'leviticus',
                hebrewName: 'ויקרא',
                englishName: 'Leviticus',
                number: 3,
                korenFile: 'text_koren_3leviticus.txt',
                leningradFile: 'text_leningrad_3leviticus.json'
            },
            numbers: {
                id: 'numbers',
                hebrewName: 'במדבר',
                englishName: 'Numbers',
                number: 4,
                korenFile: 'text_koren_4numbers.txt',
                leningradFile: 'text_leningrad_4numbers.json'
            },
            deuteronomy: {
                id: 'deuteronomy',
                hebrewName: 'דברים',
                englishName: 'Deuteronomy',
                number: 5,
                korenFile: 'text_koren_5deuteronomy.txt',
                leningradFile: 'text_leningrad_5deuteronomy.json'
            }
        };
    }

    /**
     * Load Torah text from repository
     * @param {string} bookId - Book identifier (genesis, exodus, etc.)
     * @param {string} source - Text source ('koren' or 'leningrad')
     * @returns {Promise<Object>} - Processed text data
     */
    async loadBook(bookId, source = 'leningrad') {
        const cacheKey = `${bookId}_${source}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const book = this.books[bookId];
        if (!book) {
            throw new Error(`Unknown book: ${bookId}`);
        }

        try {
            let textData;
            
            if (source === 'leningrad') {
                textData = await this.loadLeningradText(book);
            } else if (source === 'koren') {
                textData = await this.loadKorenText(book);
            } else {
                throw new Error(`Unknown source: ${source}`);
            }

            // Cache the result
            this.cache.set(cacheKey, textData);
            return textData;

        } catch (error) {
            console.error(`Error loading ${bookId} from ${source}:`, error);
            throw error;
        }
    }

    /**
     * Load Leningrad Codex text (JSON format)
     * @param {Object} book - Book configuration
     * @returns {Promise<Object>} - Processed text data
     */
    async loadLeningradText(book) {
        const url = this.baseUrl + book.leningradFile;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const jsonData = await response.json();
            
            // Process the JSON structure
            const processedData = {
                book: book.id,
                title: book.hebrewName,
                englishTitle: book.englishName,
                source: 'Leningrad Codex',
                chapters: [],
                fullText: '',
                normalizedText: '',
                statistics: {
                    totalChapters: 0,
                    totalVerses: 0,
                    totalWords: 0,
                    totalLetters: 0
                }
            };

            // Process chapters and verses
            let verseCount = 0;
            let wordCount = 0;
            let allText = '';

            jsonData.text.forEach((chapter, chapterIndex) => {
                const chapterData = {
                    number: chapterIndex + 1,
                    verses: []
                };

                chapter.forEach((verse, verseIndex) => {
                    const verseData = {
                        number: verseIndex + 1,
                        text: verse,
                        normalized: HebrewUtils.normalizeText(verse)
                    };

                    chapterData.verses.push(verseData);
                    allText += verse + ' ';
                    verseCount++;
                    wordCount += verse.split(/\s+/).length;
                });

                processedData.chapters.push(chapterData);
            });

            // Generate full text and statistics
            processedData.fullText = allText.trim();
            processedData.normalizedText = HebrewUtils.normalizeText(allText);
            processedData.statistics = {
                totalChapters: jsonData.text.length,
                totalVerses: verseCount,
                totalWords: wordCount,
                totalLetters: processedData.normalizedText.length
            };

            return processedData;

        } catch (error) {
            console.error('Error fetching Leningrad text:', error);
            throw error;
        }
    }

    /**
     * Load Koren text (TXT format)
     * @param {Object} book - Book configuration
     * @returns {Promise<Object>} - Processed text data
     */
    async loadKorenText(book) {
        const url = this.baseUrl + book.korenFile;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const textContent = await response.text();
            
            // Process the raw text
            const processedData = {
                book: book.id,
                title: book.hebrewName,
                englishTitle: book.englishName,
                source: 'Koren Jerusalem Bible',
                fullText: textContent.trim(),
                normalizedText: HebrewUtils.normalizeText(textContent),
                statistics: {
                    totalLetters: 0,
                    totalWords: 0
                }
            };

            // Calculate statistics
            const words = textContent.trim().split(/\s+/);
            processedData.statistics = {
                totalLetters: processedData.normalizedText.length,
                totalWords: words.length
            };

            return processedData;

        } catch (error) {
            console.error('Error fetching Koren text:', error);
            throw error;
        }
    }

    /**
     * Load multiple books
     * @param {string[]} bookIds - Array of book identifiers
     * @param {string} source - Text source
     * @returns {Promise<Map>} - Map of book data
     */
    async loadMultipleBooks(bookIds, source = 'leningrad') {
        const results = new Map();
        
        for (const bookId of bookIds) {
            try {
                const bookData = await this.loadBook(bookId, source);
                results.set(bookId, bookData);
            } catch (error) {
                console.error(`Failed to load ${bookId}:`, error);
                results.set(bookId, null);
            }
        }
        
        return results;
    }

    /**
     * Load complete Torah (all 5 books)
     * @param {string} source - Text source
     * @returns {Promise<Object>} - Combined Torah data
     */
    async loadCompleteTorah(source = 'leningrad') {
        const bookIds = Object.keys(this.books);
        const books = await this.loadMultipleBooks(bookIds, source);
        
        let combinedText = '';
        let totalLetters = 0;
        let totalWords = 0;
        let totalVerses = 0;
        let totalChapters = 0;

        const torahData = {
            title: 'תורה',
            englishTitle: 'Torah',
            source: source === 'leningrad' ? 'Leningrad Codex' : 'Koren Jerusalem Bible',
            books: {},
            fullText: '',
            normalizedText: '',
            statistics: {}
        };

        for (const [bookId, bookData] of books) {
            if (bookData) {
                torahData.books[bookId] = bookData;
                combinedText += bookData.fullText + ' ';
                
                if (bookData.statistics) {
                    totalLetters += bookData.statistics.totalLetters || 0;
                    totalWords += bookData.statistics.totalWords || 0;
                    totalVerses += bookData.statistics.totalVerses || 0;
                    totalChapters += bookData.statistics.totalChapters || 0;
                }
            }
        }

        torahData.fullText = combinedText.trim();
        torahData.normalizedText = HebrewUtils.normalizeText(combinedText);
        torahData.statistics = {
            totalBooks: Object.keys(torahData.books).length,
            totalChapters,
            totalVerses,
            totalWords,
            totalLetters
        };

        return torahData;
    }

    /**
     * Get available books
     * @returns {Object} - Books configuration
     */
    getAvailableBooks() {
        return { ...this.books };
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     * @returns {Object} - Cache stats
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }

    /**
     * Test connectivity to repository
     * @returns {Promise<boolean>} - True if accessible
     */
    async testConnectivity() {
        try {
            const testUrl = this.baseUrl + 'text_leningrad_1genesis.json';
            const response = await fetch(testUrl, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TorahDataLoader;
}
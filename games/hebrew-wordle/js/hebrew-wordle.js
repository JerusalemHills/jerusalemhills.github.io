// Hebrew Wordle Game - Jerusalem Hills
(function() {
    'use strict';

    // Hebrew 5-letter words database (frequency-based, modern Hebrew)
    // Based on Hebrew frequency lists from TeachMeHebrew.com and 101Languages.net
    const HEBREW_WORDS = [
        // High frequency common words (everyday conversation)
        'שלום', 'אותו', 'אותי', 'אותה', 'אהבה', 'מילה', 'חיים', 'אמרה', 'אמרת', 'הולך',
        'שמחה', 'נותן', 'עובד', 'שומע', 'רואה', 'חושב', 'אדמה', 'מדוע', 'עמדה', 'אנשי',
        
        // Medium frequency useful words (daily life)
        'בוקר', 'ערב', 'לילה', 'מקום', 'דרך', 'טוב', 'גדול', 'קטן', 'חדש', 'ישן',
        'לבן', 'שחור', 'אדום', 'ירוק', 'כחול', 'צהוב', 'מים', 'אוכל', 'לחם', 'בית',
        
        // Body parts and family (common vocabulary)
        'ראש', 'פנים', 'ידים', 'רגל', 'לב', 'אמא', 'אבא', 'ילד', 'בת', 'בן',
        
        // Actions and verbs (everyday usage)
        'אכל', 'שתה', 'ישן', 'קם', 'הלך', 'בא', 'יצא', 'ראה', 'שמע', 'דבר',
        
        // Time and numbers (universal concepts)
        'יום', 'שבוע', 'חודש', 'שנה', 'זמן', 'שעה', 'דקה', 'אחד', 'שני', 'שלוש',
        
        // Places and geography (accessible vocabulary)
        'עיר', 'כפר', 'רחוב', 'דרך', 'בית', 'חדר', 'מטבח', 'גן', 'בי\'ת', 'ים',
        
        // Emotions and descriptions (relatable)
        'שמח', 'עצוב', 'כעס', 'פחד', 'טוב', 'רע', 'יפה', 'חזק', 'חלש', 'מהיר',
        
        // School and work (modern life)
        'ספר', 'לוח', 'עט', 'נייר', 'שולחן', 'כיסא', 'מורה', 'תלמיד', 'עבודה', 'משרד'
    ];

    // Hebrew keyboard layout
    const HEBREW_KEYBOARD = [
        ['ק', 'ר', 'א', 'ט', 'ו', 'ן', 'ם', 'פ'],
        ['ש', 'ד', 'ג', 'כ', 'ע', 'י', 'ח', 'ל', 'ך', 'ף'],
        ['ז', 'ס', 'ב', 'ה', 'נ', 'מ', 'צ', 'ת', 'ץ']
    ];

    // Game state
    let gameState = {
        currentWord: '',
        currentGuess: '',
        currentRow: 0,
        currentCol: 0,
        gameOver: false,
        won: false,
        guesses: [],
        keyboardState: {},
        startDate: new Date().toDateString()
    };

    // Statistics
    let stats = {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0,
        winPercentage: 0,
        lastPlayed: ''
    };

    // Initialize game
    function init() {
        loadStats();
        setupDailyWord();
        createGameBoard();
        createKeyboard();
        updateStats();
        updateTimer();
        setInterval(updateTimer, 1000);
        
        // Add keyboard event listeners
        document.addEventListener('keydown', handleKeyboard);
        
        console.log('Hebrew Wordle initialized!');
        if (process?.env?.NODE_ENV === 'development') {
            console.log('Today\'s word:', gameState.currentWord);
        }
    }

    // Setup daily word based on date
    function setupDailyWord() {
        const today = new Date();
        const startDate = new Date('2025-01-01');
        const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        const wordIndex = daysDiff % HEBREW_WORDS.length;
        
        gameState.currentWord = HEBREW_WORDS[wordIndex].toUpperCase();
        gameState.startDate = today.toDateString();
        
        // Update puzzle number
        document.getElementById('puzzle-number').textContent = daysDiff + 1;
        
        // Check if user already played today
        const savedGame = localStorage.getItem('hebrew-wordle-game');
        if (savedGame) {
            const saved = JSON.parse(savedGame);
            if (saved.startDate === gameState.startDate) {
                // Load saved game for today
                gameState = { ...gameState, ...saved };
                restoreGameState();
            }
        }
    }

    // Create game board
    function createGameBoard() {
        const board = document.getElementById('game-board');
        board.innerHTML = '';
        
        for (let row = 0; row < 6; row++) {
            const rowElement = document.createElement('div');
            rowElement.className = 'row';
            rowElement.id = `row-${row}`;
            
            for (let col = 0; col < 5; col++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.id = `tile-${row}-${col}`;
                rowElement.appendChild(tile);
            }
            
            board.appendChild(rowElement);
        }
    }

    // Create virtual keyboard
    function createKeyboard() {
        const keyboard = document.getElementById('keyboard');
        keyboard.innerHTML = '';
        
        // First row with backspace
        const row1 = document.createElement('div');
        row1.className = 'keyboard-row';
        HEBREW_KEYBOARD[0].forEach(key => {
            const keyElement = createKey(key);
            row1.appendChild(keyElement);
        });
        const backspace = createKey('⌫', 'backspace', 'special');
        row1.appendChild(backspace);
        keyboard.appendChild(row1);
        
        // Second row
        const row2 = document.createElement('div');
        row2.className = 'keyboard-row';
        HEBREW_KEYBOARD[1].forEach(key => {
            const keyElement = createKey(key);
            row2.appendChild(keyElement);
        });
        keyboard.appendChild(row2);
        
        // Third row with enter
        const row3 = document.createElement('div');
        row3.className = 'keyboard-row';
        const enter = createKey('אישור', 'enter', 'special');
        row3.appendChild(enter);
        HEBREW_KEYBOARD[2].forEach(key => {
            const keyElement = createKey(key);
            row3.appendChild(keyElement);
        });
        keyboard.appendChild(row3);
    }

    // Create individual key
    function createKey(letter, action = null, type = 'letter') {
        const key = document.createElement('button');
        key.className = `key ${type}`;
        key.textContent = letter;
        key.setAttribute('data-key', action || letter);
        
        key.addEventListener('click', () => {
            if (gameState.gameOver) return;
            
            if (action === 'backspace') {
                deleteLetter();
            } else if (action === 'enter') {
                submitGuess();
            } else {
                addLetter(letter);
            }
        });
        
        return key;
    }

    // Handle keyboard input
    function handleKeyboard(event) {
        if (gameState.gameOver) return;
        
        const key = event.key;
        
        if (key === 'Backspace') {
            deleteLetter();
        } else if (key === 'Enter') {
            submitGuess();
        } else if (isHebrewLetter(key)) {
            addLetter(key.toUpperCase());
        }
    }

    // Check if character is Hebrew letter
    function isHebrewLetter(char) {
        return /[\u0590-\u05FF]/.test(char);
    }

    // Function to validate Hebrew word using Wiktionary (from צירופים game)
    async function validateHebrewWord(word) {
        const wordLower = word.toLowerCase();
        
        // First check our curated list (always available offline)
        if (HEBREW_WORDS.includes(wordLower)) {
            return true;
        }

        // Check if we're online before trying API
        if (!navigator.onLine) {
            console.log('Offline mode: only validating against curated list');
            return false;
        }

        // Then check Wiktionary for other valid Hebrew words (online only)
        const url = `https://he.wiktionary.org/w/api.php?action=query&titles=${encodeURIComponent(word)}&prop=extracts&format=json&origin=*`;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
            
            const response = await fetch(url, { 
                signal: controller.signal,
                cache: 'default' // Use browser cache when available
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) return false;

            const data = await response.json();
            const page = Object.values(data.query.pages)[0];

            // Check if the term exists in the dictionary
            return !page.missing;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Word validation timeout - using offline mode');
            } else {
                console.error("Error validating word:", error);
            }
            // Fallback to our curated list if API fails
            return false;
        }
    }

    // Add letter to current guess
    function addLetter(letter) {
        if (gameState.currentCol < 5 && gameState.currentRow < 6) {
            const tile = document.getElementById(`tile-${gameState.currentRow}-${gameState.currentCol}`);
            tile.textContent = letter;
            tile.classList.add('filled');
            
            gameState.currentGuess += letter;
            gameState.currentCol++;
            
            updateCurrentAttempt();
        }
    }

    // Delete letter from current guess
    function deleteLetter() {
        if (gameState.currentCol > 0) {
            gameState.currentCol--;
            const tile = document.getElementById(`tile-${gameState.currentRow}-${gameState.currentCol}`);
            tile.textContent = '';
            tile.classList.remove('filled');
            
            gameState.currentGuess = gameState.currentGuess.slice(0, -1);
            
            updateCurrentAttempt();
        }
    }

    // Submit current guess
    async function submitGuess() {
        if (gameState.currentCol !== 5) {
            showMessage('יש להשלים מילה בת 5 אותיות', 'warning');
            return;
        }
        
        // Show loading state
        showMessage('בודק מילה...', 'warning');
        
        // Validate word (check curated list first, then API if online)
        const isValid = await validateHebrewWord(gameState.currentGuess);
        if (!isValid) {
            showMessage('מילה לא מוכרת במאגר העברי', 'error');
            return;
        }
        
        const guess = gameState.currentGuess;
        gameState.guesses.push(guess);
        
        // Check each letter
        const result = checkGuess(guess);
        animateRow(gameState.currentRow, result);
        
        // Update keyboard colors
        updateKeyboard(guess, result);
        
        if (guess === gameState.currentWord) {
            // Won!
            gameState.won = true;
            gameState.gameOver = true;
            setTimeout(() => {
                showMessage(`כל הכבוד! פתרת את החידה ב-${gameState.currentRow + 1} ניסיונות! 🎉`, 'success');
                updateStatsAfterGame(true);
            }, 1500);
        } else if (gameState.currentRow === 5) {
            // Lost
            gameState.gameOver = true;
            setTimeout(() => {
                showMessage(`המילה הייתה: ${gameState.currentWord}. בהצלחה מחר! 💪`, 'error');
                updateStatsAfterGame(false);
            }, 1500);
        } else {
            // Next row
            gameState.currentRow++;
            gameState.currentCol = 0;
            gameState.currentGuess = '';
            updateCurrentAttempt();
        }
        
        saveGame();
    }

    // Check guess against target word
    function checkGuess(guess) {
        const result = [];
        const target = gameState.currentWord;
        const targetLetters = target.split('');
        const guessLetters = guess.split('');
        
        // First pass: mark correct positions
        for (let i = 0; i < 5; i++) {
            if (guessLetters[i] === targetLetters[i]) {
                result[i] = 'correct';
                targetLetters[i] = null; // Mark as used
                guessLetters[i] = null; // Mark as used
            }
        }
        
        // Second pass: mark present letters
        for (let i = 0; i < 5; i++) {
            if (guessLetters[i] !== null) {
                const index = targetLetters.indexOf(guessLetters[i]);
                if (index !== -1) {
                    result[i] = 'present';
                    targetLetters[index] = null; // Mark as used
                } else {
                    result[i] = 'absent';
                }
            }
        }
        
        return result;
    }

    // Animate row reveal
    function animateRow(rowIndex, result) {
        for (let i = 0; i < 5; i++) {
            const tile = document.getElementById(`tile-${rowIndex}-${i}`);
            
            setTimeout(() => {
                tile.classList.add('flip');
                setTimeout(() => {
                    tile.classList.add(result[i]);
                }, 300);
            }, i * 100);
        }
    }

    // Update keyboard colors
    function updateKeyboard(guess, result) {
        for (let i = 0; i < 5; i++) {
            const letter = guess[i];
            const status = result[i];
            
            if (!gameState.keyboardState[letter] || 
                (gameState.keyboardState[letter] !== 'correct' && status === 'correct') ||
                (gameState.keyboardState[letter] === 'absent' && status === 'present')) {
                gameState.keyboardState[letter] = status;
            }
            
            const key = document.querySelector(`[data-key="${letter}"]`);
            if (key) {
                key.className = `key ${gameState.keyboardState[letter]}`;
            }
        }
    }

    // Show message to user
    function showMessage(text, type = 'info') {
        const message = document.getElementById('message');
        message.textContent = text;
        message.className = `message ${type} show`;
        
        setTimeout(() => {
            message.classList.remove('show');
        }, 3000);
    }

    // Update current attempt display
    function updateCurrentAttempt() {
        document.getElementById('attempt-number').textContent = gameState.currentRow + 1;
    }

    // Save game state
    function saveGame() {
        localStorage.setItem('hebrew-wordle-game', JSON.stringify(gameState));
    }

    // Load saved game state
    function restoreGameState() {
        // Restore board
        for (let row = 0; row < gameState.guesses.length; row++) {
            const guess = gameState.guesses[row];
            const result = checkGuess(guess);
            
            for (let col = 0; col < 5; col++) {
                const tile = document.getElementById(`tile-${row}-${col}`);
                tile.textContent = guess[col];
                tile.classList.add('filled', result[col]);
            }
            
            updateKeyboard(guess, result);
        }
        
        // Restore current guess if any
        for (let col = 0; col < gameState.currentGuess.length; col++) {
            const tile = document.getElementById(`tile-${gameState.currentRow}-${col}`);
            tile.textContent = gameState.currentGuess[col];
            tile.classList.add('filled');
        }
        
        updateCurrentAttempt();
        
        if (gameState.gameOver) {
            if (gameState.won) {
                showMessage(`כבר פתרת את המילה היום! 🎉 חזור מחר למילה חדשה.`, 'success');
            } else {
                showMessage(`המילה הייתה: ${gameState.currentWord}. בהצלחה מחר! 💪`, 'error');
            }
        }
    }

    // Load statistics
    function loadStats() {
        const saved = localStorage.getItem('hebrew-wordle-stats');
        if (saved) {
            stats = { ...stats, ...JSON.parse(saved) };
        }
    }

    // Save statistics
    function saveStats() {
        localStorage.setItem('hebrew-wordle-stats', JSON.stringify(stats));
    }

    // Update statistics after game
    function updateStatsAfterGame(won) {
        const today = new Date().toDateString();
        
        // Only update if not already played today
        if (stats.lastPlayed !== today) {
            stats.gamesPlayed++;
            
            if (won) {
                stats.gamesWon++;
                stats.currentStreak++;
                stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
            } else {
                stats.currentStreak = 0;
            }
            
            stats.winPercentage = Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
            stats.lastPlayed = today;
            
            saveStats();
            updateStats();
        }
    }

    // Update statistics display
    function updateStats() {
        document.getElementById('games-played').textContent = stats.gamesPlayed;
        document.getElementById('win-percentage').textContent = stats.winPercentage + '%';
        document.getElementById('current-streak').textContent = stats.currentStreak;
        document.getElementById('max-streak').textContent = stats.maxStreak;
    }

    // Update countdown timer
    function updateTimer() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const diff = tomorrow - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        document.getElementById('countdown').textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Global functions for buttons
    window.newGame = function() {
        if (confirm('האם אתה בטוח שרוצה להתחיל משחק חדש? התקדמות נוכחית תאבד.')) {
            localStorage.removeItem('hebrew-wordle-game');
            location.reload();
        }
    };

    window.showStats = function() {
        const statsElement = document.getElementById('stats');
        if (statsElement.style.display === 'none') {
            statsElement.style.display = 'block';
            updateStats();
        } else {
            statsElement.style.display = 'none';
        }
    };

    window.shareResult = function() {
        if (!gameState.gameOver) {
            showMessage('סיים את המשחק לפני שיתוף התוצאה', 'warning');
            return;
        }
        
        const puzzleNumber = document.getElementById('puzzle-number').textContent;
        const attempts = gameState.won ? gameState.currentRow + 1 : 'X';
        
        let result = `מילה יומית #${puzzleNumber} ${attempts}/6\n\n`;
        
        for (let i = 0; i < gameState.guesses.length; i++) {
            const guess = gameState.guesses[i];
            const checkResult = checkGuess(guess);
            
            for (let j = 0; j < 5; j++) {
                if (checkResult[j] === 'correct') {
                    result += '🟩';
                } else if (checkResult[j] === 'present') {
                    result += '🟨';
                } else {
                    result += '⬜';
                }
            }
            result += '\n';
        }
        
        result += '\nJerusalem Hills Hebrew Wordle\nhttps://jerusalemhills.com/games/hebrew-wordle/';
        
        if (navigator.share) {
            navigator.share({
                title: 'מילה יומית - תוצאתי',
                text: result
            });
        } else {
            navigator.clipboard.writeText(result).then(() => {
                showMessage('התוצאה הועתקה ללוח! הדבק בכל מקום שתרצה לשתף.', 'success');
            });
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
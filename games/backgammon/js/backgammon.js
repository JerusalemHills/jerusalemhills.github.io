/**
 * Jerusalem Hills Backgammon Game
 * ================================
 * Local multiplayer backgammon with full game logic
 */

class BackgammonGame {
    constructor() {
        // Game state
        this.board = this.initializeBoard();
        this.currentPlayer = 'white'; // white or black
        this.dice = [0, 0];
        this.movesRemaining = [];
        this.selectedChecker = null;
        this.validMoves = [];
        this.gameStarted = false;
        this.winner = null;

        // Game statistics
        this.stats = {
            white: { piecesHome: 0, piecesOff: 0, doubletsRolled: 0 },
            black: { piecesHome: 0, piecesOff: 0, doubletsRolled: 0 }
        };

        // Move history
        this.moveHistory = [];
        this.moveNumber = 1;

        // Sound enabled
        this.soundEnabled = localStorage.getItem('bg-sound') !== 'false';

        // Multiplayer support
        this.multiplayer = null;
        this.gameMode = 'local'; // 'local', 'online-host', or 'online-guest'

        // Initialize UI
        this.initializeUI();
        this.bindEvents();
        this.render();

        // Initialize multiplayer
        this.initMultiplayer();
    }

    initializeBoard() {
        // Standard backgammon starting position
        // Points numbered 1-24, with bar at position 0 and home at position 25
        // White moves from 1→24 (counterclockwise)
        // Black moves from 24→1 (clockwise)
        const board = Array(26).fill(null).map(() => []);

        // White pieces starting position (15 total)
        board[1] = Array(2).fill('white');   // 2 on point 1
        board[12] = Array(5).fill('white');  // 5 on point 12
        board[17] = Array(3).fill('white');  // 3 on point 17
        board[19] = Array(5).fill('white');  // 5 on point 19

        // Black pieces starting position (15 total)
        board[24] = Array(2).fill('black');  // 2 on point 24
        board[13] = Array(5).fill('black');  // 5 on point 13
        board[8] = Array(3).fill('black');   // 3 on point 8
        board[6] = Array(5).fill('black');   // 5 on point 6

        return board;
    }

    initializeUI() {
        // Create board container
        const container = document.getElementById('backgammon-board');
        if (!container) {
            console.error('Backgammon board container not found');
            return;
        }

        container.innerHTML = '';

        // Standard backgammon layout:
        // Top row (left to right): 13, 14, 15, 16, 17, 18 | BAR | 19, 20, 21, 22, 23, 24
        // Bottom row (left to right): 12, 11, 10, 9, 8, 7 | BAR | 6, 5, 4, 3, 2, 1

        // Create top row - points 13 to 18
        for (let i = 13; i <= 18; i++) {
            const point = document.createElement('div');
            point.className = `point top ${i % 2 === 0 ? 'light' : 'dark'}`;
            point.dataset.position = i;
            point.id = `point-${i}`;
            container.appendChild(point);
        }

        // Add bar in the middle
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.id = 'bar';
        bar.dataset.position = '0';
        container.appendChild(bar);

        // Create top row - points 19 to 24
        for (let i = 19; i <= 24; i++) {
            const point = document.createElement('div');
            point.className = `point top ${i % 2 === 0 ? 'light' : 'dark'}`;
            point.dataset.position = i;
            point.id = `point-${i}`;
            container.appendChild(point);
        }

        // Create bottom row - points 12 down to 7
        for (let i = 12; i >= 7; i--) {
            const point = document.createElement('div');
            point.className = `point bottom ${i % 2 === 0 ? 'light' : 'dark'}`;
            point.dataset.position = i;
            point.id = `point-${i}`;
            container.appendChild(point);
        }

        // Bar is already added above (shared between top and bottom)

        // Create bottom row - points 6 down to 1
        for (let i = 6; i >= 1; i--) {
            const point = document.createElement('div');
            point.className = `point bottom ${i % 2 === 0 ? 'light' : 'dark'}`;
            point.dataset.position = i;
            point.id = `point-${i}`;
            container.appendChild(point);
        }

        // Add home areas
        const whiteHome = document.createElement('div');
        whiteHome.className = 'home-area home-white';
        whiteHome.dataset.position = '25';
        whiteHome.id = 'white-home';
        container.appendChild(whiteHome);

        const blackHome = document.createElement('div');
        blackHome.className = 'home-area home-black';
        blackHome.dataset.position = '25';
        blackHome.id = 'black-home';
        container.appendChild(blackHome);

        // Create dice container
        const diceContainer = document.createElement('div');
        diceContainer.className = 'dice-container';
        diceContainer.innerHTML = `
            <div class="die" id="die1">?</div>
            <div class="die" id="die2">?</div>
        `;
        document.querySelector('.game-board-wrapper').appendChild(diceContainer);

        // Create player info
        const playerInfo = document.createElement('div');
        playerInfo.className = 'player-info';
        playerInfo.innerHTML = `
            <div class="player-card ${this.currentPlayer === 'white' ? 'active' : ''}" id="white-player">
                <div class="player-name">
                    <div class="player-color" style="background: white;"></div>
                    White Player
                </div>
                <div class="player-stats">
                    <div class="stat">
                        <span class="stat-label">Home</span>
                        <span class="stat-value" id="white-home-count">0</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Borne Off</span>
                        <span class="stat-value" id="white-off-count">0</span>
                    </div>
                </div>
            </div>
            <div class="player-card ${this.currentPlayer === 'black' ? 'active' : ''}" id="black-player">
                <div class="player-name">
                    <div class="player-color" style="background: #6B5B95;"></div>
                    Black Player
                </div>
                <div class="player-stats">
                    <div class="stat">
                        <span class="stat-label">Home</span>
                        <span class="stat-value" id="black-home-count">0</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Borne Off</span>
                        <span class="stat-value" id="black-off-count">0</span>
                    </div>
                </div>
            </div>
        `;
        document.querySelector('.game-board-wrapper').appendChild(playerInfo);

        // Create game controls
        const controls = document.createElement('div');
        controls.className = 'game-controls';
        controls.innerHTML = `
            <button class="btn-game btn-roll" id="roll-dice">Roll Dice</button>
            <button class="btn-game btn-undo" id="undo-move" disabled>Undo Move</button>
            <button class="btn-game btn-new-game" id="new-game">New Game</button>
            <button class="btn-game btn-help" id="help-btn" style="background: var(--jerusalem-olive);">❓ Help</button>
        `;
        document.querySelector('.game-board-wrapper').appendChild(controls);

        // Create move history
        const historyEl = document.createElement('div');
        historyEl.className = 'move-history';
        historyEl.innerHTML = `
            <h3>Move History</h3>
            <div id="move-list"></div>
        `;
        document.querySelector('.game-board-wrapper').appendChild(historyEl);

        // Create sound toggle
        const soundToggle = document.createElement('button');
        soundToggle.className = 'sound-toggle';
        soundToggle.innerHTML = this.soundEnabled ? '🔊' : '🔇';
        soundToggle.id = 'sound-toggle';
        soundToggle.title = 'Toggle sound effects';
        document.querySelector('.game-header').appendChild(soundToggle);
    }

    bindEvents() {
        // Roll dice button
        const rollBtn = document.getElementById('roll-dice');
        if (rollBtn) {
            rollBtn.addEventListener('click', () => this.rollDice());
        }

        // New game button
        const newGameBtn = document.getElementById('new-game');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                if (confirm('Start a new game? Current game will be lost.')) {
                    this.resetGame();
                }
            });
        }

        // Undo button
        const undoBtn = document.getElementById('undo-move');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.undoLastMove());
        }

        // Help button
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showHelp());
        }

        // Sound toggle
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.addEventListener('click', () => this.toggleSound());
        }

        // Point click events
        document.querySelectorAll('.point, .bar, .home-area').forEach(point => {
            point.addEventListener('click', (e) => this.handlePointClick(e));
        });

        // Checker drag events
        this.enableCheckerDrag();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' && !this.gameStarted) this.rollDice();
            if (e.key === 'u' && e.ctrlKey) {
                e.preventDefault();
                this.undoLastMove();
            }
            if (e.key === 'h' || e.key === '?') this.showHelp();
            if (e.key === 'Escape') this.deselectChecker();
        });
    }

    enableCheckerDrag() {
        document.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('checker')) {
                this.handleCheckerClick(e.target);
            }
        });
    }

    rollDice() {
        // Turn validation for online games
        if (this.multiplayer && this.gameMode.startsWith('online')) {
            if (!this.multiplayer.isMyTurn()) {
                this.showMessage('Not your turn!', "Wait for your opponent to finish their turn.");
                return;
            }
        }

        // Animate dice roll
        const die1 = document.getElementById('die1');
        const die2 = document.getElementById('die2');

        if (!die1 || !die2) return;

        die1.classList.add('rolling');
        die2.classList.add('rolling');
        this.playSound('dice');

        setTimeout(() => {
            // Generate random dice values
            this.dice[0] = Math.floor(Math.random() * 6) + 1;
            this.dice[1] = Math.floor(Math.random() * 6) + 1;

            // Update dice display
            die1.textContent = this.getDiceSymbol(this.dice[0]);
            die2.textContent = this.getDiceSymbol(this.dice[1]);

            // Broadcast dice roll in online games
            if (this.multiplayer && this.gameMode.startsWith('online')) {
                this.multiplayer.broadcastDiceRoll(this.dice);
            }

            die1.classList.remove('rolling');
            die2.classList.remove('rolling');

            // Calculate available moves
            if (this.dice[0] === this.dice[1]) {
                // Doubles - player can move 4 times
                this.movesRemaining = [this.dice[0], this.dice[0], this.dice[0], this.dice[0]];
                this.stats[this.currentPlayer].doubletsRolled++;
                this.showMessage('Doubles!', `${this.currentPlayer} rolled ${this.dice[0]}-${this.dice[1]}! Move 4 times!`, 1500);
            } else {
                this.movesRemaining = [...this.dice];
            }

            // Disable roll button until turn is complete
            document.getElementById('roll-dice').disabled = true;

            // Start the game if first roll
            if (!this.gameStarted) {
                this.gameStarted = true;
                this.showMessage('Game Started!', `${this.currentPlayer} rolls first!`);
            }
        }, 500);
    }

    getDiceSymbol(value) {
        const symbols = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        return symbols[value];
    }

    handleCheckerClick(checker) {
        const position = parseInt(checker.parentElement.dataset.position);
        const color = checker.classList.contains('white') ? 'white' : 'black';

        // Check if it's this player's turn
        if (color !== this.currentPlayer) {
            this.showMessage('Not your turn!', `It's ${this.currentPlayer}'s turn.`);
            return;
        }

        // Check if dice have been rolled
        if (this.movesRemaining.length === 0) {
            this.showMessage('Roll the dice first!', 'Click the Roll Dice button to continue.');
            return;
        }

        // Select/deselect checker
        if (this.selectedChecker === checker) {
            this.deselectChecker();
        } else {
            this.selectChecker(checker, position);
        }
    }

    selectChecker(checker, position) {
        // Deselect previous checker
        this.deselectChecker();

        // Select new checker
        this.selectedChecker = checker;
        checker.classList.add('selected');

        // Calculate valid moves
        this.validMoves = this.calculateValidMoves(position);

        // Highlight valid destinations
        this.validMoves.forEach(move => {
            const point = document.querySelector(`[data-position="${move.to}"]`);
            if (point) {
                point.classList.add('valid-move');
            }
        });
    }

    deselectChecker() {
        if (this.selectedChecker) {
            this.selectedChecker.classList.remove('selected');
            this.selectedChecker = null;
        }

        // Remove all valid move highlights
        document.querySelectorAll('.valid-move').forEach(point => {
            point.classList.remove('valid-move');
        });

        this.validMoves = [];
    }

    calculateValidMoves(from) {
        const moves = [];
        const player = this.currentPlayer;

        this.movesRemaining.forEach(die => {
            let to;
            if (player === 'white') {
                to = from + die;
                if (to > 24) to = 25; // Bear off
            } else {
                to = from - die;
                if (to < 1) to = 25; // Bear off
            }

            // Check if move is valid
            if (this.isValidMove(from, to, player)) {
                moves.push({ from, to, die });
            }
        });

        return moves;
    }

    isValidMove(from, to, player) {
        // Check bear off conditions
        if (to === 25) {
            return this.canBearOff(player);
        }

        // Check if destination is valid
        if (to < 1 || to > 24) return false;

        const destination = this.board[to];
        if (destination.length === 0) return true; // Empty point
        if (destination[0] === player) return true; // Own pieces
        if (destination.length === 1) return true; // Can hit opponent's blot

        return false; // Opponent has 2+ pieces
    }

    canBearOff(player) {
        // Check if all pieces are in home board
        if (player === 'white') {
            for (let i = 1; i <= 18; i++) {
                if (this.board[i].some(p => p === 'white')) return false;
            }
        } else {
            for (let i = 7; i <= 24; i++) {
                if (this.board[i].some(p => p === 'black')) return false;
            }
        }
        return true;
    }

    handlePointClick(e) {
        const point = e.currentTarget;
        const position = parseInt(point.dataset.position);

        // Check if a checker is selected and this is a valid move
        if (this.selectedChecker && this.validMoves.length > 0) {
            const move = this.validMoves.find(m => m.to === position);
            if (move) {
                this.makeMove(move);
            }
        }
    }

    makeMove(move) {
        const { from, to, die } = move;
        const player = this.currentPlayer;
        let hitOpponent = null;

        // Remove checker from source
        const sourceIndex = this.board[from].indexOf(player);
        this.board[from].splice(sourceIndex, 1);

        // Handle destination
        if (to === 25) {
            // Bear off
            this.stats[player].piecesOff++;
            this.playSound('move');
        } else {
            // Check for hit
            if (this.board[to].length === 1 && this.board[to][0] !== player) {
                // Hit opponent's blot
                hitOpponent = this.board[to][0];
                this.board[to] = [];
                this.board[0].push(hitOpponent); // Send to bar
                this.playSound('hit');
            } else {
                this.playSound('move');
            }

            // Add checker to destination
            this.board[to].push(player);
        }

        // Record move in history
        this.moveHistory.push({
            from,
            to,
            die,
            player,
            hit: hitOpponent
        });

        // Remove used die from moves
        const dieIndex = this.movesRemaining.indexOf(die);
        this.movesRemaining.splice(dieIndex, 1);

        // Broadcast move in online games
        if (this.multiplayer && this.gameMode.startsWith('online')) {
            this.multiplayer.broadcastMove(move);
        }

        // Update UI
        this.deselectChecker();
        this.render();
        this.updateMoveHistory();

        // Enable undo button
        const undoBtn = document.getElementById('undo-move');
        if (undoBtn) undoBtn.disabled = false;

        // Check for win
        if (this.checkWin(player)) {
            this.endGame(player);
            return;
        }

        // Check if turn is complete
        if (this.movesRemaining.length === 0 || !this.hasValidMoves()) {
            this.endTurn();
        }
    }

    hasValidMoves() {
        // Check if current player has any valid moves
        for (let i = 0; i <= 24; i++) {
            if (this.board[i].includes(this.currentPlayer)) {
                const moves = this.calculateValidMoves(i);
                if (moves.length > 0) return true;
            }
        }
        return false;
    }

    endTurn() {
        // Switch players
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.movesRemaining = [];

        // Update UI
        document.getElementById('white-player').classList.toggle('active');
        document.getElementById('black-player').classList.toggle('active');
        document.getElementById('roll-dice').disabled = false;

        // Show turn message
        this.showMessage(`${this.currentPlayer}'s turn`, 'Roll the dice to continue.');
    }

    checkWin(player) {
        return this.stats[player].piecesOff === 15;
    }

    endGame(winner) {
        this.winner = winner;
        this.gameStarted = false;
        this.playSound('win');

        // Broadcast win in online games
        if (this.multiplayer && this.gameMode.startsWith('online')) {
            this.multiplayer.broadcastWin(winner);
        }

        // Show victory message
        const message = document.createElement('div');
        message.className = 'game-message';
        message.innerHTML = `
            <h2>🏆 ${winner.toUpperCase()} WINS! 🏆</h2>
            <p>Congratulations! All pieces borne off successfully!</p>
            <p style="font-size: 0.9em; color: #666;">
                Moves: ${this.moveHistory.length} |
                Doubles: ${this.stats[winner].doubletsRolled}
            </p>
            <button class="btn-close-help" onclick="window.backgammonGame.resetGame()">Play Again</button>
        `;
        document.body.appendChild(message);

        // Auto-close after 10 seconds
        setTimeout(() => {
            if (message.parentElement) message.remove();
        }, 10000);
    }

    resetGame() {
        console.log('Resetting game...');

        // Clear any existing game messages
        const existingMessages = document.querySelectorAll('.game-message');
        existingMessages.forEach(msg => msg.remove());

        // Deselect any selected checkers first
        this.deselectChecker();

        // Reset game state
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.dice = [0, 0];
        this.movesRemaining = [];
        this.selectedChecker = null;
        this.validMoves = [];
        this.gameStarted = false;
        this.winner = null;

        // Reset statistics
        this.stats = {
            white: { piecesHome: 0, piecesOff: 0, doubletsRolled: 0 },
            black: { piecesHome: 0, piecesOff: 0, doubletsRolled: 0 }
        };

        // Reset move history
        this.moveHistory = [];
        this.moveNumber = 1;

        // Reset UI elements - dice
        const die1 = document.getElementById('die1');
        const die2 = document.getElementById('die2');
        if (die1) die1.textContent = '?';
        if (die2) die2.textContent = '?';

        // Reset buttons
        const rollBtn = document.getElementById('roll-dice');
        if (rollBtn) rollBtn.disabled = false;

        const undoBtn = document.getElementById('undo-move');
        if (undoBtn) undoBtn.disabled = true;

        // Reset player indicators
        const whitePlayer = document.getElementById('white-player');
        const blackPlayer = document.getElementById('black-player');
        if (whitePlayer) whitePlayer.classList.add('active');
        if (blackPlayer) blackPlayer.classList.remove('active');

        // Update move history display
        this.updateMoveHistory();

        // Clear ALL existing checkers from the DOM
        document.querySelectorAll('.checker').forEach(c => {
            c.remove();
        });

        // Force re-render with fresh board state
        this.render();
        this.playSound('click');

        console.log('Game reset complete. Board state:', this.board);
        console.log('Points with pieces:');
        this.board.forEach((point, idx) => {
            if (point.length > 0) {
                console.log(`  Point ${idx}: ${point.length} ${point[0]} pieces`);
            }
        });
    }

    undoLastMove() {
        if (this.moveHistory.length === 0) {
            this.showMessage('Cannot Undo', 'No moves to undo');
            return;
        }

        const lastMove = this.moveHistory.pop();

        // Restore board state
        if (lastMove.to === 25) {
            // Was a bear off - add piece back
            this.board[lastMove.from].push(lastMove.player);
            this.stats[lastMove.player].piecesOff--;
        } else {
            // Move piece back
            const pieceIndex = this.board[lastMove.to].indexOf(lastMove.player);
            this.board[lastMove.to].splice(pieceIndex, 1);
            this.board[lastMove.from].push(lastMove.player);

            // If there was a hit, restore opponent piece
            if (lastMove.hit) {
                const barIndex = this.board[0].indexOf(lastMove.hit);
                this.board[0].splice(barIndex, 1);
                this.board[lastMove.to].push(lastMove.hit);
            }
        }

        // Restore dice
        this.movesRemaining.push(lastMove.die);
        this.movesRemaining.sort((a, b) => b - a);

        // Update UI
        this.render();
        this.updateMoveHistory();
        this.playSound('undo');

        // Update undo button state
        document.getElementById('undo-move').disabled = this.moveHistory.length === 0;
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('bg-sound', this.soundEnabled);
        const toggle = document.getElementById('sound-toggle');
        if (toggle) {
            toggle.innerHTML = this.soundEnabled ? '🔊' : '🔇';
        }
        this.playSound('click');
    }

    playSound(type) {
        if (!this.soundEnabled) return;

        // Using Web Audio API for simple sound effects
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const sounds = {
            click: { freq: 300, duration: 0.05 },
            dice: { freq: 400, duration: 0.1 },
            move: { freq: 500, duration: 0.08 },
            hit: { freq: 200, duration: 0.15 },
            win: { freq: 600, duration: 0.3 },
            undo: { freq: 350, duration: 0.1 }
        };

        const sound = sounds[type] || sounds.click;
        oscillator.frequency.value = sound.freq;
        gainNode.gain.value = 0.1;

        oscillator.start();
        setTimeout(() => oscillator.stop(), sound.duration * 1000);
    }

    showHelp() {
        const helpOverlay = document.createElement('div');
        helpOverlay.className = 'help-overlay';
        helpOverlay.innerHTML = `
            <div class="help-content">
                <h2>🎲 How to Play Backgammon</h2>
                <ul>
                    <li><strong>Objective:</strong> Move all 15 checkers to your home board and bear them off before your opponent</li>
                    <li><strong>Rolling Dice:</strong> Click "Roll Dice" to start your turn</li>
                    <li><strong>Moving:</strong> Click a checker, then click a highlighted valid destination</li>
                    <li><strong>Hitting:</strong> Land on a single opponent checker to send it to the bar</li>
                    <li><strong>Bearing Off:</strong> Remove checkers once all are in your home board (points 1-6 for white, 19-24 for black)</li>
                    <li><strong>Doubles:</strong> Rolling the same number gives you 4 moves instead of 2</li>
                    <li><strong>Keyboard Shortcuts:</strong>
                        <ul>
                            <li><strong>R</strong> - Roll dice</li>
                            <li><strong>Ctrl+U</strong> - Undo last move</li>
                            <li><strong>H or ?</strong> - Show this help</li>
                            <li><strong>Esc</strong> - Deselect checker</li>
                        </ul>
                    </li>
                </ul>
                <button class="btn-close-help">Close</button>
            </div>
        `;
        document.body.appendChild(helpOverlay);

        // Close help on button click or overlay click
        helpOverlay.querySelector('.btn-close-help').addEventListener('click', () => {
            helpOverlay.remove();
        });
        helpOverlay.addEventListener('click', (e) => {
            if (e.target === helpOverlay) helpOverlay.remove();
        });
    }

    updateMoveHistory() {
        const moveList = document.getElementById('move-list');
        if (!moveList) return;

        if (this.moveHistory.length === 0) {
            moveList.innerHTML = '<p style="color: #999; text-align: center;">No moves yet</p>';
            return;
        }

        const lastMoves = this.moveHistory.slice(-10); // Show last 10 moves
        moveList.innerHTML = lastMoves.map((move, idx) => {
            const moveNum = this.moveHistory.length - lastMoves.length + idx + 1;
            const fromStr = move.from === 0 ? 'bar' : `point ${move.from}`;
            const toStr = move.to === 25 ? 'off' : `point ${move.to}`;
            const hitStr = move.hit ? ' (hit!)' : '';
            return `<div class="move-item ${move.player}">
                ${moveNum}. ${move.player}: ${fromStr} → ${toStr}${hitStr}
            </div>`;
        }).join('');

        // Auto-scroll to bottom
        moveList.scrollTop = moveList.scrollHeight;
    }

    showMessage(title, text, duration = 2000) {
        const existing = document.querySelector('.game-message');
        if (existing) existing.remove();

        const message = document.createElement('div');
        message.className = 'game-message';
        message.innerHTML = `
            <h2>${title}</h2>
            <p>${text}</p>
        `;
        document.body.appendChild(message);

        setTimeout(() => {
            message.remove();
        }, duration);
    }

    render() {
        // Clear all checkers
        document.querySelectorAll('.checker').forEach(c => c.remove());

        // Render board state
        this.board.forEach((point, index) => {
            if (index === 0) {
                // Bar
                const bar = document.getElementById('bar');
                point.forEach((color, i) => {
                    const checker = this.createChecker(color);
                    checker.style.top = `${i * 30}px`;
                    bar.appendChild(checker);
                });
            } else if (index === 25) {
                // Home areas handled separately
            } else {
                // Regular points
                const pointElement = document.getElementById(`point-${index}`);
                if (pointElement) {
                    point.forEach((color, i) => {
                        const checker = this.createChecker(color);
                        if (index <= 12) {
                            // Bottom row
                            checker.style.bottom = `${i * 30}px`;
                        } else {
                            // Top row
                            checker.style.top = `${i * 30}px`;
                        }
                        pointElement.appendChild(checker);
                    });
                }
            }
        });

        // Update statistics
        document.getElementById('white-home-count').textContent = this.stats.white.piecesHome;
        document.getElementById('white-off-count').textContent = this.stats.white.piecesOff;
        document.getElementById('black-home-count').textContent = this.stats.black.piecesHome;
        document.getElementById('black-off-count').textContent = this.stats.black.piecesOff;
    }

    createChecker(color) {
        const checker = document.createElement('div');
        checker.className = `checker ${color}`;
        return checker;
    }

    /**
     * Initialize multiplayer functionality
     */
    initMultiplayer() {
        // Listen for game mode changes
        document.querySelectorAll('input[name="gameMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handleGameModeChange(e.target.value);
            });
        });

        // Host game button
        const hostBtn = document.getElementById('btn-host-game');
        if (hostBtn) {
            hostBtn.addEventListener('click', () => this.hostOnlineGame());
        }

        // Join game button
        const joinBtn = document.getElementById('btn-join-game');
        if (joinBtn) {
            joinBtn.addEventListener('click', () => this.joinOnlineGame());
        }

        // Copy link button
        const copyBtn = document.getElementById('btn-copy-link');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyGameLink());
        }

        // Check URL for game ID (auto-join)
        this.checkAutoJoin();
    }

    /**
     * Handle game mode selection
     */
    handleGameModeChange(mode) {
        const hostUI = document.getElementById('host-ui');
        const joinUI = document.getElementById('join-ui');
        const linkDisplay = document.getElementById('game-link-display');

        // Hide all UIs
        hostUI.style.display = 'none';
        joinUI.style.display = 'none';
        if (linkDisplay) linkDisplay.style.display = 'none';

        // Show appropriate UI
        if (mode === 'host') {
            hostUI.style.display = 'block';
            this.gameMode = 'local'; // Not online until game is created
        } else if (mode === 'join') {
            joinUI.style.display = 'block';
            this.gameMode = 'local';
        } else {
            this.gameMode = 'local';
            // Disconnect from multiplayer if connected
            if (this.multiplayer) {
                this.multiplayer.disconnect();
                this.multiplayer = null;
            }
        }
    }

    /**
     * Host an online game
     */
    hostOnlineGame() {
        console.log('Hosting online game...');

        // Initialize multiplayer if needed
        if (!this.multiplayer) {
            this.multiplayer = new BackgammonMultiplayer(this);
        }

        // Host game and get ID
        const gameId = this.multiplayer.hostGame();

        // Show game link
        const linkDisplay = document.getElementById('game-link-display');
        const linkInput = document.getElementById('game-link-input');
        const link = this.multiplayer.getGameLink();

        linkInput.value = link;
        linkDisplay.style.display = 'block';

        this.gameMode = 'online-host';

        this.showStatus('Hosting game... Waiting for opponent', 'info');

        console.log('Game hosted with ID:', gameId);
        console.log('Share link:', link);
    }

    /**
     * Join an online game
     */
    joinOnlineGame() {
        const input = document.getElementById('game-id-input');
        let gameId = input.value.trim();

        if (!gameId) {
            this.showStatus('Please enter a game ID or link', 'error');
            return;
        }

        // Extract game ID from URL if full link was pasted
        if (gameId.includes('?game=')) {
            gameId = gameId.split('?game=')[1].split('&')[0];
        }

        console.log('Joining game:', gameId);

        // Initialize multiplayer if needed
        if (!this.multiplayer) {
            this.multiplayer = new BackgammonMultiplayer(this);
        }

        // Join game
        this.multiplayer.joinGame(gameId);
        this.gameMode = 'online-guest';

        this.showStatus('Connecting to game...', 'info');
    }

    /**
     * Copy game link to clipboard
     */
    copyGameLink() {
        const linkInput = document.getElementById('game-link-input');
        linkInput.select();
        linkInput.setSelectionRange(0, 99999); // For mobile devices

        navigator.clipboard.writeText(linkInput.value).then(() => {
            this.showStatus('Link copied! Send it to your friend.', 'success');
        }).catch(() => {
            // Fallback for older browsers
            document.execCommand('copy');
            this.showStatus('Link copied! Send it to your friend.', 'success');
        });
    }

    /**
     * Check URL for auto-join
     */
    checkAutoJoin() {
        const urlParams = new URLSearchParams(window.location.search);
        const gameId = urlParams.get('game');

        if (gameId) {
            console.log('Auto-joining game from URL:', gameId);

            // Select "Join Game" mode
            const joinRadio = document.querySelector('input[value="join"]');
            if (joinRadio) {
                joinRadio.checked = true;
                this.handleGameModeChange('join');

                // Fill in game ID and auto-join
                const input = document.getElementById('game-id-input');
                if (input) {
                    input.value = gameId;
                    // Auto-join after a brief delay
                    setTimeout(() => this.joinOnlineGame(), 500);
                }
            }
        }
    }

    /**
     * Show connection status
     */
    showStatus(message, type) {
        const statusEl = document.getElementById('connection-status');
        const statusText = document.getElementById('status-text');

        if (!statusEl || !statusText) return;

        statusEl.style.display = 'block';
        statusText.textContent = message;

        // Color based on type
        if (type === 'success') {
            statusEl.style.background = '#d4edda';
            statusEl.style.color = '#155724';
        } else if (type === 'error') {
            statusEl.style.background = '#f8d7da';
            statusEl.style.color = '#721c24';
        } else {
            statusEl.style.background = '#d1ecf1';
            statusEl.style.color = '#0c5460';
        }

        // Auto-hide after 3 seconds for success/error
        if (type !== 'info') {
            setTimeout(() => {
                statusEl.style.display = 'none';
            }, 3000);
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.backgammonGame = new BackgammonGame();
});
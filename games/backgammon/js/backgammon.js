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

        // Initialize UI
        this.initializeUI();
        this.bindEvents();
        this.render();
    }

    initializeBoard() {
        // Backgammon starting position
        // Points numbered 1-24, with bar at position 0 and home at position 25
        const board = Array(26).fill(null).map(() => []);

        // White pieces starting position
        board[1] = ['white', 'white'];
        board[12] = ['white', 'white', 'white', 'white', 'white'];
        board[17] = ['white', 'white', 'white'];
        board[19] = ['white', 'white', 'white', 'white', 'white'];

        // Black pieces starting position
        board[24] = ['black', 'black'];
        board[13] = ['black', 'black', 'black', 'black', 'black'];
        board[8] = ['black', 'black', 'black'];
        board[6] = ['black', 'black', 'black', 'black', 'black'];

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

        // Create top row (points 13-24)
        for (let i = 13; i <= 24; i++) {
            if (i === 19) {
                // Add bar in the middle
                const bar = document.createElement('div');
                bar.className = 'bar';
                bar.id = 'bar';
                bar.dataset.position = '0';
                container.appendChild(bar);
            }

            const point = document.createElement('div');
            point.className = `point top ${i % 2 === 0 ? 'dark' : 'light'}`;
            point.dataset.position = i;
            point.id = `point-${i}`;
            container.appendChild(point);
        }

        // Create bottom row (points 12-1)
        for (let i = 12; i >= 1; i--) {
            if (i === 6) {
                // Bar already added, skip
                continue;
            }

            const point = document.createElement('div');
            point.className = `point bottom ${i % 2 === 0 ? 'dark' : 'light'}`;
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
            <button class="btn-game btn-undo" id="undo-move">Undo Move</button>
            <button class="btn-game btn-new-game" id="new-game">New Game</button>
        `;
        document.querySelector('.game-board-wrapper').appendChild(controls);
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
            newGameBtn.addEventListener('click', () => this.resetGame());
        }

        // Undo button
        const undoBtn = document.getElementById('undo-move');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.undoLastMove());
        }

        // Point click events
        document.querySelectorAll('.point, .bar, .home-area').forEach(point => {
            point.addEventListener('click', (e) => this.handlePointClick(e));
        });

        // Checker drag events
        this.enableCheckerDrag();
    }

    enableCheckerDrag() {
        document.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('checker')) {
                this.handleCheckerClick(e.target);
            }
        });
    }

    rollDice() {
        // Animate dice roll
        const die1 = document.getElementById('die1');
        const die2 = document.getElementById('die2');

        die1.classList.add('rolling');
        die2.classList.add('rolling');

        setTimeout(() => {
            // Generate random dice values
            this.dice[0] = Math.floor(Math.random() * 6) + 1;
            this.dice[1] = Math.floor(Math.random() * 6) + 1;

            // Update dice display
            die1.textContent = this.getDiceSymbol(this.dice[0]);
            die2.textContent = this.getDiceSymbol(this.dice[1]);

            die1.classList.remove('rolling');
            die2.classList.remove('rolling');

            // Calculate available moves
            if (this.dice[0] === this.dice[1]) {
                // Doubles - player can move 4 times
                this.movesRemaining = [this.dice[0], this.dice[0], this.dice[0], this.dice[0]];
                this.stats[this.currentPlayer].doubletsRolled++;
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

        // Remove checker from source
        const sourceIndex = this.board[from].indexOf(player);
        this.board[from].splice(sourceIndex, 1);

        // Handle destination
        if (to === 25) {
            // Bear off
            this.stats[player].piecesOff++;
        } else {
            // Check for hit
            if (this.board[to].length === 1 && this.board[to][0] !== player) {
                // Hit opponent's blot
                const opponent = this.board[to][0];
                this.board[to] = [];
                this.board[0].push(opponent); // Send to bar
            }

            // Add checker to destination
            this.board[to].push(player);
        }

        // Remove used die from moves
        const dieIndex = this.movesRemaining.indexOf(die);
        this.movesRemaining.splice(dieIndex, 1);

        // Update UI
        this.deselectChecker();
        this.render();

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

        // Show victory message
        const message = document.createElement('div');
        message.className = 'game-message';
        message.innerHTML = `
            <h2>🏆 ${winner.toUpperCase()} WINS! 🏆</h2>
            <p>Congratulations!</p>
            <button class="btn-jerusalem-primary" onclick="backgammonGame.resetGame()">Play Again</button>
        `;
        document.body.appendChild(message);

        setTimeout(() => {
            message.remove();
        }, 5000);
    }

    resetGame() {
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

        // Reset UI
        document.getElementById('die1').textContent = '?';
        document.getElementById('die2').textContent = '?';
        document.getElementById('roll-dice').disabled = false;
        document.getElementById('white-player').classList.add('active');
        document.getElementById('black-player').classList.remove('active');

        // Re-render board
        this.render();
    }

    undoLastMove() {
        // TODO: Implement move history and undo functionality
        this.showMessage('Undo', 'This feature is coming soon!');
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
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.backgammonGame = new BackgammonGame();
});
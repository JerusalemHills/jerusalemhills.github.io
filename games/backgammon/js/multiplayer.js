/**
 * Jerusalem Hills Backgammon - GunDB Multiplayer
 * ================================================
 * P2P multiplayer using GunDB for real-time game synchronization
 */

class BackgammonMultiplayer {
    constructor(game) {
        this.game = game;
        this.gun = null;
        this.gameNode = null;
        this.gameId = null;
        this.playerId = null;
        this.playerColor = null;
        this.isHost = false;
        this.opponentConnected = false;
        this.initialized = false;
    }

    /**
     * Initialize GunDB connection
     */
    init() {
        if (this.initialized) return;

        // Initialize Gun with relay servers
        this.gun = Gun([
            'https://gun-manhattan.herokuapp.com/gun',
            'https://gun-us.herokuapp.com/gun'
        ]);

        // Generate unique player ID
        this.playerId = this.generatePlayerId();

        console.log('Multiplayer: Initialized with player ID:', this.playerId);
        this.initialized = true;
    }

    /**
     * Generate unique player ID
     */
    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    /**
     * Generate unique game ID
     */
    generateGameId() {
        return 'bg_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Host a new game
     * @returns {string} Game ID for sharing
     */
    hostGame() {
        this.init();

        this.gameId = this.generateGameId();
        this.isHost = true;
        this.playerColor = 'white'; // Host is always white

        console.log('Multiplayer: Hosting game with ID:', this.gameId);

        // Create game node in Gun
        this.gameNode = this.gun.get('backgammon').get(this.gameId);

        // Initialize game state
        const initialState = {
            gameId: this.gameId,
            host: this.playerId,
            hostColor: 'white',
            guest: null,
            guestColor: 'black',
            board: JSON.stringify(this.game.board),
            currentPlayer: 'white',
            dice: [0, 0],
            movesRemaining: [],
            lastMove: null,
            gameStarted: false,
            winner: null,
            timestamp: Date.now()
        };

        this.gameNode.put(initialState);

        // Listen for opponent joining
        this.listenForOpponent();

        // Listen for game updates
        this.listenForUpdates();

        return this.gameId;
    }

    /**
     * Join an existing game
     * @param {string} gameId - Game ID to join
     */
    async joinGame(gameId) {
        this.init();

        this.gameId = gameId;
        this.isHost = false;
        this.playerColor = 'black'; // Guest is always black

        console.log('Multiplayer: Joining game:', gameId);

        // Get game node
        this.gameNode = this.gun.get('backgammon').get(gameId);

        // Check if game exists and join
        this.gameNode.once((data) => {
            if (!data) {
                this.showError('Game not found. Please check the game ID.');
                return;
            }

            if (data.guest && data.guest !== this.playerId) {
                this.showError('Game is full. Please create a new game.');
                return;
            }

            // Join as guest
            this.gameNode.get('guest').put(this.playerId);
            this.gameNode.get('timestamp').put(Date.now());

            console.log('Multiplayer: Successfully joined game');
            this.opponentConnected = true;

            // Sync board state
            this.syncBoardState(data);

            // Listen for updates
            this.listenForUpdates();

            this.showMessage('Connected!', 'You joined the game as Black player.');
        });
    }

    /**
     * Listen for opponent joining
     */
    listenForOpponent() {
        this.gameNode.get('guest').on((guestId) => {
            if (guestId && guestId !== this.playerId) {
                console.log('Multiplayer: Opponent connected:', guestId);
                this.opponentConnected = true;
                this.showMessage('Opponent Connected!', 'Your opponent has joined. Game can begin!');
            }
        });
    }

    /**
     * Listen for game updates
     */
    listenForUpdates() {
        // Listen for board updates
        this.gameNode.get('board').on((boardData) => {
            if (!boardData) return;

            // Don't update if it's our own move
            this.gameNode.get('lastMove').once((lastMove) => {
                if (lastMove && lastMove.playerId === this.playerId) {
                    return;
                }

                console.log('Multiplayer: Received board update');
                this.syncBoardState({ board: boardData });
            });
        });

        // Listen for dice rolls
        this.gameNode.get('dice').on((dice) => {
            if (!dice) return;

            this.gameNode.get('lastMove').once((lastMove) => {
                if (lastMove && lastMove.playerId === this.playerId) {
                    return;
                }

                console.log('Multiplayer: Opponent rolled dice:', dice);
                this.game.dice = dice;
                this.updateDiceDisplay();
            });
        });

        // Listen for current player changes
        this.gameNode.get('currentPlayer').on((player) => {
            if (!player) return;

            console.log('Multiplayer: Current player is now:', player);
            this.game.currentPlayer = player;
            this.updateTurnIndicator();
        });

        // Listen for winner
        this.gameNode.get('winner').on((winner) => {
            if (winner) {
                console.log('Multiplayer: Game won by:', winner);
                this.game.winner = winner;
                this.game.endGame(winner);
            }
        });
    }

    /**
     * Sync local board state with remote
     */
    syncBoardState(data) {
        if (data.board) {
            try {
                this.game.board = JSON.parse(data.board);
                this.game.render();
                console.log('Multiplayer: Board synced');
            } catch (e) {
                console.error('Multiplayer: Failed to parse board data', e);
            }
        }

        if (data.currentPlayer) {
            this.game.currentPlayer = data.currentPlayer;
            this.updateTurnIndicator();
        }

        if (data.dice && Array.isArray(data.dice)) {
            this.game.dice = data.dice;
            this.updateDiceDisplay();
        }

        if (data.movesRemaining && Array.isArray(data.movesRemaining)) {
            this.game.movesRemaining = data.movesRemaining;
        }
    }

    /**
     * Broadcast move to opponent
     */
    broadcastMove(move) {
        if (!this.gameNode || !this.opponentConnected) {
            console.warn('Multiplayer: Cannot broadcast - not connected');
            return;
        }

        console.log('Multiplayer: Broadcasting move:', move);

        // Update game state
        this.gameNode.get('board').put(JSON.stringify(this.game.board));
        this.gameNode.get('currentPlayer').put(this.game.currentPlayer);
        this.gameNode.get('movesRemaining').put(this.game.movesRemaining);
        this.gameNode.get('lastMove').put({
            playerId: this.playerId,
            move: move,
            timestamp: Date.now()
        });
        this.gameNode.get('timestamp').put(Date.now());
    }

    /**
     * Broadcast dice roll
     */
    broadcastDiceRoll(dice) {
        if (!this.gameNode || !this.opponentConnected) {
            console.warn('Multiplayer: Cannot broadcast dice - not connected');
            return;
        }

        console.log('Multiplayer: Broadcasting dice roll:', dice);

        this.gameNode.get('dice').put(dice);
        this.gameNode.get('lastMove').put({
            playerId: this.playerId,
            action: 'roll',
            timestamp: Date.now()
        });
        this.gameNode.get('timestamp').put(Date.now());
    }

    /**
     * Broadcast game end
     */
    broadcastWin(winner) {
        if (!this.gameNode) return;

        console.log('Multiplayer: Broadcasting win:', winner);
        this.gameNode.get('winner').put(winner);
        this.gameNode.get('timestamp').put(Date.now());
    }

    /**
     * Check if it's this player's turn
     */
    isMyTurn() {
        return this.game.currentPlayer === this.playerColor;
    }

    /**
     * Disconnect from game
     */
    disconnect() {
        if (this.gameNode) {
            console.log('Multiplayer: Disconnecting from game');

            // Mark as disconnected (don't delete the game, allow reconnection)
            if (this.isHost) {
                this.gameNode.get('hostConnected').put(false);
            } else {
                this.gameNode.get('guestConnected').put(false);
            }
        }

        this.opponentConnected = false;
        this.gameNode = null;
    }

    /**
     * Update dice display
     */
    updateDiceDisplay() {
        const die1 = document.getElementById('die1');
        const die2 = document.getElementById('die2');

        if (die1 && this.game.dice[0]) {
            die1.textContent = this.game.getDiceSymbol(this.game.dice[0]);
        }
        if (die2 && this.game.dice[1]) {
            die2.textContent = this.game.getDiceSymbol(this.game.dice[1]);
        }
    }

    /**
     * Update turn indicator
     */
    updateTurnIndicator() {
        const whitePlayer = document.getElementById('white-player');
        const blackPlayer = document.getElementById('black-player');

        if (whitePlayer && blackPlayer) {
            whitePlayer.classList.toggle('active', this.game.currentPlayer === 'white');
            blackPlayer.classList.toggle('active', this.game.currentPlayer === 'black');
        }

        // Update turn message
        const isMyTurn = this.isMyTurn();
        const message = isMyTurn ? "Your turn!" : "Opponent's turn...";
        const status = document.getElementById('game-status');
        if (status) {
            status.textContent = message;
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        if (this.game && typeof this.game.showMessage === 'function') {
            this.game.showMessage('Error', message);
        } else {
            alert(message);
        }
    }

    /**
     * Show info message
     */
    showMessage(title, message) {
        if (this.game && typeof this.game.showMessage === 'function') {
            this.game.showMessage(title, message, 3000);
        } else {
            alert(title + '\n\n' + message);
        }
    }

    /**
     * Get shareable game link
     */
    getGameLink() {
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?game=${this.gameId}`;
    }
}

// Export for use in backgammon.js
window.BackgammonMultiplayer = BackgammonMultiplayer;

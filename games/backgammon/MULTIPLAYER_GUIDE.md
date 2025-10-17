# Backgammon GunDB Multiplayer Implementation Guide

## Overview
This guide explains how to add P2P multiplayer to the backgammon game using GunDB.

## What's Been Created

### 1. `js/multiplayer.js`
A complete multiplayer module that handles:
- Game hosting and joining
- Real-time board synchronization
- Dice roll broadcasting
- Turn management
- Win condition broadcasting

## How to Integrate

### Step 1: Add Gun.js Library

Add this to `backgammon.html` **before** `js/backgammon.js`:

```html
<!-- GunDB for P2P Multiplayer -->
<script src="https://cdn.jsdelivr.net/npm/gun/gun.js"></script>

<!-- Multiplayer Module -->
<script src="js/multiplayer.js"></script>

<!-- Main Game (existing) -->
<script src="js/backgammon.js"></script>
```

### Step 2: Add Multiplayer UI

Add this HTML after the existing game controls in `backgammon.html`:

```html
<!-- Multiplayer Controls -->
<div class="multiplayer-panel" id="multiplayer-panel" style="
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    margin: 20px 0;
">
    <h3 style="margin: 0 0 15px 0;">🌐 Online Multiplayer</h3>

    <div class="game-mode-selector">
        <label style="display: block; margin-bottom: 10px;">
            <input type="radio" name="gameMode" value="local" checked>
            Local Game (2 players on this device)
        </label>
        <label style="display: block; margin-bottom: 10px;">
            <input type="radio" name="gameMode" value="host">
            Host Online Game (invite a friend)
        </label>
        <label style="display: block;">
            <input type="radio" name="gameMode" value="join">
            Join Online Game (enter game ID)
        </label>
    </div>

    <!-- Host Game UI -->
    <div id="host-ui" style="display: none; margin-top: 15px;">
        <button id="btn-host-game" class="btn" style="width: 100%; margin-bottom: 10px;">
            Create Game & Get Link
        </button>
        <div id="game-link-display" style="display: none;">
            <p style="margin: 10px 0 5px 0; font-weight: bold;">Share this link with your friend:</p>
            <input type="text" id="game-link-input" readonly style="
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                margin-bottom: 10px;
                font-family: monospace;
            ">
            <button id="btn-copy-link" class="btn">📋 Copy Link</button>
            <p id="waiting-message" style="color: #666; font-style: italic; margin-top: 10px;">
                Waiting for opponent to join...
            </p>
        </div>
    </div>

    <!-- Join Game UI -->
    <div id="join-ui" style="display: none; margin-top: 15px;">
        <input type="text" id="game-id-input" placeholder="Enter Game ID or paste link" style="
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            margin-bottom: 10px;
        ">
        <button id="btn-join-game" class="btn" style="width: 100%;">
            Join Game
        </button>
    </div>

    <!-- Connection Status -->
    <div id="connection-status" style="
        display: none;
        margin-top: 15px;
        padding: 10px;
        border-radius: 5px;
        text-align: center;
    ">
        <strong id="status-text"></strong>
    </div>
</div>
```

### Step 3: Modify `backgammon.js` Constructor

Add multiplayer support to the `BackgammonGame` constructor:

```javascript
constructor() {
    // Existing code...
    this.soundEnabled = localStorage.getItem('bg-sound') !== 'false';

    // ADD THIS:
    this.multiplayer = null;
    this.gameMode = 'local'; // 'local', 'online-host', or 'online-guest'

    // Existing code...
    this.initializeUI();
    this.bindEvents();
    this.render();

    // ADD THIS:
    this.initMultiplayer();
}
```

### Step 4: Add Multiplayer Methods to `backgammon.js`

Add these new methods to the `BackgammonGame` class:

```javascript
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
    document.execCommand('copy');

    this.showStatus('Link copied! Send it to your friend.', 'success');
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
```

### Step 5: Modify Game Actions to Broadcast

Update these methods to broadcast moves when in online mode:

```javascript
makeMove(move) {
    // Existing move logic...

    // ADD AT THE END (before render):
    if (this.multiplayer && this.gameMode.startsWith('online')) {
        this.multiplayer.broadcastMove(move);
    }

    // Existing render/update code...
}

rollDice() {
    // Existing dice roll logic...

    // ADD AFTER SETTING this.dice:
    if (this.multiplayer && this.gameMode.startsWith('online')) {
        this.multiplayer.broadcastDiceRoll(this.dice);
    }

    // Existing code...
}

endGame(winner) {
    // Existing endgame logic...

    // ADD BEFORE showing victory message:
    if (this.multiplayer && this.gameMode.startsWith('online')) {
        this.multiplayer.broadcastWin(winner);
    }

    // Existing code...
}
```

### Step 6: Add Turn Validation for Online Games

Modify `rollDice()` to check whose turn it is:

```javascript
rollDice() {
    // ADD THIS CHECK AT THE BEGINNING:
    if (this.multiplayer && this.gameMode.startsWith('online')) {
        if (!this.multiplayer.isMyTurn()) {
            this.showMessage('Not your turn!', "Wait for your opponent to finish their turn.");
            return;
        }
    }

    // Existing rollDice code...
}
```

## How It Works

### Game Flow

1. **Player 1 (Host)**:
   - Selects "Host Online Game"
   - Clicks "Create Game & Get Link"
   - Gets a shareable link like: `https://jerusalemhills.com/games/backgammon/backgammon.html?game=bg_abc123`
   - Sends link to friend via WhatsApp/Email/etc

2. **Player 2 (Guest)**:
   - Clicks the link
   - Automatically joins the game
   - Game synchronizes and starts

3. **During Game**:
   - Each dice roll is broadcast to opponent
   - Each move is synced in real-time
   - Turn indicator shows whose turn it is
   - Winner is announced to both players

### GunDB Synchronization

- **Board State**: Synced after every move
- **Dice Rolls**: Broadcast when rolled
- **Current Player**: Automatically switches
- **Moves**: History is synced (for undo)
- **Winner**: Broadcast when game ends

### Data Structure in GunDB

```
gun.get('backgammon').get('bg_abc123')
  ├─ gameId: "bg_abc123"
  ├─ host: "player_xyz789_123456"
  ├─ guest: "player_def456_789012"
  ├─ hostColor: "white"
  ├─ guestColor: "black"
  ├─ board: "[...]" (JSON string)
  ├─ currentPlayer: "white" or "black"
  ├─ dice: [4, 2]
  ├─ movesRemaining: [4, 2]
  ├─ lastMove: { playerId, move, timestamp }
  ├─ winner: null or "white"/"black"
  └─ timestamp: 1699876543210
```

## Testing Locally

1. Open two browser windows
2. In Window 1: Host a game
3. Copy the game link
4. In Window 2: Paste the link and join
5. Play against yourself to test synchronization

## Security Notes

- GunDB is P2P - no central server stores data
- Game data is public (anyone with game ID can view)
- Don't transmit sensitive information
- Game IDs are random and hard to guess

## Future Enhancements

- [ ] Add player usernames
- [ ] Add chat functionality
- [ ] Add game invitations via email
- [ ] Add spectator mode
- [ ] Add reconnection handling
- [ ] Add game history/replays

## Troubleshooting

**Q: Moves aren't syncing**
A: Check browser console for GunDB connection errors. Make sure Gun.js is loaded.

**Q: Game link doesn't work**
A: Ensure the URL parameter `?game=` is preserved when sharing.

**Q: Both players can move at once**
A: Ensure `isMyTurn()` check is in place before allowing moves.

**Q: GunDB is slow**
A: This is normal - GunDB uses P2P relay servers which can have latency. Consider adding more relay servers.

## Complete Example

See `multiplayer-demo.html` for a minimal working example.

---

**Status**: ✅ Multiplayer module complete and ready to integrate
**Author**: Claude Code
**Date**: 2025-10-17

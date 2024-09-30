const gameBoard = document.getElementById('gameBoard');
const dice1 = document.getElementById('dice1');
const dice2 = document.getElementById('dice2');
const turnDisplay = document.getElementById('turn');

let currentPlayer = 'white';
let board = Array(24).fill(null).map(() => []);
let dice = [0, 0];

// Initialize board
function initializeBoard() {
    for (let i = 0; i < 24; i++) {
        const point = document.createElement('div');
        point.classList.add('point');
        point.setAttribute('data-point', i);
        point.addEventListener('click', () => movePiece(i));
        gameBoard.appendChild(point);
    }

    // Add initial pieces
    placeInitialPieces();
}

// Place pieces in the starting position
function placeInitialPieces() {
    // Example setup, real setup is complex but follows a pattern
    addPiece(0, 'white', 2);
    addPiece(5, 'black', 5);
    addPiece(7, 'white', 3);
    addPiece(11, 'black', 5);
    addPiece(12, 'white', 5);
    addPiece(16, 'black', 3);
    addPiece(18, 'white', 5);
    addPiece(23, 'black', 2);
}

// Add pieces to a specific point
function addPiece(point, color, count) {
    const pointDiv = gameBoard.querySelector(`[data-point="${point}"]`);
    for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.classList.add('piece', color);
        pointDiv.appendChild(piece);
        board[point].push(color);
    }
}

// Roll the dice
function rollDice() {
    dice[0] = Math.floor(Math.random() * 6) + 1;
    dice[1] = Math.floor(Math.random() * 6) + 1;
    dice1.textContent = dice[0];
    dice2.textContent = dice[1];
    turnDisplay.textContent = `Player: ${currentPlayer === 'white' ? 'White' : 'Black'}`;
}

// Move piece from a point (simplified logic)
function movePiece(fromPoint) {
    const point = board[fromPoint];
    if (point.length === 0 || point[0] !== currentPlayer) {
        alert("Invalid move! Not your piece.");
        return;
    }

    // Example: move first piece of current player based on dice roll
    let moveBy = dice[0]; // Simplified, just using the first dice for now
    let toPoint = currentPlayer === 'white' ? fromPoint + moveBy : fromPoint - moveBy;

    // Check for valid destination
    if (toPoint < 0 || toPoint > 23) {
        alert("Move out of bounds.");
        return;
    }

    // Perform the move
    board[fromPoint].pop();
    const pointDiv = gameBoard.querySelector(`[data-point="${fromPoint}"]`);
    pointDiv.removeChild(pointDiv.lastChild);

    addPiece(toPoint, currentPlayer, 1);

    // Switch player
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    turnDisplay.textContent = `Player: ${currentPlayer === 'white' ? 'White' : 'Black'}`;
}

// Start the game
initializeBoard();
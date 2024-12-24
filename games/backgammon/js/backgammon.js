document.addEventListener("DOMContentLoaded", () => {
    // Initialize board and game state
    const board = document.getElementById("backgammon-board");
    const dice = document.getElementById("dice");
    const rollButton = document.getElementById("roll-dice");
    const message = document.getElementById("game-message");
  
    let currentPlayer = "White";
  
    // Roll dice
    rollButton.addEventListener("click", () => {
      const die1 = Math.floor(Math.random() * 6) + 1;
      const die2 = Math.floor(Math.random() * 6) + 1;
      dice.textContent = `Rolled: ${die1}, ${die2}`;
      message.textContent = `${currentPlayer} rolls ${die1} and ${die2}. Make your move!`;
    });
  
    // Handle player moves
    board.addEventListener("click", (event) => {
      const target = event.target;
  
      if (target.classList.contains("piece") || target.classList.contains("point")) {
        // Implement movement logic
        message.textContent = `${currentPlayer} is thinking...`;
      }
    });
  
    // End turn
    const endTurnButton = document.getElementById("end-turn");
    endTurnButton.addEventListener("click", () => {
      currentPlayer = currentPlayer === "White" ? "Black" : "White";
      message.textContent = `It's ${currentPlayer}'s turn. Roll the dice to start.`;
    });
  });
  
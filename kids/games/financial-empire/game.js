// Financial Empire Game - Educational Monopoly with Financial Statements
class FinancialEmpireGame {
    constructor() {
        this.difficulty = 'easy';
        this.currentPlayer = 0;
        this.players = [];
        this.properties = [];
        this.gameState = 'setup';
        this.currentPosition = 0;
        this.diceResults = [0, 0];
        this.gameHistory = [];
        
        this.init();
    }

    init() {
        this.setupProperties();
        this.setupPlayers();
        this.setupEventListeners();
        this.initializeBoard();
        this.updateFinancialStatements();
        this.addMessage('Welcome to Financial Empire! Learn money management while having fun!', 'info');
        console.log('🏦 Financial Empire Game initialized!');
    }

    setupProperties() {
        this.properties = [
            // Bottom row (right to left)
            { id: 0, name: 'GO', type: 'corner', color: 'go', price: 0, rent: [0], position: [10, 10] },
            { id: 1, name: 'Park Place', type: 'property', color: 'blue', price: 350, rent: [35, 175, 500, 1100, 1300, 1500], position: [9, 10] },
            { id: 2, name: 'Luxury Tax', type: 'tax', color: 'tax', price: 0, rent: [100], position: [8, 10] },
            { id: 3, name: 'Boardwalk', type: 'property', color: 'blue', price: 400, rent: [50, 200, 600, 1400, 1700, 2000], position: [7, 10] },
            { id: 4, name: 'Go to Jail', type: 'corner', color: 'jail', price: 0, rent: [0], position: [6, 10] },
            { id: 5, name: 'Pacific Ave', type: 'property', color: 'green', price: 300, rent: [26, 130, 390, 900, 1100, 1275], position: [5, 10] },
            { id: 6, name: 'Community Chest', type: 'chance', color: 'community', price: 0, rent: [0], position: [4, 10] },
            { id: 7, name: 'Pennsylvania Ave', type: 'property', color: 'green', price: 320, rent: [28, 150, 450, 1000, 1200, 1400], position: [3, 10] },
            { id: 8, name: 'Short Line RR', type: 'railroad', color: 'railroad', price: 200, rent: [25, 50, 100, 200], position: [2, 10] },
            { id: 9, name: 'Chance', type: 'chance', color: 'chance', price: 0, rent: [0], position: [1, 10] },
            { id: 10, name: 'Jail/Visiting', type: 'corner', color: 'jail', price: 0, rent: [0], position: [0, 10] },
            
            // Left side (bottom to top)
            { id: 11, name: 'Kentucky Ave', type: 'property', color: 'red', price: 220, rent: [18, 90, 250, 700, 875, 1050], position: [0, 9] },
            { id: 12, name: 'Indiana Ave', type: 'property', color: 'red', price: 220, rent: [18, 90, 250, 700, 875, 1050], position: [0, 8] },
            { id: 13, name: 'Illinois Ave', type: 'property', color: 'red', price: 240, rent: [20, 100, 300, 750, 925, 1100], position: [0, 7] },
            { id: 14, name: 'B&O Railroad', type: 'railroad', color: 'railroad', price: 200, rent: [25, 50, 100, 200], position: [0, 6] },
            { id: 15, name: 'Atlantic Ave', type: 'property', color: 'yellow', price: 260, rent: [22, 110, 330, 800, 975, 1150], position: [0, 5] },
            { id: 16, name: 'Ventnor Ave', type: 'property', color: 'yellow', price: 260, rent: [22, 110, 330, 800, 975, 1150], position: [0, 4] },
            { id: 17, name: 'Water Works', type: 'utility', color: 'utility', price: 150, rent: [4, 10], position: [0, 3] },
            { id: 18, name: 'Marvin Gardens', type: 'property', color: 'yellow', price: 280, rent: [24, 120, 360, 850, 1025, 1200], position: [0, 2] },
            { id: 19, name: 'Free Parking', type: 'corner', color: 'parking', price: 0, rent: [0], position: [0, 1] },
            { id: 20, name: 'Free Parking', type: 'corner', color: 'parking', price: 0, rent: [0], position: [0, 0] },
            
            // Top side (left to right)
            { id: 21, name: 'Kentucky Ave', type: 'property', color: 'orange', price: 180, rent: [14, 70, 200, 550, 750, 950], position: [1, 0] },
            { id: 22, name: 'Indiana Ave', type: 'property', color: 'orange', price: 180, rent: [14, 70, 200, 550, 750, 950], position: [2, 0] },
            { id: 23, name: 'Community Chest', type: 'chance', color: 'community', price: 0, rent: [0], position: [3, 0] },
            { id: 24, name: 'Illinois Ave', type: 'property', color: 'orange', price: 200, rent: [16, 80, 220, 600, 800, 1000], position: [4, 0] },
            { id: 25, name: 'Pennsylvania RR', type: 'railroad', color: 'railroad', price: 200, rent: [25, 50, 100, 200], position: [5, 0] },
            { id: 26, name: 'St. Charles Place', type: 'property', color: 'purple', price: 140, rent: [10, 50, 150, 450, 625, 750], position: [6, 0] },
            { id: 27, name: 'Electric Company', type: 'utility', color: 'utility', price: 150, rent: [4, 10], position: [7, 0] },
            { id: 28, name: 'States Ave', type: 'property', color: 'purple', price: 140, rent: [10, 50, 150, 450, 625, 750], position: [8, 0] },
            { id: 29, name: 'Virginia Ave', type: 'property', color: 'purple', price: 160, rent: [12, 60, 180, 500, 700, 900], position: [9, 0] },
            { id: 30, name: 'GO', type: 'corner', color: 'go', price: 0, rent: [0], position: [10, 0] },
            
            // Right side (top to bottom)
            { id: 31, name: 'St. James Place', type: 'property', color: 'orange', price: 180, rent: [14, 70, 200, 550, 750, 950], position: [10, 1] },
            { id: 32, name: 'Community Chest', type: 'chance', color: 'community', price: 0, rent: [0], position: [10, 2] },
            { id: 33, name: 'Tennessee Ave', type: 'property', color: 'orange', price: 180, rent: [14, 70, 200, 550, 750, 950], position: [10, 3] },
            { id: 34, name: 'New York Ave', type: 'property', color: 'orange', price: 200, rent: [16, 80, 220, 600, 800, 1000], position: [10, 4] },
            { id: 35, name: 'Reading RR', type: 'railroad', color: 'railroad', price: 200, rent: [25, 50, 100, 200], position: [10, 5] },
            { id: 36, name: 'Oriental Ave', type: 'property', color: 'lightblue', price: 100, rent: [6, 30, 90, 270, 400, 550], position: [10, 6] },
            { id: 37, name: 'Chance', type: 'chance', color: 'chance', price: 0, rent: [0], position: [10, 7] },
            { id: 38, name: 'Vermont Ave', type: 'property', color: 'lightblue', price: 100, rent: [6, 30, 90, 270, 400, 550], position: [10, 8] },
            { id: 39, name: 'Connecticut Ave', type: 'property', color: 'lightblue', price: 120, rent: [8, 40, 100, 300, 450, 600], position: [10, 9] }
        ];
    }

    setupPlayers() {
        const startingMoney = {
            easy: 2000,
            medium: 1500,
            hard: 1000
        };

        this.players = [
            {
                id: 0,
                name: 'You',
                money: startingMoney[this.difficulty],
                position: 0,
                properties: [],
                assets: [],
                liabilities: [],
                netWorth: startingMoney[this.difficulty],
                inJail: false,
                jailTurns: 0,
                color: '#2196F3'
            }
        ];

        // Add AI players based on difficulty
        const aiPlayers = {
            easy: 1,
            medium: 2,
            hard: 3
        };

        for (let i = 1; i <= aiPlayers[this.difficulty]; i++) {
            this.players.push({
                id: i,
                name: `Player ${i + 1}`,
                money: startingMoney[this.difficulty],
                position: 0,
                properties: [],
                assets: [],
                liabilities: [],
                netWorth: startingMoney[this.difficulty],
                inJail: false,
                jailTurns: 0,
                color: ['#4CAF50', '#FF9800', '#9C27B0'][i - 1]
            });
        }
    }

    setupEventListeners() {
        // Difficulty selector
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setDifficulty(e.target.dataset.difficulty);
            });
        });

        // Game controls
        document.getElementById('rollDiceBtn').addEventListener('click', () => {
            this.rollDice();
        });

        document.getElementById('buyPropertyBtn').addEventListener('click', () => {
            this.buyProperty();
        });

        document.getElementById('endTurnBtn').addEventListener('click', () => {
            this.endTurn();
        });

        // Statement tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.showStatement(e.target.dataset.statement);
            });
        });

        // Property interactions
        document.querySelectorAll('.board-square').forEach(square => {
            square.addEventListener('click', (e) => {
                const propertyId = parseInt(e.currentTarget.dataset.propertyId);
                if (propertyId >= 0) {
                    this.showPropertyDetails(propertyId);
                }
            });
        });
    }

    initializeBoard() {
        const boardGrid = document.querySelector('.board-grid');
        boardGrid.innerHTML = '';

        // Create 11x11 grid
        for (let row = 0; row < 11; row++) {
            for (let col = 0; col < 11; col++) {
                const square = document.createElement('div');
                square.className = 'board-square';
                
                // Find property for this position
                const property = this.properties.find(p => 
                    p.position && p.position[0] === col && p.position[1] === row
                );

                if (property) {
                    square.dataset.propertyId = property.id;
                    square.classList.add(property.type);
                    if (property.color) {
                        square.classList.add(property.color);
                    }
                    
                    square.innerHTML = `
                        <div class="property-name">${property.name}</div>
                        ${property.price > 0 ? `<div class="property-price">$${property.price}</div>` : ''}
                    `;
                } else if ((row === 0 || row === 10) || (col === 0 || col === 10)) {
                    // Border squares
                    square.classList.add('border');
                } else {
                    // Center area
                    square.classList.add('center');
                    if (row === 5 && col === 5) {
                        square.innerHTML = '<div class="game-logo">💰<br>Financial<br>Empire</div>';
                        square.style.fontSize = '0.7rem';
                        square.style.fontWeight = '700';
                        square.style.color = '#4CAF50';
                    }
                }

                boardGrid.appendChild(square);
            }
        }

        this.updatePlayerPositions();
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        
        // Update UI
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('active');

        // Restart game with new difficulty
        this.setupPlayers();
        this.updateDisplay();
        this.addMessage(`Difficulty set to ${difficulty.toUpperCase()}. Game restarted!`, 'info');
    }

    rollDice() {
        if (this.gameState !== 'playing') {
            this.gameState = 'playing';
        }

        // Animate dice
        const dice1 = document.getElementById('dice1');
        const dice2 = document.getElementById('dice2');
        
        dice1.classList.add('rolling');
        dice2.classList.add('rolling');

        // Generate random dice values
        setTimeout(() => {
            this.diceResults = [
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1
            ];

            dice1.textContent = this.diceResults[0];
            dice2.textContent = this.diceResults[1];
            
            dice1.classList.remove('rolling');
            dice2.classList.remove('rolling');

            // Play sound effect
            if (window.soundManager) {
                window.soundManager.playGameSound('correct');
            }

            this.movePlayer();
        }, 500);

        // Disable roll button temporarily
        document.getElementById('rollDiceBtn').disabled = true;
    }

    movePlayer() {
        const player = this.players[this.currentPlayer];
        const totalMove = this.diceResults[0] + this.diceResults[1];
        
        const oldPosition = player.position;
        player.position = (player.position + totalMove) % 40;

        // Check if passed GO
        if (player.position < oldPosition) {
            player.money += 200;
            this.addMessage(`${player.name} passed GO and collected $200!`, 'success');
            if (window.soundManager) {
                window.soundManager.playGameSound('coin');
            }
        }

        this.addMessage(`${player.name} rolled ${this.diceResults[0]} and ${this.diceResults[1]}, moved ${totalMove} spaces`, 'info');
        
        this.updatePlayerPositions();
        this.handleLanding();
        this.updateDisplay();
    }

    handleLanding() {
        const player = this.players[this.currentPlayer];
        const property = this.properties[player.position];

        if (!property) return;

        switch (property.type) {
            case 'property':
            case 'railroad':
            case 'utility':
                this.handlePropertyLanding(property);
                break;
            case 'tax':
                this.handleTax(property);
                break;
            case 'chance':
            case 'community':
                this.handleChanceCard();
                break;
            case 'corner':
                this.handleCorner(property);
                break;
        }
    }

    handlePropertyLanding(property) {
        const player = this.players[this.currentPlayer];
        const owner = this.findPropertyOwner(property.id);

        if (!owner) {
            // Property is available for purchase
            this.addMessage(`${property.name} is available for $${property.price}`, 'info');
            document.getElementById('buyPropertyBtn').disabled = false;
            document.getElementById('buyPropertyBtn').style.display = 'inline-block';
        } else if (owner.id !== player.id) {
            // Pay rent
            const rent = this.calculateRent(property, owner);
            if (player.money >= rent) {
                player.money -= rent;
                owner.money += rent;
                this.addMessage(`${player.name} paid $${rent} rent to ${owner.name}`, 'warning');
                if (window.soundManager) {
                    window.soundManager.playGameSound('incorrect');
                }
            } else {
                this.addMessage(`${player.name} cannot afford $${rent} rent!`, 'error');
                // Handle bankruptcy
                this.handleBankruptcy(player);
            }
        } else {
            this.addMessage(`${player.name} landed on their own property`, 'info');
        }
    }

    handleTax(property) {
        const player = this.players[this.currentPlayer];
        const taxAmount = property.rent[0];
        
        if (player.money >= taxAmount) {
            player.money -= taxAmount;
            this.addMessage(`${player.name} paid $${taxAmount} in taxes`, 'warning');
        } else {
            this.addMessage(`${player.name} cannot afford $${taxAmount} in taxes!`, 'error');
            this.handleBankruptcy(player);
        }
    }

    handleChanceCard() {
        const cards = [
            { text: 'Bank pays you dividend of $50', money: 50 },
            { text: 'Go to Jail – Go directly to jail', action: 'jail' },
            { text: 'Pay poor tax of $15', money: -15 },
            { text: 'Your building loan matures – collect $150', money: 150 },
            { text: 'You have won a crossword competition - collect $100', money: 100 },
            { text: 'Go directly to GO - collect $200', action: 'go' }
        ];

        const card = cards[Math.floor(Math.random() * cards.length)];
        const player = this.players[this.currentPlayer];

        this.addMessage(`Chance: ${card.text}`, 'info');

        if (card.money) {
            player.money += card.money;
            if (card.money > 0 && window.soundManager) {
                window.soundManager.playGameSound('coin');
            }
        }

        if (card.action === 'jail') {
            player.position = 10; // Jail position
            player.inJail = true;
            this.updatePlayerPositions();
        } else if (card.action === 'go') {
            player.position = 0;
            player.money += 200;
            this.updatePlayerPositions();
        }
    }

    handleCorner(property) {
        const player = this.players[this.currentPlayer];
        
        switch (property.name) {
            case 'GO':
                this.addMessage(`${player.name} landed on GO!`, 'success');
                break;
            case 'Free Parking':
                this.addMessage(`${player.name} is just visiting Free Parking`, 'info');
                break;
            case 'Go to Jail':
                player.position = 10;
                player.inJail = true;
                this.addMessage(`${player.name} was sent to jail!`, 'warning');
                this.updatePlayerPositions();
                break;
            case 'Jail/Visiting':
                if (player.inJail) {
                    this.addMessage(`${player.name} is in jail`, 'warning');
                } else {
                    this.addMessage(`${player.name} is just visiting jail`, 'info');
                }
                break;
        }
    }

    buyProperty() {
        const player = this.players[this.currentPlayer];
        const property = this.properties[player.position];

        if (player.money >= property.price) {
            player.money -= property.price;
            player.properties.push(property.id);
            player.assets.push({
                name: property.name,
                type: 'Property',
                value: property.price,
                income: property.rent[0]
            });

            this.addMessage(`${player.name} bought ${property.name} for $${property.price}!`, 'success');
            
            // Visual feedback
            const square = document.querySelector(`[data-property-id="${property.id}"]`);
            if (square) {
                square.classList.add('owned', 'property-purchased');
                square.style.borderColor = player.color;
            }

            if (window.soundManager) {
                window.soundManager.playGameSound('achievement');
            }

            document.getElementById('buyPropertyBtn').disabled = true;
            document.getElementById('buyPropertyBtn').style.display = 'none';
        } else {
            this.addMessage(`${player.name} cannot afford ${property.name}!`, 'error');
        }

        this.updateDisplay();
    }

    endTurn() {
        // Enable dice for next turn
        document.getElementById('rollDiceBtn').disabled = false;
        document.getElementById('buyPropertyBtn').disabled = true;
        document.getElementById('buyPropertyBtn').style.display = 'none';

        // Switch to next player
        this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
        
        this.addMessage(`${this.players[this.currentPlayer].name}'s turn`, 'info');
        
        // Handle AI turns
        if (this.currentPlayer !== 0) {
            setTimeout(() => {
                this.handleAITurn();
            }, 1000);
        }

        this.updateDisplay();
    }

    handleAITurn() {
        // Simple AI logic
        this.rollDice();
        
        setTimeout(() => {
            const player = this.players[this.currentPlayer];
            const property = this.properties[player.position];
            
            // AI decision making
            if (property && (property.type === 'property' || property.type === 'railroad' || property.type === 'utility')) {
                const owner = this.findPropertyOwner(property.id);
                if (!owner && player.money >= property.price && Math.random() > 0.3) {
                    this.buyProperty();
                }
            }
            
            setTimeout(() => {
                this.endTurn();
            }, 1000);
        }, 2000);
    }

    findPropertyOwner(propertyId) {
        return this.players.find(player => player.properties.includes(propertyId));
    }

    calculateRent(property, owner) {
        if (property.type === 'utility') {
            const utilitiesOwned = owner.properties.filter(id => 
                this.properties[id] && this.properties[id].type === 'utility'
            ).length;
            const multiplier = utilitiesOwned === 1 ? 4 : 10;
            return (this.diceResults[0] + this.diceResults[1]) * multiplier;
        }
        
        if (property.type === 'railroad') {
            const railroadsOwned = owner.properties.filter(id => 
                this.properties[id] && this.properties[id].type === 'railroad'
            ).length;
            return property.rent[railroadsOwned - 1] || property.rent[0];
        }
        
        return property.rent[0]; // Base rent for properties
    }

    handleBankruptcy(player) {
        this.addMessage(`${player.name} is bankrupt!`, 'error');
        // In a full implementation, handle asset liquidation
    }

    updatePlayerPositions() {
        // Clear existing player tokens
        document.querySelectorAll('.player-token').forEach(token => token.remove());

        // Add player tokens to their current positions
        this.players.forEach(player => {
            const property = this.properties[player.position];
            if (property && property.position) {
                const [col, row] = property.position;
                const squareIndex = row * 11 + col;
                const square = document.querySelectorAll('.board-square')[squareIndex];
                
                if (square) {
                    const token = document.createElement('div');
                    token.className = 'player-token';
                    token.style.backgroundColor = player.color;
                    token.textContent = player.id + 1;
                    square.appendChild(token);
                }
            }
        });
    }

    updateDisplay() {
        this.updatePlayerInfo();
        this.updateFinancialStatements();
    }

    updatePlayerInfo() {
        const player = this.players[0]; // Human player
        
        document.getElementById('playerMoney').textContent = `$${player.money.toLocaleString()}`;
        document.getElementById('playerProperties').textContent = player.properties.length;
        document.getElementById('playerNetWorth').textContent = `$${this.calculateNetWorth(player).toLocaleString()}`;
        document.getElementById('currentPlayer').textContent = this.players[this.currentPlayer].name;
    }

    calculateNetWorth(player) {
        let netWorth = player.money;
        
        // Add property values
        player.properties.forEach(propertyId => {
            const property = this.properties[propertyId];
            if (property) {
                netWorth += property.price;
            }
        });
        
        return netWorth;
    }

    updateFinancialStatements() {
        const player = this.players[0]; // Human player
        this.updateBalanceSheet(player);
        this.updateIncomeStatement(player);
        this.updateCashFlow(player);
    }

    updateBalanceSheet(player) {
        const balanceSheet = document.getElementById('balanceSheetContent');
        
        let assets = player.money;
        let propertyValue = 0;
        
        player.properties.forEach(propertyId => {
            const property = this.properties[propertyId];
            if (property) {
                propertyValue += property.price;
            }
        });
        
        assets += propertyValue;
        
        balanceSheet.innerHTML = `
            <div class="statement-section">
                <h4>Assets</h4>
                <div class="statement-line">
                    <span>Cash</span>
                    <span>$${player.money.toLocaleString()}</span>
                </div>
                <div class="statement-line">
                    <span>Properties</span>
                    <span>$${propertyValue.toLocaleString()}</span>
                </div>
                <div class="statement-line total">
                    <span>Total Assets</span>
                    <span>$${assets.toLocaleString()}</span>
                </div>
            </div>
            
            <div class="statement-section">
                <h4>Liabilities</h4>
                <div class="statement-line">
                    <span>Mortgages</span>
                    <span>$0</span>
                </div>
                <div class="statement-line total">
                    <span>Total Liabilities</span>
                    <span>$0</span>
                </div>
            </div>
            
            <div class="statement-section">
                <h4>Net Worth</h4>
                <div class="statement-line total">
                    <span>Total Net Worth</span>
                    <span>$${assets.toLocaleString()}</span>
                </div>
            </div>
        `;
    }

    updateIncomeStatement(player) {
        const incomeStatement = document.getElementById('incomeStatementContent');
        
        let rentalIncome = 0;
        player.properties.forEach(propertyId => {
            const property = this.properties[propertyId];
            if (property && property.rent) {
                rentalIncome += property.rent[0] * 0.1; // Estimated monthly income
            }
        });
        
        incomeStatement.innerHTML = `
            <div class="statement-section">
                <h4>Income</h4>
                <div class="statement-line">
                    <span>Salary (from GO)</span>
                    <span>$200</span>
                </div>
                <div class="statement-line">
                    <span>Rental Income</span>
                    <span>$${rentalIncome.toFixed(0)}</span>
                </div>
                <div class="statement-line total">
                    <span>Total Income</span>
                    <span>$${(200 + rentalIncome).toFixed(0)}</span>
                </div>
            </div>
            
            <div class="statement-section">
                <h4>Expenses</h4>
                <div class="statement-line">
                    <span>Property Taxes</span>
                    <span>$15</span>
                </div>
                <div class="statement-line">
                    <span>Living Expenses</span>
                    <span>$50</span>
                </div>
                <div class="statement-line total">
                    <span>Total Expenses</span>
                    <span>$65</span>
                </div>
            </div>
            
            <div class="statement-section">
                <h4>Net Income</h4>
                <div class="statement-line total">
                    <span>Monthly Cash Flow</span>
                    <span>$${(135 + rentalIncome).toFixed(0)}</span>
                </div>
            </div>
        `;
    }

    updateCashFlow(player) {
        const cashFlow = document.getElementById('cashFlowContent');
        
        cashFlow.innerHTML = `
            <div class="statement-section">
                <h4>Cash Inflows</h4>
                <div class="statement-line">
                    <span>Salary</span>
                    <span>$200</span>
                </div>
                <div class="statement-line">
                    <span>Property Income</span>
                    <span>$${player.properties.length * 25}</span>
                </div>
                <div class="statement-line total">
                    <span>Total Inflows</span>
                    <span>$${200 + (player.properties.length * 25)}</span>
                </div>
            </div>
            
            <div class="statement-section">
                <h4>Cash Outflows</h4>
                <div class="statement-line">
                    <span>Living Expenses</span>
                    <span>$50</span>
                </div>
                <div class="statement-line">
                    <span>Property Expenses</span>
                    <span>$${player.properties.length * 10}</span>
                </div>
                <div class="statement-line total">
                    <span>Total Outflows</span>
                    <span>$${50 + (player.properties.length * 10)}</span>
                </div>
            </div>
            
            <div class="statement-section">
                <h4>Net Cash Flow</h4>
                <div class="statement-line total">
                    <span>Monthly Net Cash</span>
                    <span>$${150 + (player.properties.length * 15)}</span>
                </div>
            </div>
        `;
    }

    showStatement(statementType) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-statement="${statementType}"]`).classList.add('active');

        // Show/hide content
        document.querySelectorAll('.statement-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${statementType}Content`).classList.add('active');
    }

    showPropertyDetails(propertyId) {
        const property = this.properties[propertyId];
        if (!property || property.type === 'corner' || property.type === 'chance') return;

        const owner = this.findPropertyOwner(propertyId);
        
        const modal = document.getElementById('propertyModal');
        const content = modal.querySelector('.modal-content');
        
        content.innerHTML = `
            <button class="modal-close" onclick="document.getElementById('propertyModal').classList.remove('show')">&times;</button>
            <div class="modal-header">
                <h3 class="modal-title">${property.name}</h3>
            </div>
            <div class="property-details">
                <div class="property-detail-line">
                    <span>Type:</span>
                    <span>${property.type.charAt(0).toUpperCase() + property.type.slice(1)}</span>
                </div>
                <div class="property-detail-line">
                    <span>Price:</span>
                    <span>$${property.price}</span>
                </div>
                <div class="property-detail-line">
                    <span>Rent:</span>
                    <span>$${property.rent[0]}</span>
                </div>
                <div class="property-detail-line">
                    <span>Owner:</span>
                    <span>${owner ? owner.name : 'Available'}</span>
                </div>
                <div class="property-detail-line">
                    <span>Return on Investment:</span>
                    <span>${((property.rent[0] / property.price) * 100).toFixed(1)}%</span>
                </div>
            </div>
            ${!owner ? `
                <div class="learning-tip">
                    <h4>Investment Tip</h4>
                    <p>This property generates $${property.rent[0]} rent and costs $${property.price}. 
                    That's a ${((property.rent[0] / property.price) * 100).toFixed(1)}% return on investment!</p>
                </div>
            ` : ''}
        `;
        
        modal.classList.add('show');
    }

    addMessage(text, type = 'info') {
        const messagesContainer = document.querySelector('.game-messages');
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        
        messagesContainer.appendChild(message);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Keep only last 10 messages
        const messages = messagesContainer.querySelectorAll('.message');
        if (messages.length > 10) {
            messages[0].remove();
        }
    }
}

// Learning Tips System
class LearningTipsSystem {
    constructor(game) {
        this.game = game;
        this.tips = [
            {
                trigger: 'property_buy',
                title: 'Smart Investment!',
                content: 'You just bought a property! Properties generate passive income through rent. The key is to buy properties that give you positive cash flow.'
            },
            {
                trigger: 'rent_pay',
                title: 'Understanding Expenses',
                content: 'You paid rent! In real life, this is called an expense. Smart investors try to minimize expenses and maximize income from assets.'
            },
            {
                trigger: 'go_pass',
                title: 'Regular Income',
                content: 'You passed GO and got $200! This is like a salary - regular income you can count on. In real life, this could be your job income.'
            },
            {
                trigger: 'balance_sheet',
                title: 'Track Your Wealth',
                content: 'Your balance sheet shows what you own (assets) minus what you owe (liabilities). The difference is your net worth!'
            }
        ];
    }

    showTip(trigger) {
        const tip = this.tips.find(t => t.trigger === trigger);
        if (tip) {
            this.displayTip(tip);
        }
    }

    displayTip(tip) {
        // Create floating tip element
        const tipElement = document.createElement('div');
        tipElement.className = 'learning-tip floating-tip';
        tipElement.innerHTML = `
            <h4>${tip.title}</h4>
            <p>${tip.content}</p>
            <button onclick="this.parentElement.remove()">Got it!</button>
        `;
        
        tipElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(tipElement);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (tipElement.parentElement) {
                tipElement.remove();
            }
        }, 10000);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load sound manager if available
    if (window.soundManager) {
        window.soundManager.attachSoundEffects();
    }
    
    // Initialize game
    window.financialEmpireGame = new FinancialEmpireGame();
    window.learningTips = new LearningTipsSystem(window.financialEmpireGame);
    
    console.log('🏦 Financial Empire Game loaded successfully!');
});
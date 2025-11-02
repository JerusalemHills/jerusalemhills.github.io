// Game Progression and Achievement System for Jerusalem Hills
// Handles difficulty progression, achievements, and user statistics

class GameProgressionManager {
    constructor() {
        this.storageKey = 'jerusalemhills-game-progression';
        this.achievements = this.loadAchievements();
        this.userStats = this.loadUserStats();
        this.difficulties = ['beginner', 'easy', 'medium', 'hard', 'expert', 'master'];
        
        this.achievementDefinitions = {
            // General gaming achievements
            'first_win': { name: 'First Victory', description: 'Win your first game', icon: '🏆', points: 10 },
            'dedicated_player': { name: 'Dedicated Player', description: 'Play games for 5 days', icon: '📅', points: 50 },
            'game_master': { name: 'Game Master', description: 'Reach expert level in any game', icon: '👑', points: 100 },
            
            // Specific game achievements
            'sudoku_speedster': { name: 'Sudoku Speedster', description: 'Complete a Sudoku in under 5 minutes', icon: '⚡', points: 25 },
            'memory_champion': { name: 'Memory Champion', description: 'Complete Jerusalem Memory Match in under 2 minutes', icon: '🧠', points: 30 },
            'puzzle_perfectionist': { name: 'Puzzle Perfectionist', description: 'Complete 10 puzzles without mistakes', icon: '✨', points: 75 },
            
            // Educational achievements
            'geography_expert': { name: 'Geography Expert', description: 'Master all geography games', icon: '🌍', points: 60 },
            'math_wizard': { name: 'Math Wizard', description: 'Score 100% in math games 5 times', icon: '🔢', points: 40 },
            'culture_enthusiast': { name: 'Culture Enthusiast', description: 'Play all cultural games', icon: '🏛️', points: 50 },
            
            // Progression achievements
            'difficulty_climber': { name: 'Difficulty Climber', description: 'Unlock hard difficulty in any game', icon: '⛰️', points: 35 },
            'well_rounded': { name: 'Well Rounded', description: 'Play at least 5 different games', icon: '🎯', points: 45 },
            'consistency_king': { name: 'Consistency King', description: 'Play games 10 days in a row', icon: '🔥', points: 80 }
        };
        
        this.init();
    }
    
    init() {
        this.createProgressionUI();
        this.attachEventListeners();
        this.checkDailyVisit();
    }
    
    // Game completion tracking
    recordGameCompletion(gameId, difficulty, score, timeSeconds, mistakes = 0) {
        const completion = {
            gameId,
            difficulty,
            score,
            timeSeconds,
            mistakes,
            timestamp: Date.now(),
            date: new Date().toDateString()
        };
        
        // Update user stats
        if (!this.userStats.games[gameId]) {
            this.userStats.games[gameId] = {
                totalPlays: 0,
                bestScore: 0,
                bestTime: Infinity,
                currentDifficulty: 'beginner',
                unlockedDifficulties: ['beginner', 'easy'],
                perfectGames: 0
            };
        }
        
        const gameStats = this.userStats.games[gameId];
        gameStats.totalPlays++;
        gameStats.bestScore = Math.max(gameStats.bestScore, score);
        gameStats.bestTime = Math.min(gameStats.bestTime, timeSeconds);
        
        if (mistakes === 0) {
            gameStats.perfectGames++;
        }
        
        // Check for difficulty progression
        this.checkDifficultyProgression(gameId, difficulty, score, mistakes);
        
        // Update overall stats
        this.userStats.totalGamesPlayed++;
        this.userStats.totalScore += score;
        this.userStats.lastPlayed = Date.now();
        
        // Check achievements
        this.checkAchievements(completion);
        
        // Save progress
        this.saveProgress();
        
        // Show progression feedback
        this.showProgressionFeedback(completion);
    }
    
    checkDifficultyProgression(gameId, difficulty, score, mistakes) {
        const gameStats = this.userStats.games[gameId];
        const difficultyIndex = this.difficulties.indexOf(difficulty);
        const currentDifficultyIndex = this.difficulties.indexOf(gameStats.currentDifficulty);
        
        // Progression criteria:
        // - Score above 80% on current difficulty
        // - Less than 3 mistakes
        // - Complete at least 3 games on current difficulty
        
        const progressionThreshold = {
            score: 80,
            maxMistakes: 2,
            minGames: 3
        };
        
        if (score >= progressionThreshold.score && 
            mistakes <= progressionThreshold.maxMistakes &&
            gameStats.totalPlays >= progressionThreshold.minGames &&
            difficultyIndex === currentDifficultyIndex &&
            difficultyIndex < this.difficulties.length - 1) {
            
            // Unlock next difficulty
            const nextDifficulty = this.difficulties[difficultyIndex + 1];
            if (!gameStats.unlockedDifficulties.includes(nextDifficulty)) {
                gameStats.unlockedDifficulties.push(nextDifficulty);
                gameStats.currentDifficulty = nextDifficulty;
                
                this.showDifficultyUnlock(gameId, nextDifficulty);
            }
        }
    }
    
    checkAchievements(completion) {
        const newAchievements = [];
        
        // First win
        if (this.userStats.totalGamesPlayed === 1) {
            newAchievements.push('first_win');
        }
        
        // Game-specific achievements
        if (completion.gameId === 'sudoku' && completion.timeSeconds < 300) {
            newAchievements.push('sudoku_speedster');
        }
        
        if (completion.gameId === 'jerusalem-memory' && completion.timeSeconds < 120) {
            newAchievements.push('memory_champion');
        }
        
        // Perfect games
        const perfectGames = Object.values(this.userStats.games)
            .reduce((sum, game) => sum + game.perfectGames, 0);
        if (perfectGames >= 10) {
            newAchievements.push('puzzle_perfectionist');
        }
        
        // Math wizard
        const mathGameIds = ['math-quest', 'multiplication', 'subtraction', 'division'];
        const mathPerfectGames = mathGameIds.reduce((sum, gameId) => {
            return sum + (this.userStats.games[gameId]?.perfectGames || 0);
        }, 0);
        if (mathPerfectGames >= 5) {
            newAchievements.push('math_wizard');
        }
        
        // Well rounded
        const gamesPlayed = Object.keys(this.userStats.games).length;
        if (gamesPlayed >= 5) {
            newAchievements.push('well_rounded');
        }
        
        // Difficulty climber
        const hasHardDifficulty = Object.values(this.userStats.games)
            .some(game => game.unlockedDifficulties.includes('hard'));
        if (hasHardDifficulty) {
            newAchievements.push('difficulty_climber');
        }
        
        // Process new achievements
        newAchievements.forEach(achievementId => {
            if (!this.achievements.includes(achievementId)) {
                this.achievements.push(achievementId);
                this.showAchievementUnlock(achievementId);
            }
        });
    }
    
    checkDailyVisit() {
        const today = new Date().toDateString();
        const lastVisit = this.userStats.lastVisitDate;
        
        if (lastVisit !== today) {
            this.userStats.visitStreak = lastVisit === this.getPreviousDate(today) ? 
                this.userStats.visitStreak + 1 : 1;
            this.userStats.lastVisitDate = today;
            this.userStats.totalDaysPlayed++;
            
            // Check streak achievements
            if (this.userStats.totalDaysPlayed >= 5) {
                this.checkAchievements({ gameId: 'daily-visit' });
            }
            
            if (this.userStats.visitStreak >= 10) {
                if (!this.achievements.includes('consistency_king')) {
                    this.achievements.push('consistency_king');
                    this.showAchievementUnlock('consistency_king');
                }
            }
            
            this.saveProgress();
        }
    }
    
    getPreviousDate(dateString) {
        const date = new Date(dateString);
        date.setDate(date.getDate() - 1);
        return date.toDateString();
    }
    
    // UI Creation and Management
    createProgressionUI() {
        // Create floating progression panel
        const progressPanel = document.createElement('div');
        progressPanel.id = 'progressionPanel';
        progressPanel.innerHTML = `
            <div class="progression-toggle" onclick="window.gameProgression.togglePanel()">
                <span class="progression-icon">🏆</span>
                <span class="progression-badge" id="achievementBadge">${this.achievements.length}</span>
            </div>
            <div class="progression-content" id="progressionContent">
                <h3>Your Progress</h3>
                <div class="progression-stats">
                    <div class="stat-item">
                        <span class="stat-value">${this.userStats.totalGamesPlayed}</span>
                        <span class="stat-label">Games Played</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${this.achievements.length}</span>
                        <span class="stat-label">Achievements</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${this.userStats.visitStreak}</span>
                        <span class="stat-label">Day Streak</span>
                    </div>
                </div>
                <div class="achievements-list" id="achievementsList"></div>
                <div class="progression-actions">
                    <button onclick="window.gameProgression.showFullStats()">View Details</button>
                    <button onclick="window.gameProgression.exportProgress()">Export Data</button>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #progressionPanel {
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 9999;
                font-family: Arial, sans-serif;
            }
            
            .progression-toggle {
                background: linear-gradient(145deg, #FFD700, #FFA500);
                width: 60px;
                height: 60px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
                transition: all 0.3s ease;
                position: relative;
            }
            
            .progression-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5);
            }
            
            .progression-icon {
                font-size: 24px;
            }
            
            .progression-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #f44336;
                color: white;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
            }
            
            .progression-content {
                position: absolute;
                top: 70px;
                right: 0;
                background: white;
                border-radius: 15px;
                padding: 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                width: 300px;
                transform: translateY(-10px);
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .progression-content.show {
                transform: translateY(0);
                opacity: 1;
                visibility: visible;
            }
            
            .progression-content h3 {
                color: #333;
                margin-bottom: 15px;
                text-align: center;
            }
            
            .progression-stats {
                display: flex;
                justify-content: space-around;
                margin-bottom: 15px;
            }
            
            .stat-item {
                text-align: center;
            }
            
            .stat-value {
                display: block;
                font-size: 1.5em;
                font-weight: bold;
                color: #4CAF50;
            }
            
            .stat-label {
                font-size: 0.8em;
                color: #666;
            }
            
            .achievements-list {
                max-height: 150px;
                overflow-y: auto;
                margin-bottom: 15px;
            }
            
            .achievement-item {
                display: flex;
                align-items: center;
                padding: 8px;
                border-radius: 8px;
                margin-bottom: 5px;
                background: #f5f5f5;
            }
            
            .achievement-icon {
                font-size: 1.5em;
                margin-right: 10px;
            }
            
            .achievement-info {
                flex: 1;
            }
            
            .achievement-name {
                font-weight: bold;
                color: #333;
            }
            
            .achievement-desc {
                font-size: 0.8em;
                color: #666;
            }
            
            .progression-actions {
                display: flex;
                gap: 10px;
            }
            
            .progression-actions button {
                flex: 1;
                padding: 8px;
                border: none;
                border-radius: 5px;
                background: #2196F3;
                color: white;
                cursor: pointer;
                font-size: 0.9em;
            }
            
            .progression-actions button:hover {
                background: #1976D2;
            }
            
            @media (max-width: 768px) {
                #progressionPanel {
                    top: 60px;
                    right: 10px;
                }
                
                .progression-content {
                    width: 280px;
                    right: -220px;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(progressPanel);
        
        this.updateAchievementsList();
    }
    
    updateAchievementsList() {
        const achievementsList = document.getElementById('achievementsList');
        if (!achievementsList) return;
        
        achievementsList.innerHTML = this.achievements.map(achievementId => {
            const achievement = this.achievementDefinitions[achievementId];
            if (!achievement) return '';
            
            return `
                <div class="achievement-item">
                    <span class="achievement-icon">${achievement.icon}</span>
                    <div class="achievement-info">
                        <div class="achievement-name">${achievement.name}</div>
                        <div class="achievement-desc">${achievement.description}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    togglePanel() {
        const content = document.getElementById('progressionContent');
        content.classList.toggle('show');
    }
    
    showProgressionFeedback(completion) {
        // Show brief feedback notification
        const feedback = document.createElement('div');
        feedback.className = 'progression-feedback';
        feedback.innerHTML = `
            <div class="feedback-content">
                <div class="feedback-title">Game Complete! 🎉</div>
                <div class="feedback-stats">
                    Score: ${completion.score} | Time: ${this.formatTime(completion.timeSeconds)}
                </div>
            </div>
        `;
        
        const feedbackStyle = `
            .progression-feedback {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(145deg, #4CAF50, #45a049);
                color: white;
                padding: 20px;
                border-radius: 15px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                animation: feedbackSlide 3s ease-in-out forwards;
            }
            
            @keyframes feedbackSlide {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
            
            .feedback-title {
                font-size: 1.2em;
                font-weight: bold;
                margin-bottom: 5px;
                text-align: center;
            }
            
            .feedback-stats {
                text-align: center;
                opacity: 0.9;
            }
        `;
        
        if (!document.querySelector('#progressionFeedbackStyle')) {
            const style = document.createElement('style');
            style.id = 'progressionFeedbackStyle';
            style.textContent = feedbackStyle;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 3000);
    }
    
    showDifficultyUnlock(gameId, difficulty) {
        const notification = document.createElement('div');
        notification.className = 'difficulty-unlock';
        notification.innerHTML = `
            <div class="unlock-content">
                <div class="unlock-icon">🎯</div>
                <div class="unlock-text">
                    <div class="unlock-title">Difficulty Unlocked!</div>
                    <div class="unlock-desc">${difficulty.toUpperCase()} mode now available</div>
                </div>
            </div>
        `;
        
        const unlockStyle = `
            .difficulty-unlock {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(145deg, #FF9800, #F57C00);
                color: white;
                padding: 15px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(255, 152, 0, 0.4);
                z-index: 10000;
                animation: unlockSlide 4s ease-in-out forwards;
            }
            
            @keyframes unlockSlide {
                0% { transform: translateX(100%); opacity: 0; }
                15% { transform: translateX(0); opacity: 1; }
                85% { transform: translateX(0); opacity: 1; }
                100% { transform: translateX(100%); opacity: 0; }
            }
            
            .unlock-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .unlock-icon {
                font-size: 2em;
            }
            
            .unlock-title {
                font-weight: bold;
                font-size: 1.1em;
            }
            
            .unlock-desc {
                font-size: 0.9em;
                opacity: 0.9;
            }
        `;
        
        if (!document.querySelector('#difficultyUnlockStyle')) {
            const style = document.createElement('style');
            style.id = 'difficultyUnlockStyle';
            style.textContent = unlockStyle;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }
    
    showAchievementUnlock(achievementId) {
        const achievement = this.achievementDefinitions[achievementId];
        if (!achievement) return;
        
        const notification = document.createElement('div');
        notification.className = 'achievement-unlock';
        notification.innerHTML = `
            <div class="achievement-unlock-content">
                <div class="achievement-unlock-icon">${achievement.icon}</div>
                <div class="achievement-unlock-text">
                    <div class="achievement-unlock-title">Achievement Unlocked!</div>
                    <div class="achievement-unlock-name">${achievement.name}</div>
                    <div class="achievement-unlock-desc">${achievement.description}</div>
                    <div class="achievement-unlock-points">+${achievement.points} points</div>
                </div>
            </div>
        `;
        
        const achievementStyle = `
            .achievement-unlock {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(145deg, #4CAF50, #45a049);
                color: white;
                padding: 25px;
                border-radius: 15px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                z-index: 10001;
                animation: achievementPop 4s ease-in-out forwards;
                max-width: 400px;
            }
            
            @keyframes achievementPop {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                25% { transform: translate(-50%, -50%) scale(1); }
                75% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
            
            .achievement-unlock-content {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .achievement-unlock-icon {
                font-size: 3em;
                animation: bounce 2s infinite;
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-10px); }
                60% { transform: translateY(-5px); }
            }
            
            .achievement-unlock-title {
                font-size: 1.2em;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .achievement-unlock-name {
                font-size: 1.1em;
                font-weight: bold;
                margin-bottom: 3px;
            }
            
            .achievement-unlock-desc {
                font-size: 0.9em;
                opacity: 0.9;
                margin-bottom: 5px;
            }
            
            .achievement-unlock-points {
                font-size: 0.8em;
                background: rgba(255, 255, 255, 0.2);
                padding: 3px 8px;
                border-radius: 12px;
                display: inline-block;
            }
        `;
        
        if (!document.querySelector('#achievementUnlockStyle')) {
            const style = document.createElement('style');
            style.id = 'achievementUnlockStyle';
            style.textContent = achievementStyle;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Update badge count
        const badge = document.getElementById('achievementBadge');
        if (badge) {
            badge.textContent = this.achievements.length;
        }
        
        this.updateAchievementsList();
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }
    
    // Utility methods
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    
    getDifficultyColor(difficulty) {
        const colors = {
            beginner: '#4CAF50',
            easy: '#8BC34A',
            medium: '#FF9800',
            hard: '#FF5722',
            expert: '#9C27B0',
            master: '#E91E63'
        };
        return colors[difficulty] || '#666';
    }
    
    // Data management
    loadUserStats() {
        try {
            const stored = localStorage.getItem(this.storageKey + '-stats');
            return stored ? JSON.parse(stored) : {
                totalGamesPlayed: 0,
                totalScore: 0,
                lastPlayed: null,
                lastVisitDate: null,
                visitStreak: 0,
                totalDaysPlayed: 0,
                games: {}
            };
        } catch (error) {
            console.warn('Could not load user stats:', error);
            return {
                totalGamesPlayed: 0,
                totalScore: 0,
                lastPlayed: null,
                lastVisitDate: null,
                visitStreak: 0,
                totalDaysPlayed: 0,
                games: {}
            };
        }
    }
    
    loadAchievements() {
        try {
            const stored = localStorage.getItem(this.storageKey + '-achievements');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Could not load achievements:', error);
            return [];
        }
    }
    
    saveProgress() {
        try {
            localStorage.setItem(this.storageKey + '-stats', JSON.stringify(this.userStats));
            localStorage.setItem(this.storageKey + '-achievements', JSON.stringify(this.achievements));
        } catch (error) {
            console.warn('Could not save progress:', error);
        }
    }
    
    exportProgress() {
        const data = {
            stats: this.userStats,
            achievements: this.achievements,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'jerusalemhills-game-progress.json';
        a.click();
        URL.revokeObjectURL(url);
    }
    
    showFullStats() {
        alert(`Detailed Stats:\n\nTotal Games: ${this.userStats.totalGamesPlayed}\nTotal Score: ${this.userStats.totalScore}\nAchievements: ${this.achievements.length}\nStreak: ${this.userStats.visitStreak} days\n\nGame-specific stats available in exported data.`);
    }
    
    // Public API methods for games to use
    getGameStats(gameId) {
        return this.userStats.games[gameId] || null;
    }
    
    getUnlockedDifficulties(gameId) {
        const gameStats = this.userStats.games[gameId];
        return gameStats ? gameStats.unlockedDifficulties : ['beginner', 'easy'];
    }
    
    getCurrentDifficulty(gameId) {
        const gameStats = this.userStats.games[gameId];
        return gameStats ? gameStats.currentDifficulty : 'beginner';
    }
    
    attachEventListeners() {
        // Clean up any existing event listeners
        document.removeEventListener('gameComplete', this.handleGameComplete);
        
        // Add event listener for game completions
        this.handleGameComplete = (event) => {
            if (event.detail) {
                this.recordGameCompletion(
                    event.detail.gameId,
                    event.detail.difficulty,
                    event.detail.score,
                    event.detail.timeSeconds,
                    event.detail.mistakes
                );
            }
        };
        
        document.addEventListener('gameComplete', this.handleGameComplete);
    }
}

// Initialize the game progression system
window.gameProgression = new GameProgressionManager();

// Helper function for games to report completion
window.reportGameCompletion = function(gameId, difficulty, score, timeSeconds, mistakes = 0) {
    if (window.gameProgression) {
        window.gameProgression.recordGameCompletion(gameId, difficulty, score, timeSeconds, mistakes);
    }
    
    // Also dispatch event for other listeners
    const event = new CustomEvent('gameComplete', {
        detail: { gameId, difficulty, score, timeSeconds, mistakes }
    });
    document.dispatchEvent(event);
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameProgressionManager;
}
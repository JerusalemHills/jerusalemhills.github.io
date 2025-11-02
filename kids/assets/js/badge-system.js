/* Jerusalem Hills Kids Zone - Comprehensive Badge & Achievement System */

class BadgeSystem {
    constructor() {
        this.achievements = this.getStoredAchievements();
        this.badges = this.getBadgeData();
        this.skillTrees = this.getSkillTreeData();
        this.listeners = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.displayBadges();
        this.setupNotifications();
    }

    // Badge Data Structure
    getBadgeData() {
        return {
            math: {
                name: "Math Kingdom",
                color: "#4CAF50",
                badges: {
                    firstSteps: {
                        id: "math_first_steps",
                        name: "First Steps",
                        description: "Complete your first math problem",
                        icon: "🔢",
                        points: 10,
                        unlocked: false
                    },
                    additionAce: {
                        id: "math_addition_ace",
                        name: "Addition Ace",
                        description: "Solve 10 addition problems correctly",
                        icon: "➕",
                        points: 25,
                        unlocked: false,
                        progress: 0,
                        target: 10
                    },
                    subtractionStar: {
                        id: "math_subtraction_star",
                        name: "Subtraction Star",
                        description: "Master 15 subtraction problems",
                        icon: "➖",
                        points: 30,
                        unlocked: false,
                        progress: 0,
                        target: 15
                    },
                    multiplicationMaster: {
                        id: "math_multiplication_master",
                        name: "Multiplication Master",
                        description: "Complete times tables 1-5",
                        icon: "✖️",
                        points: 50,
                        unlocked: false,
                        progress: 0,
                        target: 5
                    },
                    divisionDetective: {
                        id: "math_division_detective",
                        name: "Division Detective",
                        description: "Solve 20 division problems",
                        icon: "➗",
                        points: 45,
                        unlocked: false,
                        progress: 0,
                        target: 20
                    },
                    mathWizard: {
                        id: "math_wizard",
                        name: "Math Wizard",
                        description: "Earn all basic math badges",
                        icon: "🧙‍♂️",
                        points: 100,
                        unlocked: false,
                        requirements: ["math_addition_ace", "math_subtraction_star", "math_multiplication_master", "math_division_detective"]
                    }
                }
            },
            language: {
                name: "Language Castle",
                color: "#2196F3",
                badges: {
                    wordExplorer: {
                        id: "lang_word_explorer",
                        name: "Word Explorer",
                        description: "Learn 25 new words",
                        icon: "📖",
                        points: 20,
                        unlocked: false,
                        progress: 0,
                        target: 25
                    },
                    spellingChampion: {
                        id: "lang_spelling_champion",
                        name: "Spelling Champion",
                        description: "Spell 50 words correctly",
                        icon: "🏆",
                        points: 35,
                        unlocked: false,
                        progress: 0,
                        target: 50
                    },
                    hebrewBeginner: {
                        id: "lang_hebrew_beginner",
                        name: "Hebrew Explorer",
                        description: "Learn 10 Hebrew letters",
                        icon: "ℵ",
                        points: 30,
                        unlocked: false,
                        progress: 0,
                        target: 10
                    },
                    hebrewReader: {
                        id: "lang_hebrew_reader",
                        name: "Hebrew Reader",
                        description: "Complete Hebrew alphabet",
                        icon: "📜",
                        points: 60,
                        unlocked: false,
                        progress: 0,
                        target: 22
                    },
                    storyteller: {
                        id: "lang_storyteller",
                        name: "Storyteller",
                        description: "Read 5 cultural stories",
                        icon: "📚",
                        points: 40,
                        unlocked: false,
                        progress: 0,
                        target: 5
                    }
                }
            },
            science: {
                name: "Science Lab",
                color: "#9C27B0",
                badges: {
                    spaceExplorer: {
                        id: "sci_space_explorer",
                        name: "Space Explorer",
                        description: "Explore the solar system",
                        icon: "🚀",
                        points: 40,
                        unlocked: false
                    },
                    planetExpert: {
                        id: "sci_planet_expert",
                        name: "Planet Expert",
                        description: "Learn about all 8 planets",
                        icon: "🪐",
                        points: 50,
                        unlocked: false,
                        progress: 0,
                        target: 8
                    },
                    animalFriend: {
                        id: "sci_animal_friend",
                        name: "Animal Friend",
                        description: "Classify 20 different animals",
                        icon: "🐾",
                        points: 35,
                        unlocked: false,
                        progress: 0,
                        target: 20
                    },
                    naturalist: {
                        id: "sci_naturalist",
                        name: "Young Naturalist",
                        description: "Complete nature exploration",
                        icon: "🌿",
                        points: 60,
                        unlocked: false
                    }
                }
            },
            geography: {
                name: "World Explorer",
                color: "#FF9800",
                badges: {
                    worldTraveler: {
                        id: "geo_world_traveler",
                        name: "World Traveler",
                        description: "Visit 10 countries virtually",
                        icon: "🌍",
                        points: 30,
                        unlocked: false,
                        progress: 0,
                        target: 10
                    },
                    capitalMaster: {
                        id: "geo_capital_master",
                        name: "Capital Master",
                        description: "Match 25 capitals correctly",
                        icon: "🏛️",
                        points: 45,
                        unlocked: false,
                        progress: 0,
                        target: 25
                    },
                    flagCollector: {
                        id: "geo_flag_collector",
                        name: "Flag Collector",
                        description: "Identify 30 country flags",
                        icon: "🏳️",
                        points: 40,
                        unlocked: false,
                        progress: 0,
                        target: 30
                    },
                    jerusalemExplorer: {
                        id: "geo_jerusalem_explorer",
                        name: "Jerusalem Explorer",
                        description: "Explore Jerusalem heritage",
                        icon: "🕊️",
                        points: 55,
                        unlocked: false
                    }
                }
            },
            memory: {
                name: "Brain Training",
                color: "#E91E63",
                badges: {
                    memoryNovice: {
                        id: "mem_novice",
                        name: "Memory Novice",
                        description: "Complete your first memory game",
                        icon: "🧠",
                        points: 15,
                        unlocked: false
                    },
                    memoryMaster: {
                        id: "mem_master",
                        name: "Memory Master",
                        description: "Win 10 memory games",
                        icon: "🎯",
                        points: 40,
                        unlocked: false,
                        progress: 0,
                        target: 10
                    },
                    concentrationKing: {
                        id: "mem_concentration_king",
                        name: "Concentration King",
                        description: "Complete expert level",
                        icon: "👑",
                        points: 70,
                        unlocked: false
                    },
                    perfectMatch: {
                        id: "mem_perfect_match",
                        name: "Perfect Match",
                        description: "Complete game without mistakes",
                        icon: "💎",
                        points: 50,
                        unlocked: false
                    }
                }
            },
            financial: {
                name: "Money Wisdom",
                color: "#FFD700",
                badges: {
                    moneyBasics: {
                        id: "fin_money_basics",
                        name: "Money Basics",
                        description: "Learn about coins and bills",
                        icon: "💰",
                        points: 25,
                        unlocked: false
                    },
                    savingStar: {
                        id: "fin_saving_star",
                        name: "Saving Star",
                        description: "Complete saving challenges",
                        icon: "🌟",
                        points: 40,
                        unlocked: false
                    },
                    tradingMaster: {
                        id: "fin_trading_master",
                        name: "Trading Master",
                        description: "Complete trade history game",
                        icon: "⚖️",
                        points: 60,
                        unlocked: false
                    },
                    entrepreneur: {
                        id: "fin_entrepreneur",
                        name: "Young Entrepreneur",
                        description: "Start a virtual business",
                        icon: "💼",
                        points: 80,
                        unlocked: false
                    }
                }
            }
        };
    }

    // Skill Trees for Visual Progress
    getSkillTreeData() {
        return {
            math: {
                levels: [
                    { name: "Numbers", badges: ["math_first_steps"], unlocked: true },
                    { name: "Addition", badges: ["math_addition_ace"], requires: ["math_first_steps"] },
                    { name: "Subtraction", badges: ["math_subtraction_star"], requires: ["math_addition_ace"] },
                    { name: "Multiplication", badges: ["math_multiplication_master"], requires: ["math_subtraction_star"] },
                    { name: "Division", badges: ["math_division_detective"], requires: ["math_multiplication_master"] },
                    { name: "Wizard", badges: ["math_wizard"], requires: ["math_addition_ace", "math_subtraction_star", "math_multiplication_master", "math_division_detective"] }
                ]
            },
            language: {
                levels: [
                    { name: "Words", badges: ["lang_word_explorer"], unlocked: true },
                    { name: "Spelling", badges: ["lang_spelling_champion"], requires: ["lang_word_explorer"] },
                    { name: "Hebrew Letters", badges: ["lang_hebrew_beginner"], requires: ["lang_word_explorer"] },
                    { name: "Hebrew Reading", badges: ["lang_hebrew_reader"], requires: ["lang_hebrew_beginner"] },
                    { name: "Stories", badges: ["lang_storyteller"], requires: ["lang_spelling_champion", "lang_hebrew_reader"] }
                ]
            }
        };
    }

    // Achievement Tracking Methods
    trackAchievement(gameType, action, value = 1) {
        const subject = this.getSubjectFromGameType(gameType);
        if (!subject) return;

        const relevantBadges = this.getBadgesForAction(subject, action);
        let newlyUnlocked = [];

        relevantBadges.forEach(badge => {
            if (badge.unlocked) return;

            if (badge.target) {
                badge.progress = Math.min(badge.progress + value, badge.target);
                if (badge.progress >= badge.target) {
                    this.unlockBadge(badge.id);
                    newlyUnlocked.push(badge);
                }
            } else {
                this.unlockBadge(badge.id);
                newlyUnlocked.push(badge);
            }
        });

        this.saveAchievements();
        this.checkMasterBadges();
        
        if (newlyUnlocked.length > 0) {
            this.showBadgeNotification(newlyUnlocked);
        }

        return newlyUnlocked;
    }

    getSubjectFromGameType(gameType) {
        const typeMap = {
            'math': 'math',
            'addition': 'math',
            'subtraction': 'math',
            'multiplication': 'math',
            'division': 'math',
            'hebrew': 'language',
            'words': 'language',
            'spelling': 'language',
            'space': 'science',
            'animals': 'science',
            'geography': 'geography',
            'capitals': 'geography',
            'flags': 'geography',
            'memory': 'memory',
            'financial': 'financial'
        };
        return typeMap[gameType];
    }

    getBadgesForAction(subject, action) {
        const subjectBadges = this.badges[subject];
        if (!subjectBadges) return [];

        const actionMap = {
            'problem_solved': ['firstSteps', 'additionAce', 'subtractionStar', 'multiplicationMaster', 'divisionDetective'],
            'word_learned': ['wordExplorer'],
            'word_spelled': ['spellingChampion'],
            'hebrew_letter': ['hebrewBeginner', 'hebrewReader'],
            'story_read': ['storyteller'],
            'planet_learned': ['planetExpert'],
            'animal_classified': ['animalFriend'],
            'country_visited': ['worldTraveler'],
            'capital_matched': ['capitalMaster'],
            'flag_identified': ['flagCollector'],
            'memory_game_won': ['memoryMaster'],
            'game_completed': ['memoryNovice', 'spaceExplorer', 'animalFriend', 'jerusalemExplorer', 'moneyBasics', 'savingStar'],
            'perfect_game': ['perfectMatch', 'concentrationKing']
        };

        const relevantBadgeKeys = actionMap[action] || [];
        return relevantBadgeKeys.map(key => subjectBadges.badges[key]).filter(Boolean);
    }

    unlockBadge(badgeId) {
        Object.values(this.badges).forEach(subject => {
            Object.values(subject.badges).forEach(badge => {
                if (badge.id === badgeId) {
                    badge.unlocked = true;
                    this.achievements.push({
                        id: badgeId,
                        unlockedAt: Date.now(),
                        points: badge.points
                    });
                }
            });
        });
    }

    checkMasterBadges() {
        Object.values(this.badges).forEach(subject => {
            Object.values(subject.badges).forEach(badge => {
                if (badge.requirements && !badge.unlocked) {
                    const allRequirementsMet = badge.requirements.every(reqId => 
                        this.achievements.some(ach => ach.id === reqId)
                    );
                    if (allRequirementsMet) {
                        this.unlockBadge(badge.id);
                        this.showBadgeNotification([badge]);
                    }
                }
            });
        });
    }

    // Visual Badge Display
    displayBadges() {
        this.createBadgeDisplay();
        this.createSkillTrees();
    }

    createBadgeDisplay() {
        // Create floating badge indicator
        const badgeContainer = document.createElement('div');
        badgeContainer.id = 'badge-container';
        badgeContainer.innerHTML = `
            <div class="badge-toggle" onclick="badgeSystem.toggleBadgePanel()">
                <span class="badge-icon">🏆</span>
                <span class="badge-count">${this.achievements.length}</span>
            </div>
            <div class="badge-panel" id="badge-panel">
                <div class="badge-header">
                    <h3>🏆 Your Achievements</h3>
                    <span class="total-points">${this.getTotalPoints()} points</span>
                </div>
                <div class="badge-categories">
                    ${this.renderBadgeCategories()}
                </div>
            </div>
        `;
        
        document.body.appendChild(badgeContainer);
        this.addBadgeStyles();
    }

    renderBadgeCategories() {
        return Object.entries(this.badges).map(([key, subject]) => `
            <div class="badge-category" data-subject="${key}">
                <h4 style="color: ${subject.color}">${subject.name}</h4>
                <div class="badge-grid">
                    ${Object.values(subject.badges).map(badge => this.renderBadge(badge)).join('')}
                </div>
            </div>
        `).join('');
    }

    renderBadge(badge) {
        const isUnlocked = badge.unlocked;
        const progress = badge.target ? `${badge.progress || 0}/${badge.target}` : '';
        const progressPercent = badge.target ? ((badge.progress || 0) / badge.target * 100) : 100;
        
        return `
            <div class="badge-item ${isUnlocked ? 'unlocked' : 'locked'}" title="${badge.description}">
                <div class="badge-icon-large">${badge.icon}</div>
                <div class="badge-name">${badge.name}</div>
                <div class="badge-points">${badge.points} pts</div>
                ${badge.target ? `
                    <div class="badge-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <div class="progress-text">${progress}</div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    createSkillTrees() {
        // Skill trees will be added to curriculum pages
        // This creates the foundation for visual progression
    }

    addBadgeStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #badge-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                font-family: 'Poppins', sans-serif;
            }

            .badge-toggle {
                background: linear-gradient(135deg, #FFD700, #FFA500);
                border-radius: 50px;
                padding: 12px 16px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
            }

            .badge-toggle:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(255, 215, 0, 0.6);
            }

            .badge-icon {
                font-size: 1.5rem;
            }

            .badge-count {
                background: white;
                color: #333;
                border-radius: 15px;
                padding: 4px 8px;
                font-weight: 700;
                font-size: 0.9rem;
                min-width: 24px;
                text-align: center;
            }

            .badge-panel {
                position: absolute;
                top: 60px;
                right: 0;
                width: 400px;
                max-height: 600px;
                background: white;
                border-radius: 20px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                overflow-y: auto;
                display: none;
                border: 3px solid #FFD700;
            }

            .badge-panel.show {
                display: block;
                animation: slideIn 0.3s ease;
            }

            @keyframes slideIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .badge-header {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 20px;
                border-radius: 17px 17px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .badge-header h3 {
                margin: 0;
                font-size: 1.3rem;
            }

            .total-points {
                background: rgba(255,255,255,0.2);
                padding: 5px 12px;
                border-radius: 15px;
                font-weight: 600;
            }

            .badge-categories {
                padding: 20px;
                max-height: 500px;
                overflow-y: auto;
            }

            .badge-category {
                margin-bottom: 25px;
            }

            .badge-category h4 {
                margin-bottom: 15px;
                font-size: 1.1rem;
                font-weight: 600;
            }

            .badge-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                gap: 12px;
            }

            .badge-item {
                background: #f8f9fa;
                border-radius: 12px;
                padding: 12px 8px;
                text-align: center;
                transition: all 0.3s ease;
                border: 2px solid transparent;
                position: relative;
            }

            .badge-item.unlocked {
                background: linear-gradient(135deg, #e8f5e8, #d4f4d4);
                border-color: #4CAF50;
                box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
            }

            .badge-item.locked {
                opacity: 0.6;
                filter: grayscale(50%);
            }

            .badge-icon-large {
                font-size: 2rem;
                margin-bottom: 5px;
            }

            .badge-name {
                font-size: 0.8rem;
                font-weight: 600;
                color: #333;
                margin-bottom: 3px;
            }

            .badge-points {
                font-size: 0.7rem;
                color: #666;
                margin-bottom: 5px;
            }

            .badge-progress {
                margin-top: 5px;
            }

            .progress-bar {
                background: #e0e0e0;
                border-radius: 10px;
                height: 6px;
                overflow: hidden;
                margin-bottom: 3px;
            }

            .progress-fill {
                background: linear-gradient(90deg, #4CAF50, #45a049);
                height: 100%;
                transition: width 0.3s ease;
            }

            .progress-text {
                font-size: 0.6rem;
                color: #666;
            }

            .badge-notification {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #FFD700, #FFA500);
                color: #333;
                padding: 30px;
                border-radius: 20px;
                text-align: center;
                z-index: 10000;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                border: 3px solid #FF6B6B;
                animation: badgeUnlock 0.6s ease;
            }

            @keyframes badgeUnlock {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.1); }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }

            .badge-notification h3 {
                margin-bottom: 15px;
                font-size: 1.5rem;
            }

            .badge-notification .new-badge {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
                margin: 15px 0;
            }

            .badge-notification .badge-icon-huge {
                font-size: 3rem;
            }

            @media (max-width: 768px) {
                .badge-panel {
                    width: 300px;
                }
                
                .badge-grid {
                    grid-template-columns: repeat(3, 1fr);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Notification System
    showBadgeNotification(badges) {
        const notification = document.createElement('div');
        notification.className = 'badge-notification';
        
        notification.innerHTML = `
            <h3>🎉 Badge Unlocked!</h3>
            ${badges.map(badge => `
                <div class="new-badge">
                    <span class="badge-icon-huge">${badge.icon}</span>
                    <div>
                        <div style="font-weight: 700; font-size: 1.2rem;">${badge.name}</div>
                        <div style="margin-top: 5px;">${badge.description}</div>
                        <div style="color: #666; margin-top: 5px;">+${badge.points} points</div>
                    </div>
                </div>
            `).join('')}
            <button onclick="this.parentElement.remove()" style="margin-top: 20px; padding: 10px 20px; background: white; border: none; border-radius: 15px; font-weight: 600; cursor: pointer;">Awesome! 🎊</button>
        `;

        document.body.appendChild(notification);

        // Play achievement sound if available
        this.playAchievementSound();

        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 8000);
    }

    playAchievementSound() {
        // Create achievement sound effect
        const audioContext = window.AudioContext || window.webkitAudioContext;
        if (audioContext) {
            const ctx = new audioContext();
            const frequencies = [523, 659, 783, 1047]; // C-E-G-C chord
            
            frequencies.forEach((freq, index) => {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.1, ctx.currentTime + index * 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.1 + 0.3);
                
                oscillator.start(ctx.currentTime + index * 0.1);
                oscillator.stop(ctx.currentTime + index * 0.1 + 0.3);
            });
        }
    }

    // Panel Controls
    toggleBadgePanel() {
        const panel = document.getElementById('badge-panel');
        panel.classList.toggle('show');
    }

    // Data Persistence
    saveAchievements() {
        try {
            // Update badge progress in stored data
            const badgeData = { ...this.badges };
            localStorage.setItem('jerusalemHillsKidsBadges', JSON.stringify(badgeData));
            localStorage.setItem('jerusalemHillsKidsAchievements', JSON.stringify(this.achievements));
        } catch (e) {
            console.log('Could not save achievements');
        }
    }

    getStoredAchievements() {
        try {
            const stored = localStorage.getItem('jerusalemHillsKidsAchievements');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.log('Could not load achievements');
        }
        return [];
    }

    loadStoredBadgeProgress() {
        try {
            const stored = localStorage.getItem('jerusalemHillsKidsBadges');
            if (stored) {
                const storedBadges = JSON.parse(stored);
                // Merge with current badge structure to handle updates
                Object.keys(this.badges).forEach(subject => {
                    if (storedBadges[subject]) {
                        Object.keys(this.badges[subject].badges).forEach(badgeKey => {
                            if (storedBadges[subject].badges[badgeKey]) {
                                Object.assign(this.badges[subject].badges[badgeKey], storedBadges[subject].badges[badgeKey]);
                            }
                        });
                    }
                });
            }
        } catch (e) {
            console.log('Could not load badge progress');
        }
    }

    setupEventListeners() {
        this.loadStoredBadgeProgress();
        
        // Set up achievement tracking
        document.addEventListener('gameComplete', (e) => {
            this.trackAchievement(e.detail.gameType, 'game_completed', 1);
        });
        
        document.addEventListener('problemSolved', (e) => {
            this.trackAchievement(e.detail.gameType, 'problem_solved', 1);
        });
        
        document.addEventListener('wordLearned', (e) => {
            this.trackAchievement('words', 'word_learned', 1);
        });
        
        // Add more event listeners as needed
    }

    setupNotifications() {
        // Close badge panel when clicking outside
        document.addEventListener('click', (e) => {
            const badgeContainer = document.getElementById('badge-container');
            const panel = document.getElementById('badge-panel');
            
            if (badgeContainer && !badgeContainer.contains(e.target) && panel && panel.classList.contains('show')) {
                panel.classList.remove('show');
            }
        });
    }

    getTotalPoints() {
        return this.achievements.reduce((total, ach) => total + (ach.points || 0), 0);
    }

    // Public API for games to call
    static trackProgress(gameType, action, value = 1) {
        if (window.badgeSystem) {
            return window.badgeSystem.trackAchievement(gameType, action, value);
        }
    }

    static showProgress() {
        if (window.badgeSystem) {
            window.badgeSystem.toggleBadgePanel();
        }
    }
}

// Initialize badge system when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.badgeSystem = new BadgeSystem();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BadgeSystem;
}
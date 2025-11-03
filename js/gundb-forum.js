/**
 * Jerusalem Hills - Enhanced GunDB Forum with Game Integration
 * Real-time community discussions with game leaderboards and achievements
 */

class JerusalemHillsForum {
    constructor(options = {}) {
        this.options = {
            enableGameIntegration: true,
            enableLeaderboards: true,
            enableRealtimeUpdates: true,
            maxPostsDisplay: 50,
            enableModeration: true,
            ...options
        };

        // Initialize GunDB connection
        this.gun = Gun([
            'https://gun-manhattan.herokuapp.com/gun',
            'https://gun-us.herokuapp.com/gun',
            'https://gundb.herokuapp.com/gun'
        ]);

        this.forumNode = this.gun.get('jerusalemhills-forum-v3');
        this.leaderboardNode = this.gun.get('jerusalemhills-leaderboards');
        this.achievementsNode = this.gun.get('jerusalemhills-achievements');

        this.currentUser = this.getCurrentUser();
        this.posts = new Map();
        this.leaderboards = new Map();

        this.initializeEventHandlers();
        this.loadPosts();
        
        if (this.options.enableLeaderboards) {
            this.loadLeaderboards();
        }

        console.log('🎮 Jerusalem Hills Forum initialized with game integration');
    }

    /**
     * Get current user info from localStorage
     */
    getCurrentUser() {
        let user = JSON.parse(localStorage.getItem('jh_forum_user') || '{}');
        
        if (!user.id) {
            user = {
                id: 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now(),
                username: this.generateAnonymousName(),
                joinedAt: Date.now(),
                totalScore: 0,
                gamesPlayed: 0,
                achievements: []
            };
            localStorage.setItem('jh_forum_user', JSON.stringify(user));
        }

        return user;
    }

    /**
     * Generate anonymous username
     */
    generateAnonymousName() {
        const adjectives = ['Ancient', 'Golden', 'Sacred', 'Noble', 'Wise', 'Peaceful', 'Brave', 'Mighty'];
        const nouns = ['Pilgrim', 'Guardian', 'Scholar', 'Merchant', 'Builder', 'Keeper', 'Wanderer', 'Friend'];
        
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const num = Math.floor(Math.random() * 999) + 1;
        
        return `${adj}${noun}${num}`;
    }

    /**
     * Initialize event handlers for forum UI
     */
    initializeEventHandlers() {
        // Post submission
        const postForm = document.getElementById('forum-post-form');
        if (postForm) {
            postForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitPost();
            });
        }

        // Username change
        const usernameInput = document.getElementById('username-input');
        if (usernameInput) {
            usernameInput.value = this.currentUser.username;
            usernameInput.addEventListener('change', (e) => {
                this.changeUsername(e.target.value);
            });
        }

        // Real-time post updates
        if (this.options.enableRealtimeUpdates) {
            this.forumNode.get('posts').on(this.handlePostUpdate.bind(this));
        }

        // Leaderboard updates
        if (this.options.enableLeaderboards) {
            this.leaderboardNode.on(this.handleLeaderboardUpdate.bind(this));
        }
    }

    /**
     * Submit new post to forum
     */
    async submitPost() {
        const contentInput = document.getElementById('post-content');
        const categorySelect = document.getElementById('post-category');
        
        if (!contentInput || !contentInput.value.trim()) {
            alert('Please enter a message');
            return;
        }

        const content = this.moderateContent(contentInput.value.trim());
        const category = categorySelect ? categorySelect.value : 'general';

        const post = {
            id: 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            userId: this.currentUser.id,
            username: this.currentUser.username,
            content: content,
            category: category,
            timestamp: Date.now(),
            likes: 0,
            replies: [],
            gameContext: this.getGameContext()
        };

        // Add to GunDB
        this.forumNode.get('posts').get(post.id).put(post);

        // Clear form
        contentInput.value = '';

        // Track post submission
        if (typeof gtag !== 'undefined') {
            gtag('event', 'forum_post_submitted', {
                category: category,
                has_game_context: !!post.gameContext
            });
        }

        console.log('📝 Post submitted:', post.id);
    }

    /**
     * Get current game context if user is playing
     */
    getGameContext() {
        // Check if user recently played a game
        const recentGame = localStorage.getItem('jh_recent_game');
        if (recentGame) {
            try {
                const gameData = JSON.parse(recentGame);
                const timeDiff = Date.now() - gameData.timestamp;
                
                // Include game context if played within last hour
                if (timeDiff < 3600000) {
                    return {
                        game: gameData.game,
                        score: gameData.score,
                        achievement: gameData.achievement
                    };
                }
            } catch (e) {
                console.warn('Failed to parse recent game data');
            }
        }
        return null;
    }

    /**
     * Moderate post content for safety
     */
    moderateContent(content) {
        // Basic content moderation
        const bannedWords = ['spam', 'hate', 'abuse']; // Add more as needed
        let moderated = content;

        bannedWords.forEach(word => {
            const regex = new RegExp(word, 'gi');
            moderated = moderated.replace(regex, '***');
        });

        // Limit length
        if (moderated.length > 500) {
            moderated = moderated.substring(0, 500) + '...';
        }

        return moderated;
    }

    /**
     * Load existing posts from GunDB
     */
    loadPosts() {
        this.forumNode.get('posts').map().on((post, key) => {
            if (post && post.content && post.username) {
                this.posts.set(key, post);
                this.updatePostsDisplay();
            }
        });
    }

    /**
     * Handle real-time post updates
     */
    handlePostUpdate(data, key) {
        if (data && data.content) {
            this.posts.set(key, data);
            this.updatePostsDisplay();
            
            // Show notification for new posts (not from current user)
            if (data.userId !== this.currentUser.id) {
                this.showNotification(`New post by ${data.username}`);
            }
        }
    }

    /**
     * Update posts display in DOM
     */
    updatePostsDisplay() {
        const container = document.getElementById('forum-posts');
        if (!container) return;

        // Sort posts by timestamp (newest first)
        const sortedPosts = Array.from(this.posts.values())
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
            .slice(0, this.options.maxPostsDisplay);

        // Clear existing posts
        container.innerHTML = '';

        // Render posts
        sortedPosts.forEach(post => {
            const postElement = this.createPostElement(post);
            container.appendChild(postElement);
        });

        // Update post count
        const countElement = document.getElementById('posts-count');
        if (countElement) {
            countElement.textContent = `${this.posts.size} posts`;
        }
    }

    /**
     * Create DOM element for a post
     */
    createPostElement(post) {
        const div = document.createElement('div');
        div.className = 'forum-post';
        div.dataset.postId = post.id;

        const timeAgo = this.getTimeAgo(post.timestamp);
        const gameInfo = post.gameContext ? this.formatGameContext(post.gameContext) : '';

        div.innerHTML = `
            <div class="post-header">
                <div class="post-author">
                    <span class="username">${this.escapeHtml(post.username)}</span>
                    <span class="timestamp">${timeAgo}</span>
                    ${post.category ? `<span class="category">#${post.category}</span>` : ''}
                </div>
                <div class="post-actions">
                    <button class="like-btn" onclick="forum.likePost('${post.id}')">
                        👍 ${post.likes || 0}
                    </button>
                </div>
            </div>
            <div class="post-content">
                ${this.escapeHtml(post.content)}
                ${gameInfo}
            </div>
        `;

        return div;
    }

    /**
     * Format game context for display
     */
    formatGameContext(gameContext) {
        if (!gameContext) return '';

        return `
            <div class="game-context">
                🎮 Just played <strong>${gameContext.game}</strong>
                ${gameContext.score ? ` - Score: ${gameContext.score}` : ''}
                ${gameContext.achievement ? ` 🏆 ${gameContext.achievement}` : ''}
            </div>
        `;
    }

    /**
     * Like a post
     */
    likePost(postId) {
        const post = this.posts.get(postId);
        if (!post) return;

        const newLikes = (post.likes || 0) + 1;
        this.forumNode.get('posts').get(postId).get('likes').put(newLikes);

        // Track like
        if (typeof gtag !== 'undefined') {
            gtag('event', 'forum_post_liked', {
                post_id: postId
            });
        }
    }

    /**
     * Submit game score to leaderboard
     */
    submitGameScore(gameType, score, playerName = null) {
        const username = playerName || this.currentUser.username;
        const scoreEntry = {
            id: 'score_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            userId: this.currentUser.id,
            username: username,
            score: score,
            gameType: gameType,
            timestamp: Date.now()
        };

        // Add to leaderboard
        this.leaderboardNode.get(gameType).get(scoreEntry.id).put(scoreEntry);

        // Update user stats
        this.updateUserGameStats(gameType, score);

        // Store recent game for context
        localStorage.setItem('jh_recent_game', JSON.stringify({
            game: gameType,
            score: score,
            timestamp: Date.now()
        }));

        console.log(`🏆 Score submitted: ${gameType} - ${score}`);

        // Track score submission
        if (typeof gtag !== 'undefined') {
            gtag('event', 'game_score_submitted', {
                game_type: gameType,
                score: score
            });
        }
    }

    /**
     * Update user game statistics
     */
    updateUserGameStats(gameType, score) {
        this.currentUser.gamesPlayed = (this.currentUser.gamesPlayed || 0) + 1;
        this.currentUser.totalScore = (this.currentUser.totalScore || 0) + score;

        // Track best scores per game
        if (!this.currentUser.bestScores) {
            this.currentUser.bestScores = {};
        }

        if (!this.currentUser.bestScores[gameType] || score > this.currentUser.bestScores[gameType]) {
            this.currentUser.bestScores[gameType] = score;
            
            // Check for achievements
            this.checkAchievements(gameType, score);
        }

        // Save to localStorage
        localStorage.setItem('jh_forum_user', JSON.stringify(this.currentUser));
    }

    /**
     * Check and award achievements
     */
    checkAchievements(gameType, score) {
        const achievements = [];

        // Score-based achievements
        if (score >= 1000 && !this.currentUser.achievements.includes('high_scorer')) {
            achievements.push('high_scorer');
        }

        if (score >= 5000 && !this.currentUser.achievements.includes('master_player')) {
            achievements.push('master_player');
        }

        // Game-specific achievements
        if (gameType === 'backgammon' && score >= 100 && !this.currentUser.achievements.includes('backgammon_expert')) {
            achievements.push('backgammon_expert');
        }

        // Award new achievements
        achievements.forEach(achievement => {
            this.awardAchievement(achievement);
        });
    }

    /**
     * Award achievement to user
     */
    awardAchievement(achievementId) {
        if (this.currentUser.achievements.includes(achievementId)) return;

        this.currentUser.achievements.push(achievementId);
        localStorage.setItem('jh_forum_user', JSON.stringify(this.currentUser));

        // Store recent achievement for context
        localStorage.setItem('jh_recent_game', JSON.stringify({
            ...JSON.parse(localStorage.getItem('jh_recent_game') || '{}'),
            achievement: this.getAchievementName(achievementId),
            timestamp: Date.now()
        }));

        // Show achievement notification
        this.showAchievement(achievementId);

        console.log(`🏆 Achievement unlocked: ${achievementId}`);
    }

    /**
     * Get achievement display name
     */
    getAchievementName(achievementId) {
        const names = {
            'high_scorer': 'High Scorer - 1000+ points',
            'master_player': 'Master Player - 5000+ points',
            'backgammon_expert': 'Backgammon Expert'
        };
        return names[achievementId] || achievementId;
    }

    /**
     * Show achievement notification
     */
    showAchievement(achievementId) {
        const name = this.getAchievementName(achievementId);
        this.showNotification(`🏆 Achievement Unlocked: ${name}`, 'achievement');
    }

    /**
     * Load leaderboards from GunDB
     */
    loadLeaderboards() {
        const gameTypes = ['backgammon', 'jerusalem-crossword', 'jerusalem-mahjong', '2048', 'solitaire'];
        
        gameTypes.forEach(gameType => {
            this.leaderboardNode.get(gameType).map().on((score, key) => {
                if (score && score.score && score.username) {
                    if (!this.leaderboards.has(gameType)) {
                        this.leaderboards.set(gameType, new Map());
                    }
                    this.leaderboards.get(gameType).set(key, score);
                    this.updateLeaderboardDisplay(gameType);
                }
            });
        });
    }

    /**
     * Handle leaderboard updates
     */
    handleLeaderboardUpdate(data, key) {
        // Update leaderboard displays when new scores come in
        this.loadLeaderboards();
    }

    /**
     * Update leaderboard display for a specific game
     */
    updateLeaderboardDisplay(gameType) {
        const container = document.getElementById(`leaderboard-${gameType}`);
        if (!container) return;

        const scores = this.leaderboards.get(gameType);
        if (!scores) return;

        // Get top 10 scores
        const topScores = Array.from(scores.values())
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 10);

        // Clear and populate
        container.innerHTML = `
            <h3>${this.formatGameName(gameType)} Leaderboard</h3>
            <div class="leaderboard-list">
                ${topScores.map((score, index) => `
                    <div class="leaderboard-entry">
                        <span class="rank">#${index + 1}</span>
                        <span class="player">${this.escapeHtml(score.username)}</span>
                        <span class="score">${score.score}</span>
                        <span class="time">${this.getTimeAgo(score.timestamp)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Format game name for display
     */
    formatGameName(gameType) {
        const names = {
            'backgammon': 'Backgammon',
            'jerusalem-crossword': 'Jerusalem Crossword',
            'jerusalem-mahjong': 'Jerusalem Mahjong',
            '2048': '2048 Puzzle',
            'solitaire': 'Solitaire'
        };
        return names[gameType] || gameType;
    }

    /**
     * Change username
     */
    changeUsername(newUsername) {
        if (newUsername.length < 3 || newUsername.length > 20) {
            alert('Username must be 3-20 characters');
            return;
        }

        this.currentUser.username = newUsername;
        localStorage.setItem('jh_forum_user', JSON.stringify(this.currentUser));
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `forum-notification ${type}`;
        notification.textContent = message;
        
        // Style notification
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            padding: 15px 20px; border-radius: 8px; color: white;
            background: ${type === 'achievement' ? '#28a745' : '#2c5aa0'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-weight: bold; max-width: 300px;
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    /**
     * Utility functions
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getTimeAgo(timestamp) {
        if (!timestamp) return 'recently';
        
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'just now';
    }
}

// Make globally available
window.JerusalemHillsForum = JerusalemHillsForum;

// Auto-initialize if forum container exists
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('forum-posts') || document.querySelector('.leaderboard-container')) {
        window.forum = new JerusalemHillsForum();
        console.log('🎮 Jerusalem Hills Forum auto-initialized');
    }
});

console.log('🎮 Jerusalem Hills Forum System loaded with game integration');
/**
 * Jerusalem Hills - GunDB Multiplayer System
 * Real-time multiplayer functionality using decentralized GunDB network
 * No server required - works with static GitHub Pages hosting
 */

class JerusalemHillsMultiplayer {
    constructor(options = {}) {
        // Initialize GunDB with multiple relay peers for reliability
        this.gun = Gun([
            'https://gun-manhattan.herokuapp.com/gun',
            'https://gun-us.herokuapp.com/gun',
            'https://gundb.herokuapp.com/gun'
        ]);
        
        this.options = {
            enableChat: true,
            enableVoice: false,
            maxPlayers: 2,
            gameTimeout: 300000, // 5 minutes
            ...options
        };
        
        this.playerId = this.generatePlayerId();
        this.playerName = this.getPlayerName();
        this.currentRoom = null;
        this.gameState = {};
        this.connectionStatus = 'disconnected';
        
        // Event handlers
        this.onRoomUpdate = null;
        this.onPlayerJoin = null;
        this.onPlayerLeave = null;
        this.onGameStateUpdate = null;
        this.onChatMessage = null;
        
        this.initializePlayer();
        this.setupHeartbeat();
        
        console.log('🎮 Jerusalem Hills Multiplayer initialized:', this.playerId);
    }

    /**
     * Generate unique player identifier
     */
    generatePlayerId() {
        const stored = localStorage.getItem('jh_player_id');
        if (stored) return stored;
        
        const newId = 'player_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        localStorage.setItem('jh_player_id', newId);
        return newId;
    }

    /**
     * Get or set player display name
     */
    getPlayerName() {
        let name = localStorage.getItem('jh_player_name');
        if (!name) {
            name = this.generateAnonymousName();
            localStorage.setItem('jh_player_name', name);
        }
        return name;
    }

    /**
     * Generate Jerusalem-themed anonymous name
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
     * Initialize player presence system
     */
    initializePlayer() {
        this.playerData = {
            id: this.playerId,
            name: this.playerName,
            lastSeen: Date.now(),
            status: 'online',
            currentGame: null
        };
        
        // Update player presence
        this.gun.get('players').get(this.playerId).put(this.playerData);
    }

    /**
     * Setup heartbeat to maintain connection
     */
    setupHeartbeat() {
        setInterval(() => {
            if (this.currentRoom) {
                this.gun.get('players').get(this.playerId).get('lastSeen').put(Date.now());
            }
        }, 30000); // Update every 30 seconds
    }

    /**
     * Generate unique room identifier
     */
    generateRoomId() {
        return Math.random().toString(36).substr(2, 8).toUpperCase();
    }

    /**
     * Create a new multiplayer game room
     */
    async createRoom(gameType, gameConfig = {}) {
        const roomId = this.generateRoomId();
        const roomData = {
            id: roomId,
            gameType: gameType,
            creator: this.playerId,
            createdAt: Date.now(),
            status: 'waiting', // waiting, playing, paused, finished
            maxPlayers: gameConfig.maxPlayers || this.options.maxPlayers,
            players: {},
            gameState: gameConfig.initialState || {},
            chat: [],
            settings: {
                enableChat: gameConfig.enableChat ?? this.options.enableChat,
                private: gameConfig.private || false,
                timeLimit: gameConfig.timeLimit || this.options.gameTimeout
            }
        };
        
        // Create room in GunDB
        this.currentRoom = this.gun.get(`room_${roomId}`);
        await this.currentRoom.put(roomData);
        
        // Join as creator
        await this.joinRoom(roomId);
        
        // Generate share information
        const shareUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
        
        return {
            roomId: roomId,
            shareUrl: shareUrl,
            qrCode: await this.generateQRCode(shareUrl),
            roomData: roomData
        };
    }

    /**
     * Join an existing game room
     */
    async joinRoom(roomId) {
        try {
            this.currentRoom = this.gun.get(`room_${roomId}`);
            
            // Check if room exists and has space
            const roomExists = await this.checkRoomExists(roomId);
            if (!roomExists) {
                throw new Error('Room not found');
            }
            
            // Add player to room
            const playerData = {
                id: this.playerId,
                name: this.playerName,
                joinedAt: Date.now(),
                status: 'connected'
            };
            
            this.currentRoom.get('players').get(this.playerId).put(playerData);
            
            // Listen for room updates
            this.currentRoom.on(this.handleRoomUpdate.bind(this));
            
            // Listen for player updates
            this.currentRoom.get('players').on(this.handlePlayerUpdate.bind(this));
            
            // Listen for chat messages
            if (this.options.enableChat) {
                this.currentRoom.get('chat').on(this.handleChatUpdate.bind(this));
            }
            
            this.connectionStatus = 'connected';
            
            // Track join event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'multiplayer_room_join', {
                    room_id: roomId,
                    game_type: 'unknown'
                });
            }
            
            return roomId;
        } catch (error) {
            console.error('Failed to join room:', error);
            throw error;
        }
    }

    /**
     * Check if room exists
     */
    async checkRoomExists(roomId) {
        return new Promise((resolve) => {
            const room = this.gun.get(`room_${roomId}`);
            room.once((data) => {
                resolve(!!data);
            });
            
            // Timeout after 5 seconds
            setTimeout(() => resolve(false), 5000);
        });
    }

    /**
     * Leave current room
     */
    leaveRoom() {
        if (!this.currentRoom) return;
        
        // Mark player as disconnected
        this.currentRoom.get('players').get(this.playerId).get('status').put('disconnected');
        
        // Remove event listeners
        this.currentRoom.off();
        
        this.currentRoom = null;
        this.connectionStatus = 'disconnected';
        
        console.log('🚪 Left multiplayer room');
    }

    /**
     * Update game state
     */
    updateGameState(stateUpdate) {
        if (!this.currentRoom) {
            console.warn('No active room to update');
            return;
        }
        
        const update = {
            ...stateUpdate,
            playerId: this.playerId,
            timestamp: Date.now()
        };
        
        // Update in GunDB
        this.currentRoom.get('gameState').get(Date.now().toString()).put(update);
        
        // Track update
        if (typeof gtag !== 'undefined') {
            gtag('event', 'multiplayer_game_update', {
                update_type: stateUpdate.type || 'general'
            });
        }
    }

    /**
     * Send chat message
     */
    sendChatMessage(message) {
        if (!this.currentRoom || !this.options.enableChat) return;
        
        const chatMessage = {
            id: Date.now().toString(),
            playerId: this.playerId,
            playerName: this.playerName,
            message: this.sanitizeMessage(message),
            timestamp: Date.now()
        };
        
        this.currentRoom.get('chat').get(chatMessage.id).put(chatMessage);
    }

    /**
     * Sanitize chat message for safety
     */
    sanitizeMessage(message) {
        // Basic HTML sanitization and length limit
        return message
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/[<>&"']/g, (match) => {
                const entities = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#x27;' };
                return entities[match];
            })
            .substring(0, 200); // Limit length
    }

    /**
     * Handle room updates
     */
    handleRoomUpdate(data, key) {
        if (!data) return;
        
        if (this.onRoomUpdate) {
            this.onRoomUpdate(data, key);
        }
        
        // Handle specific updates
        if (key === 'gameState' && this.onGameStateUpdate) {
            this.onGameStateUpdate(data);
        }
    }

    /**
     * Handle player updates
     */
    handlePlayerUpdate(data, key) {
        if (!data) return;
        
        // Check for new players joining
        if (data.status === 'connected' && data.id !== this.playerId) {
            if (this.onPlayerJoin) {
                this.onPlayerJoin(data);
            }
        }
        
        // Check for players leaving
        if (data.status === 'disconnected' && data.id !== this.playerId) {
            if (this.onPlayerLeave) {
                this.onPlayerLeave(data);
            }
        }
    }

    /**
     * Handle chat updates
     */
    handleChatUpdate(data, key) {
        if (!data || data.playerId === this.playerId) return;
        
        if (this.onChatMessage) {
            this.onChatMessage(data);
        }
    }

    /**
     * Generate QR code for room sharing
     */
    async generateQRCode(url) {
        // Simple QR code generation using a service
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
        return `<img src="${qrApiUrl}" alt="QR Code for room" style="width: 150px; height: 150px;">`;
    }

    /**
     * Get current room information
     */
    getCurrentRoom() {
        return new Promise((resolve) => {
            if (!this.currentRoom) {
                resolve(null);
                return;
            }
            
            this.currentRoom.once((data) => {
                resolve(data);
            });
        });
    }

    /**
     * Get list of players in current room
     */
    async getPlayers() {
        return new Promise((resolve) => {
            if (!this.currentRoom) {
                resolve([]);
                return;
            }
            
            this.currentRoom.get('players').once((players) => {
                const playerList = Object.values(players || {})
                    .filter(p => p && typeof p === 'object' && p.id);
                resolve(playerList);
            });
        });
    }

    /**
     * Set player name
     */
    setPlayerName(name) {
        this.playerName = name.substring(0, 20); // Limit length
        localStorage.setItem('jh_player_name', this.playerName);
        
        // Update in current room if connected
        if (this.currentRoom) {
            this.currentRoom.get('players').get(this.playerId).get('name').put(this.playerName);
        }
    }

    /**
     * Check for room in URL parameters
     */
    static checkForRoomInURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('room');
    }

    /**
     * Create share modal for room
     */
    createShareModal(roomInfo) {
        const modal = document.createElement('div');
        modal.className = 'multiplayer-share-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center;
            z-index: 10000; font-family: Arial, sans-serif;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 15px; max-width: 500px; width: 90%; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                <h3 style="color: #2c5aa0; margin-bottom: 20px; font-size: 1.5rem;">🎮 Multiplayer Game Created!</h3>
                
                <div style="margin: 20px 0;">
                    <strong>Room ID:</strong> 
                    <span style="font-family: monospace; background: #f0f0f0; padding: 5px 10px; border-radius: 5px; font-size: 1.2rem;">${roomInfo.roomId}</span>
                </div>
                
                <div style="margin: 20px 0;">
                    <strong>Share URL:</strong>
                    <input type="text" value="${roomInfo.shareUrl}" readonly 
                           style="width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 5px; font-size: 0.9rem;"
                           onclick="this.select()">
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: center; margin: 20px 0; flex-wrap: wrap;">
                    <button onclick="navigator.clipboard.writeText('${roomInfo.shareUrl}').then(() => alert('Link copied!'))" 
                            style="padding: 10px 15px; background: #2c5aa0; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        📋 Copy Link
                    </button>
                    <button onclick="window.open('https://wa.me/?text=${encodeURIComponent('Join my Jerusalem Hills game: ' + roomInfo.shareUrl)}', '_blank')"
                            style="padding: 10px 15px; background: #25d366; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        💬 WhatsApp
                    </button>
                    <button onclick="window.open('mailto:?subject=Join my Jerusalem Hills game&body=${encodeURIComponent('Join my game at: ' + roomInfo.shareUrl)}', '_blank')"
                            style="padding: 10px 15px; background: #ea4335; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        📧 Email
                    </button>
                </div>
                
                <div style="margin: 20px 0;">
                    ${roomInfo.qrCode}
                    <p style="font-size: 0.9rem; color: #666; margin-top: 10px;">Scan QR code to join on mobile</p>
                </div>
                
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">
                    Close
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Remove modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        return modal;
    }

    /**
     * Destroy multiplayer instance
     */
    destroy() {
        this.leaveRoom();
        this.gun = null;
        console.log('🔌 Multiplayer system destroyed');
    }
}

// Make available globally
window.JerusalemHillsMultiplayer = JerusalemHillsMultiplayer;

// Auto-initialize if room parameter exists
document.addEventListener('DOMContentLoaded', () => {
    const roomId = JerusalemHillsMultiplayer.checkForRoomInURL();
    if (roomId) {
        console.log('🔗 Room ID detected in URL:', roomId);
        // Let individual games handle the auto-join
        window.autoJoinRoom = roomId;
    }
});

console.log('🎮 Jerusalem Hills Multiplayer System loaded');
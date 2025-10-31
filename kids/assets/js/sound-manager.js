// Sound Manager for Jerusalem Hills Kids Zone
class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = this.getSoundPreference();
        this.volume = 0.3;
        this.init();
    }

    init() {
        this.loadSounds();
        this.createSoundControls();
        console.log('🔊 Sound Manager initialized!', this.enabled ? 'Sounds ON' : 'Sounds OFF');
    }

    loadSounds() {
        // Define sound library with base64 encoded short audio clips
        const soundLibrary = {
            // UI Sounds
            click: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQxAiNABCQ=',
            
            hover: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQdKBCQ=',
            
            // Success Sounds
            success: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmSgAiNA=',
            
            achievement: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmHGH+PA=',
            
            levelUp: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmRSjIp=',
            
            // Game Sounds
            coin: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmHHH+',
            
            correct: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmOhAiND=',
            
            incorrect: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQbAiNA=',
            
            // Educational Sounds
            pop: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmDABCQ=',
            
            swoosh: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmLKBCQ=',
            
            chime: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmTRAiNA='
        };

        // Create Audio objects for each sound
        Object.keys(soundLibrary).forEach(soundName => {
            try {
                this.sounds[soundName] = new Audio(soundLibrary[soundName]);
                this.sounds[soundName].volume = this.volume;
                this.sounds[soundName].preload = 'auto';
            } catch (error) {
                console.warn(`Could not load sound: ${soundName}`, error);
            }
        });
    }

    createSoundControls() {
        // Create floating sound toggle button
        const soundToggle = document.createElement('div');
        soundToggle.className = 'sound-toggle';
        soundToggle.innerHTML = `
            <button class="sound-btn" id="soundToggleBtn" title="Toggle Sounds">
                <span class="sound-icon">${this.enabled ? '🔊' : '🔇'}</span>
            </button>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .sound-toggle {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                backdrop-filter: blur(10px);
            }

            .sound-btn {
                background: none;
                border: none;
                padding: 12px;
                cursor: pointer;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
                font-size: 20px;
            }

            .sound-btn:hover {
                background: rgba(255, 215, 0, 0.2);
                transform: scale(1.1);
            }

            .sound-icon {
                display: block;
                width: 24px;
                height: 24px;
                text-align: center;
            }

            @media (max-width: 768px) {
                .sound-toggle {
                    top: 10px;
                    right: 10px;
                }
                
                .sound-btn {
                    padding: 10px;
                    font-size: 18px;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(soundToggle);

        // Add click handler
        document.getElementById('soundToggleBtn').addEventListener('click', () => {
            this.toggle();
        });
    }

    play(soundName, options = {}) {
        if (!this.enabled) return;
        
        const sound = this.sounds[soundName];
        if (!sound) {
            console.warn(`Sound not found: ${soundName}`);
            return;
        }

        try {
            // Reset sound to beginning
            sound.currentTime = 0;
            
            // Apply volume override if provided
            if (options.volume !== undefined) {
                sound.volume = Math.min(1, Math.max(0, options.volume));
            } else {
                sound.volume = this.volume;
            }

            // Play the sound
            const playPromise = sound.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Autoplay was prevented - this is normal in some browsers
                    console.log('Sound autoplay prevented:', soundName);
                });
            }
        } catch (error) {
            console.warn(`Error playing sound ${soundName}:`, error);
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        this.saveSoundPreference();
        this.updateSoundIcon();
        
        // Play a test sound when enabling
        if (this.enabled) {
            setTimeout(() => this.play('chime'), 100);
        }
    }

    setVolume(volume) {
        this.volume = Math.min(1, Math.max(0, volume));
        
        // Update volume for all loaded sounds
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.volume;
        });
    }

    updateSoundIcon() {
        const iconElement = document.querySelector('.sound-icon');
        if (iconElement) {
            iconElement.textContent = this.enabled ? '🔊' : '🔇';
        }
    }

    getSoundPreference() {
        try {
            const saved = localStorage.getItem('jerusalemhills-sounds-enabled');
            return saved !== 'false'; // Default to enabled
        } catch (error) {
            return true; // Default to enabled if localStorage fails
        }
    }

    saveSoundPreference() {
        try {
            localStorage.setItem('jerusalemhills-sounds-enabled', this.enabled.toString());
        } catch (error) {
            console.warn('Could not save sound preference:', error);
        }
    }

    // Convenience methods for common sound patterns
    playUISound(action) {
        const soundMap = {
            click: 'click',
            hover: 'hover',
            success: 'success',
            error: 'incorrect'
        };
        
        this.play(soundMap[action] || 'click');
    }

    playGameSound(event) {
        const soundMap = {
            correct: 'correct',
            incorrect: 'incorrect',
            coin: 'coin',
            achievement: 'achievement',
            levelUp: 'levelUp'
        };
        
        this.play(soundMap[event] || 'pop');
    }

    playSequence(sounds, interval = 200) {
        if (!this.enabled) return;
        
        sounds.forEach((soundName, index) => {
            setTimeout(() => {
                this.play(soundName);
            }, index * interval);
        });
    }

    // Create celebratory sound sequence
    celebrate() {
        this.playSequence(['chime', 'success', 'achievement'], 150);
    }

    // Initialize sound effects for common elements
    attachSoundEffects() {
        // Attach to all buttons
        document.querySelectorAll('button, .btn, .game-card, .curriculum-cell').forEach(element => {
            // Hover sounds
            element.addEventListener('mouseenter', () => {
                this.play('hover', { volume: 0.2 });
            });
            
            // Click sounds
            element.addEventListener('click', () => {
                this.play('click', { volume: 0.3 });
            });
        });

        // Attach to navigation links
        document.querySelectorAll('a.nav-button, .header-nav-link').forEach(link => {
            link.addEventListener('mouseenter', () => {
                this.play('hover', { volume: 0.2 });
            });
            
            link.addEventListener('click', () => {
                this.play('pop', { volume: 0.3 });
            });
        });

        // Special sounds for Kids Zone elements
        document.querySelectorAll('.kids-zone-link').forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.play('chime', { volume: 0.3 });
            });
        });
    }

    // Method to create custom sound feedback for educational content
    createEducationalFeedback(isCorrect, difficulty = 'normal') {
        if (isCorrect) {
            const volumeMap = {
                easy: 0.4,
                normal: 0.5,
                hard: 0.6
            };
            
            this.play('correct', { volume: volumeMap[difficulty] || 0.5 });
            
            // Add extra celebration for hard problems
            if (difficulty === 'hard') {
                setTimeout(() => this.play('achievement', { volume: 0.4 }), 300);
            }
        } else {
            this.play('incorrect', { volume: 0.3 });
        }
    }

    // Method for progressive sound feedback
    createProgressFeedback(progressPercentage) {
        if (progressPercentage >= 100) {
            this.celebrate();
        } else if (progressPercentage >= 75) {
            this.play('chime');
        } else if (progressPercentage >= 50) {
            this.play('success');
        } else if (progressPercentage >= 25) {
            this.play('pop');
        }
    }
}

// Create global sound manager instance
window.soundManager = new SoundManager();

// Initialize sound effects when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all elements are rendered
    setTimeout(() => {
        window.soundManager.attachSoundEffects();
    }, 500);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundManager;
}
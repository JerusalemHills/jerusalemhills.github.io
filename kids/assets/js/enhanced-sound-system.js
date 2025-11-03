/**
 * Enhanced Sound System for Jerusalem Hills Kids Zone
 * Comprehensive educational sound effects with cultural themes
 */

class EnhancedSoundSystem extends SoundManager {
    constructor() {
        super();
        this.culturalSounds = {};
        this.educationalSounds = {};
        this.musicalSounds = {};
        this.loadEnhancedSounds();
        this.setupEducationalFeedback();
        this.setupCulturalAmbience();
    }

    loadEnhancedSounds() {
        // Educational Sound Effects (using Web Audio API for synthesis)
        this.educationalSounds = {
            // Math Sounds
            counting: this.createCountingSound(),
            addition: this.createAdditionSound(),
            multiplication: this.createMultiplicationSound(),
            subtraction: this.createSubtractionSound(),
            division: this.createDivisionSound(),
            
            // Memory Game Sounds
            cardFlip: this.createCardFlipSound(),
            match: this.createMatchSound(),
            noMatch: this.createNoMatchSound(),
            
            // Language Learning Sounds
            letterSound: this.createLetterSound(),
            wordComplete: this.createWordCompleteSound(),
            hebrewSound: this.createHebrewSound(),
            
            // Progress Sounds
            streakBonus: this.createStreakSound(),
            perfectScore: this.createPerfectScoreSound(),
            timeBonus: this.createTimeBonusSound()
        };

        // Cultural Jerusalem Sounds (simplified for web)
        this.culturalSounds = {
            // Jerusalem Ambience
            westernWall: this.createWesternWallAmbience(),
            templeMount: this.createTempleMountAmbience(),
            oldCity: this.createOldCityAmbience(),
            
            // Cultural Instruments
            shofar: this.createShofarSound(),
            bellChime: this.createBellChimeSound(),
            drummingCircle: this.createDrummingSound(),
            
            // Celebration Sounds
            hebrewCelebration: this.createHebrewCelebrationSound(),
            culturalFestival: this.createCulturalFestivalSound(),
            achievementFanfare: this.createAchievementFanfareSound(),
            
            // Heritage Quiz Sounds
            questBegin: this.createQuestBeginSound(),
            heritageCorrect: this.createHeritageCorrectSound(),
            heritageIncorrect: this.createHeritageIncorrectSound(),
            celebration: this.createCelebrationSequence()
        };

        // Musical Learning Sounds
        this.musicalSounds = {
            // Scale Sounds for Audio Learning
            doReMi: this.createDoReMiScale(),
            pentatonic: this.createPentatonicScale(),
            
            // Rhythm Patterns
            simpleRhythm: this.createSimpleRhythmPattern(),
            complexRhythm: this.createComplexRhythmPattern(),
            
            // Melody Learning
            ascendingMelody: this.createAscendingMelody(),
            descendingMelody: this.createDescendingMelody()
        };

        console.log('🎵 Enhanced sound system loaded with educational and cultural sounds');
    }

    // Web Audio API Sound Creation Methods
    createSynthSound(frequency, duration, type = 'sine', envelope = null) {
        return () => {
            if (!this.enabled) return;
            
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = frequency;
                oscillator.type = type;

                // Apply envelope if provided
                if (envelope) {
                    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(envelope.attack, audioContext.currentTime + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(envelope.sustain, audioContext.currentTime + 0.1);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                } else {
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                }

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            } catch (error) {
                console.warn('Web Audio API not available, using fallback sound');
                this.play('chime');
            }
        };
    }

    // Educational Sound Generators
    createCountingSound() {
        return () => {
            const frequencies = [523, 587, 659, 698, 784]; // C major scale
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    this.createSynthSound(freq, 0.2, 'sine')();
                }, index * 100);
            });
        };
    }

    createAdditionSound() {
        return this.createSynthSound(440, 0.3, 'triangle', {
            attack: 0.5,
            sustain: 0.3
        });
    }

    createMultiplicationSound() {
        return () => {
            [440, 523, 659].forEach((freq, index) => {
                setTimeout(() => {
                    this.createSynthSound(freq, 0.15, 'square')();
                }, index * 80);
            });
        };
    }

    createSubtractionSound() {
        return this.createSynthSound(330, 0.4, 'sawtooth', {
            attack: 0.3,
            sustain: 0.2
        });
    }

    createDivisionSound() {
        return () => {
            [659, 523, 440, 330].forEach((freq, index) => {
                setTimeout(() => {
                    this.createSynthSound(freq, 0.12, 'triangle')();
                }, index * 60);
            });
        };
    }

    createCardFlipSound() {
        return this.createSynthSound(800, 0.1, 'square');
    }

    createMatchSound() {
        return () => {
            [523, 659, 784].forEach((freq, index) => {
                setTimeout(() => {
                    this.createSynthSound(freq, 0.2, 'sine')();
                }, index * 50);
            });
        };
    }

    createNoMatchSound() {
        return this.createSynthSound(220, 0.3, 'sawtooth');
    }

    createLetterSound() {
        return this.createSynthSound(494, 0.15, 'triangle');
    }

    createWordCompleteSound() {
        return () => {
            const melody = [523, 587, 659, 784, 880];
            melody.forEach((freq, index) => {
                setTimeout(() => {
                    this.createSynthSound(freq, 0.2, 'sine')();
                }, index * 100);
            });
        };
    }

    createHebrewSound() {
        return this.createSynthSound(466, 0.25, 'triangle', {
            attack: 0.4,
            sustain: 0.3
        });
    }

    createStreakSound() {
        return () => {
            [440, 554, 659, 831].forEach((freq, index) => {
                setTimeout(() => {
                    this.createSynthSound(freq, 0.15, 'sine')();
                }, index * 40);
            });
        };
    }

    createPerfectScoreSound() {
        return () => {
            // Play a triumphant arpeggio
            [523, 659, 784, 1047, 1319].forEach((freq, index) => {
                setTimeout(() => {
                    this.createSynthSound(freq, 0.3, 'triangle')();
                }, index * 80);
            });
        };
    }

    createTimeBonusSound() {
        return () => {
            [1047, 1175, 1319, 1397, 1568].forEach((freq, index) => {
                setTimeout(() => {
                    this.createSynthSound(freq, 0.1, 'sine')();
                }, index * 30);
            });
        };
    }

    // Cultural Sound Generators
    createWesternWallAmbience() {
        return () => {
            // Simulate prayer ambience with reverb-like effects
            this.createSynthSound(220, 1.0, 'sine', {
                attack: 0.1,
                sustain: 0.05
            })();
            setTimeout(() => {
                this.createSynthSound(165, 0.8, 'triangle', {
                    attack: 0.1,
                    sustain: 0.03
                })();
            }, 200);
        };
    }

    createTempleMountAmbience() {
        return () => {
            [330, 370, 415].forEach((freq, index) => {
                setTimeout(() => {
                    this.createSynthSound(freq, 0.6, 'triangle', {
                        attack: 0.2,
                        sustain: 0.1
                    })();
                }, index * 400);
            });
        };
    }

    createOldCityAmbience() {
        return () => {
            // Create a gentle marketplace-like sound
            [294, 330, 370].forEach((freq, index) => {
                setTimeout(() => {
                    this.createSynthSound(freq, 0.4, 'sine', {
                        attack: 0.3,
                        sustain: 0.1
                    })();
                }, index * 200);
            });
        };
    }

    createShofarSound() {
        return () => {
            // Simulate shofar with slide effect
            this.createSynthSound(175, 1.2, 'sawtooth', {
                attack: 0.6,
                sustain: 0.2
            })();
        };
    }

    createBellChimeSound() {
        return () => {
            [523, 659, 784].forEach((freq, index) => {
                setTimeout(() => {
                    this.createSynthSound(freq, 1.0, 'sine', {
                        attack: 0.1,
                        sustain: 0.05
                    })();
                }, index * 300);
            });
        };
    }

    createDrummingSound() {
        return () => {
            // Create rhythmic drumming pattern
            [150, 200, 150, 200].forEach((freq, index) => {
                setTimeout(() => {
                    this.createSynthSound(freq, 0.1, 'square')();
                }, index * 150);
            });
        };
    }

    createHebrewCelebrationSound() {
        return () => {
            const celebration = [523, 587, 659, 698, 784, 880, 988];
            celebration.forEach((freq, index) => {
                setTimeout(() => {
                    this.createSynthSound(freq, 0.2, 'triangle')();
                }, index * 70);
            });
        };
    }

    createCulturalFestivalSound() {
        return () => {
            [440, 523, 659, 523, 440].forEach((freq, index) => {
                setTimeout(() => {
                    this.createSynthSound(freq, 0.25, 'sine')();
                }, index * 120);
            });
        };
    }

    createAchievementFanfareSound() {
        return () => {
            // Royal fanfare-like sound
            [523, 659, 784, 1047].forEach((freq, index) => {
                setTimeout(() => {
                    this.createSynthSound(freq, 0.4, 'triangle', {
                        attack: 0.2,
                        sustain: 0.3
                    })();
                }, index * 100);
            });
        };
    }

    // Heritage Quiz Specific Sounds
    createQuestBeginSound() {
        return () => {
            // Mystical quest beginning sound
            [330, 415, 523].forEach((freq, index) => {
                setTimeout(() => {
                    this.createSynthSound(freq, 0.6, 'sine', {
                        attack: 0.3,
                        sustain: 0.4
                    })();
                }, index * 200);
            });
        };
    }

    createHeritageCorrectSound() {
        return () => {
            // Cultural chime with Jerusalem theme
            [523, 659, 784].forEach((freq, index) => {
                setTimeout(() => {
                    this.createSynthSound(freq, 0.5, 'triangle', {
                        attack: 0.1,
                        sustain: 0.3
                    })();
                }, index * 150);
            });
            // Add cultural bell after main sound
            setTimeout(() => {
                this.culturalSounds.bellChime();
            }, 500);
        };
    }

    createHeritageIncorrectSound() {
        return () => {
            // Gentle learning tone - not harsh
            [330, 294, 262].forEach((freq, index) => {
                setTimeout(() => {
                    this.createSynthSound(freq, 0.3, 'sine', {
                        attack: 0.1,
                        sustain: 0.2
                    })();
                }, index * 100);
            });
        };
    }

    createCelebrationSequence() {
        return () => {
            // Grand celebration for quiz completion
            this.culturalSounds.achievementFanfare();
            setTimeout(() => {
                this.culturalSounds.shofar();
            }, 800);
            setTimeout(() => {
                this.culturalSounds.bellChime();
            }, 1200);
        };
    }

    // Musical Learning Sounds
    createDoReMiScale() {
        return () => {
            const scale = [523, 587, 659, 698, 784, 880, 988, 1047]; // C major scale
            scale.forEach((freq, index) => {
                setTimeout(() => {
                    this.createSynthSound(freq, 0.3, 'sine')();
                }, index * 200);
            });
        };
    }

    createPentatonicScale() {
        return () => {
            const scale = [523, 587, 659, 784, 880]; // Pentatonic scale
            scale.forEach((freq, index) => {
                setTimeout(() => {
                    this.createSynthSound(freq, 0.25, 'triangle')();
                }, index * 180);
            });
        };
    }

    createSimpleRhythmPattern() {
        return () => {
            [220, 0, 220, 0, 220, 220, 0, 220].forEach((freq, index) => {
                setTimeout(() => {
                    if (freq > 0) {
                        this.createSynthSound(freq, 0.1, 'square')();
                    }
                }, index * 120);
            });
        };
    }

    createComplexRhythmPattern() {
        return () => {
            [330, 0, 440, 330, 0, 330, 440, 0].forEach((freq, index) => {
                setTimeout(() => {
                    if (freq > 0) {
                        this.createSynthSound(freq, 0.08, 'triangle')();
                    }
                }, index * 100);
            });
        };
    }

    createAscendingMelody() {
        return () => {
            [440, 494, 523, 587, 659].forEach((freq, index) => {
                setTimeout(() => {
                    this.createSynthSound(freq, 0.4, 'sine')();
                }, index * 150);
            });
        };
    }

    createDescendingMelody() {
        return () => {
            [659, 587, 523, 494, 440].forEach((freq, index) => {
                setTimeout(() => {
                    this.createSynthSound(freq, 0.4, 'triangle')();
                }, index * 150);
            });
        };
    }

    // Enhanced Educational Methods
    setupEducationalFeedback() {
        // Math problem feedback
        this.mathFeedback = {
            correct: (difficulty) => {
                switch(difficulty) {
                    case 'easy':
                        this.educationalSounds.addition();
                        break;
                    case 'medium':
                        this.educationalSounds.multiplication();
                        setTimeout(() => this.play('chime'), 200);
                        break;
                    case 'hard':
                        this.educationalSounds.perfectScore();
                        break;
                }
            },
            
            streak: (streakCount) => {
                if (streakCount >= 5) {
                    this.educationalSounds.streakBonus();
                } else if (streakCount >= 3) {
                    this.educationalSounds.match();
                }
            },
            
            levelComplete: () => {
                this.educationalSounds.perfectScore();
                setTimeout(() => this.culturalSounds.achievementFanfare(), 500);
            }
        };

        // Memory game feedback
        this.memoryFeedback = {
            cardFlip: () => this.educationalSounds.cardFlip(),
            match: () => this.educationalSounds.match(),
            noMatch: () => this.educationalSounds.noMatch(),
            gameComplete: () => {
                this.educationalSounds.wordComplete();
                setTimeout(() => this.culturalSounds.hebrewCelebration(), 300);
            }
        };

        // Language learning feedback
        this.languageFeedback = {
            letterClick: () => this.educationalSounds.letterSound(),
            wordComplete: () => this.educationalSounds.wordComplete(),
            hebrewWord: () => this.educationalSounds.hebrewSound(),
            sentenceComplete: () => {
                this.educationalSounds.wordComplete();
                setTimeout(() => this.culturalSounds.culturalFestival(), 200);
            }
        };
    }

    setupCulturalAmbience() {
        // Jerusalem-themed background ambience
        this.culturalAmbience = {
            westernWall: () => {
                this.culturalSounds.westernWall();
                // Repeat every 10 seconds if enabled
                if (this.enabled) {
                    setTimeout(() => this.culturalAmbience.westernWall(), 10000);
                }
            },
            
            templeMount: () => {
                this.culturalSounds.templeMount();
                if (this.enabled) {
                    setTimeout(() => this.culturalAmbience.templeMount(), 12000);
                }
            },
            
            oldCity: () => {
                this.culturalSounds.oldCity();
                if (this.enabled) {
                    setTimeout(() => this.culturalAmbience.oldCity(), 8000);
                }
            }
        };
    }

    // Enhanced Game Integration Methods
    playMathSound(operation, isCorrect, difficulty = 'normal') {
        if (!this.enabled) return;

        if (isCorrect) {
            switch(operation) {
                case 'addition':
                    this.educationalSounds.addition();
                    break;
                case 'subtraction':
                    this.educationalSounds.subtraction();
                    break;
                case 'multiplication':
                    this.educationalSounds.multiplication();
                    break;
                case 'division':
                    this.educationalSounds.division();
                    break;
                default:
                    this.educationalSounds.counting();
            }
            
            // Add bonus sound for difficult problems
            if (difficulty === 'hard') {
                setTimeout(() => this.play('achievement'), 300);
            }
        } else {
            this.play('incorrect');
        }
    }

    playMemorySound(action, context = {}) {
        if (!this.enabled) return;

        switch(action) {
            case 'flip':
                this.memoryFeedback.cardFlip();
                break;
            case 'match':
                this.memoryFeedback.match();
                if (context.isJerusalemThemed) {
                    setTimeout(() => this.culturalSounds.bellChime(), 200);
                }
                break;
            case 'nomatch':
                this.memoryFeedback.noMatch();
                break;
            case 'complete':
                this.memoryFeedback.gameComplete();
                break;
        }
    }

    playLanguageSound(action, language = 'english') {
        if (!this.enabled) return;

        switch(action) {
            case 'letter':
                if (language === 'hebrew') {
                    this.languageFeedback.hebrewWord();
                } else {
                    this.languageFeedback.letterClick();
                }
                break;
            case 'word':
                this.languageFeedback.wordComplete();
                break;
            case 'sentence':
                this.languageFeedback.sentenceComplete();
                break;
        }
    }

    playCulturalSound(location) {
        if (!this.enabled) return;

        switch(location) {
            case 'western-wall':
                this.culturalSounds.westernWall();
                break;
            case 'temple-mount':
                this.culturalSounds.templeMount();
                break;
            case 'old-city':
                this.culturalSounds.oldCity();
                break;
            case 'celebration':
                this.culturalSounds.hebrewCelebration();
                break;
            case 'shofar':
                this.culturalSounds.shofar();
                break;
        }
    }

    startAmbientSounds(theme = 'old-city') {
        if (!this.enabled) return;

        this.stopAmbientSounds();
        this.currentAmbient = theme;
        
        // Start the ambient sound loop
        this.culturalAmbience[theme]();
    }

    stopAmbientSounds() {
        this.currentAmbient = null;
    }

    // Enhanced Achievement Sounds
    playAchievementSound(achievementType) {
        if (!this.enabled) return;

        switch(achievementType) {
            case 'first-game':
                this.culturalSounds.bellChime();
                break;
            case 'perfect-score':
                this.educationalSounds.perfectScore();
                break;
            case 'speed-demon':
                this.educationalSounds.timeBonus();
                break;
            case 'math-master':
                this.educationalSounds.perfectScore();
                setTimeout(() => this.culturalSounds.achievementFanfare(), 400);
                break;
            case 'memory-champion':
                this.memoryFeedback.gameComplete();
                break;
            case 'hebrew-scholar':
                this.languageFeedback.sentenceComplete();
                setTimeout(() => this.culturalSounds.shofar(), 600);
                break;
            case 'heritage-master':
                this.culturalSounds.celebration();
                break;
            default:
                this.culturalSounds.achievementFanfare();
        }
    }

    // Musical Education Integration
    playMusicalLesson(lesson) {
        if (!this.enabled) return;

        switch(lesson) {
            case 'scales':
                this.musicalSounds.doReMi();
                break;
            case 'rhythm':
                this.musicalSounds.simpleRhythm();
                break;
            case 'melody-up':
                this.musicalSounds.ascendingMelody();
                break;
            case 'melody-down':
                this.musicalSounds.descendingMelody();
                break;
        }
    }
}

// Replace the global sound manager with enhanced version
if (typeof window !== 'undefined') {
    window.soundManager = new EnhancedSoundSystem();
    
    // Export for easy access
    window.playMathSound = (operation, isCorrect, difficulty) => 
        window.soundManager.playMathSound(operation, isCorrect, difficulty);
    
    window.playMemorySound = (action, context) => 
        window.soundManager.playMemorySound(action, context);
    
    window.playLanguageSound = (action, language) => 
        window.soundManager.playLanguageSound(action, language);
    
    window.playCulturalSound = (location) => 
        window.soundManager.playCulturalSound(location);
    
    window.playAchievementSound = (type) => 
        window.soundManager.playAchievementSound(type);
    
    console.log('🎵 Enhanced Sound System ready for Kids Zone!');
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedSoundSystem;
}
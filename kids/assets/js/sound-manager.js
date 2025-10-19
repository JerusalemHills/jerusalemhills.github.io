// Sound Manager for Kids Zone Games
// Uses Web Audio API to generate sounds (no files needed!)

class SoundManager {
    constructor() {
        this.enabled = true;
        this.volume = 0.3; // 30% volume by default
        this.audioContext = null;

        // Initialize AudioContext on first user interaction
        this.initializeAudioContext();
    }

    // Initialize AudioContext (must happen after user gesture)
    initializeAudioContext() {
        // Create audio context when first sound is played
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn('Web Audio API not supported');
                this.enabled = false;
            }
        }
    }

    // Play a synthesized sound
    play(soundType) {
        if (!this.enabled) return;

        this.initializeAudioContext();

        if (!this.audioContext) return;

        try {
            switch(soundType) {
                case 'start':
                    this.playStart();
                    break;
                case 'correct':
                    this.playCorrect();
                    break;
                case 'incorrect':
                    this.playIncorrect();
                    break;
                case 'next':
                    this.playNext();
                    break;
                case 'milestone':
                    this.playMilestone();
                    break;
                case 'hint':
                    this.playHint();
                    break;
                case 'skip':
                    this.playSkip();
                    break;
                case 'flip':
                    this.playFlip();
                    break;
                case 'match':
                    this.playMatch();
                    break;
                case 'no-match':
                    this.playNoMatch();
                    break;
                case 'victory':
                    this.playVictory();
                    break;
                default:
                    console.warn('Unknown sound type:', soundType);
            }
        } catch (e) {
            console.error('Error playing sound:', e);
        }
    }

    // Create oscillator and gain nodes
    createOscillator(frequency, type = 'sine', duration = 0.3) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(this.volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

        oscillator.start(now);
        oscillator.stop(now + duration);

        return { oscillator, gainNode };
    }

    // Sound: Game Start - cheerful ascending notes
    playStart() {
        const now = this.audioContext.currentTime;

        // Three ascending notes
        [440, 550, 660].forEach((freq, i) => {
            const { oscillator, gainNode } = this.createOscillator(freq, 'sine', 0.15);
            oscillator.start(now + (i * 0.1));
            oscillator.stop(now + (i * 0.1) + 0.15);
        });
    }

    // Sound: Correct Answer - success chime
    playCorrect() {
        const now = this.audioContext.currentTime;

        // Two cheerful notes (C major chord)
        this.createOscillator(523, 'sine', 0.2); // C

        setTimeout(() => {
            this.createOscillator(659, 'sine', 0.3); // E
        }, 100);
    }

    // Sound: Incorrect Answer - gentle low tone
    playIncorrect() {
        this.createOscillator(200, 'sine', 0.4);
    }

    // Sound: Next Question - subtle swoosh
    playNext() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        const now = this.audioContext.currentTime;

        // Frequency sweep
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.15);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(this.volume * 0.5, now); // Quieter
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        oscillator.start(now);
        oscillator.stop(now + 0.15);
    }

    // Sound: Milestone - celebratory jingle
    playMilestone() {
        const now = this.audioContext.currentTime;
        const notes = [523, 659, 784, 1047]; // C E G C (octave up)

        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.createOscillator(freq, 'sine', 0.2);
            }, i * 80);
        });
    }

    // Sound: Hint - gentle chime
    playHint() {
        this.createOscillator(800, 'sine', 0.25);
    }

    // Sound: Skip - neutral whoosh
    playSkip() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        const now = this.audioContext.currentTime;

        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.2);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(this.volume * 0.6, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        oscillator.start(now);
        oscillator.stop(now + 0.2);
    }

    // Sound: Card Flip - short pop
    playFlip() {
        this.createOscillator(600, 'sine', 0.08);
    }

    // Sound: Match Found - success melody
    playMatch() {
        const now = this.audioContext.currentTime;

        // Happy chord
        [523, 659, 784].forEach((freq, i) => {
            setTimeout(() => {
                this.createOscillator(freq, 'sine', 0.3);
            }, i * 50);
        });
    }

    // Sound: No Match - gentle "oops"
    playNoMatch() {
        const now = this.audioContext.currentTime;

        this.createOscillator(350, 'sine', 0.15);
        setTimeout(() => {
            this.createOscillator(300, 'sine', 0.2);
        }, 100);
    }

    // Sound: Victory - celebratory fanfare
    playVictory() {
        const now = this.audioContext.currentTime;
        const melody = [
            { freq: 523, delay: 0 },    // C
            { freq: 659, delay: 150 },  // E
            { freq: 784, delay: 300 },  // G
            { freq: 1047, delay: 450 }, // C (high)
            { freq: 784, delay: 600 },  // G
            { freq: 1047, delay: 750 }  // C (high)
        ];

        melody.forEach(note => {
            setTimeout(() => {
                this.createOscillator(note.freq, 'sine', 0.3);
            }, note.delay);
        });
    }

    // Toggle sounds on/off
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // Set volume (0.0 to 1.0)
    setVolume(level) {
        this.volume = Math.max(0, Math.min(1, level));
    }
}

// Create global sound manager instance
const soundManager = new SoundManager();

// Resume AudioContext on first user interaction (browser requirement)
document.addEventListener('click', function resumeAudio() {
    if (soundManager.audioContext && soundManager.audioContext.state === 'suspended') {
        soundManager.audioContext.resume();
    }
}, { once: false });

console.log('🔊 Sound Manager initialized (Web Audio API)');

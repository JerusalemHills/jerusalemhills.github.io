// Web Audio API Sound Generator for Jerusalem Hills Kids Zone
// Generates sounds procedurally - works without any file downloads!

class WebAudioSounds {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.3;
        this.init();
    }

    init() {
        // Create audio context (lazy initialization to avoid autoplay issues)
        this.createAudioContext();
    }

    createAudioContext() {
        if (!this.audioContext) {
            try {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                this.audioContext = new AudioContext();
                console.log('🎵 Web Audio API initialized');
            } catch (e) {
                console.warn('Web Audio API not supported', e);
            }
        }
    }

    // Resume audio context on first user interaction (required by browsers)
    async resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    // UI SOUNDS
    playClick() {
        this.playTone(800, 0.05, 'sine', 0.1);
    }

    playHover() {
        this.playTone(600, 0.03, 'sine', 0.05);
    }

    playSuccess() {
        // Happy ascending scale
        const frequencies = [523, 659, 784]; // C5, E5, G5
        frequencies.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.15, 'sine', 0.15);
            }, i * 80);
        });
    }

    playError() {
        // Gentle descending tone (not harsh!)
        this.playTone(400, 0.2, 'sine', 0.1, 0.05);
        setTimeout(() => {
            this.playTone(300, 0.2, 'sine', 0.1, 0.05);
        }, 100);
    }

    playAchievement() {
        // Triumphant fanfare
        const melody = [
            { freq: 523, duration: 0.15 },  // C5
            { freq: 659, duration: 0.15 },  // E5
            { freq: 784, duration: 0.15 },  // G5
            { freq: 1047, duration: 0.3 }   // C6
        ];

        melody.forEach((note, i) => {
            setTimeout(() => {
                this.playTone(note.freq, note.duration, 'triangle', 0.2);
            }, i * 120);
        });
    }

    playLevelUp() {
        // Magical ascending arpeggio
        const frequencies = [523, 659, 784, 1047, 1319]; // C major pentatonic
        frequencies.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.15, 'triangle', 0.15);
            }, i * 60);
        });
    }

    playCoin() {
        // Classic coin pickup sound
        this.playTone(988, 0.1, 'square', 0.15);
        setTimeout(() => {
            this.playTone(1319, 0.15, 'square', 0.1);
        }, 50);
    }

    playStar() {
        // Sparkly star sound
        this.playTone(1568, 0.1, 'sine', 0.15);
        setTimeout(() => {
            this.playTone(2093, 0.1, 'sine', 0.12);
        }, 60);
        setTimeout(() => {
            this.playTone(2637, 0.15, 'sine', 0.1);
        }, 120);
    }

    playWhoosh() {
        // Swoosh transition
        this.playSweep(800, 200, 0.15, 'sawtooth', 0.15);
    }

    playPop() {
        // Bubble pop
        this.playTone(1200, 0.08, 'sine', 0.1, 0.02);
    }

    // EDUCATIONAL SOUNDS
    playCorrect() {
        // Positive feedback - ascending perfect fifth
        this.playTone(659, 0.12, 'sine', 0.15);
        setTimeout(() => {
            this.playTone(988, 0.18, 'sine', 0.15);
        }, 80);
    }

    playIncorrect() {
        // Gentle "try again" sound (encouraging, not harsh)
        this.playTone(440, 0.15, 'sine', 0.1, 0.05);
        setTimeout(() => {
            this.playTone(392, 0.2, 'sine', 0.08, 0.05);
        }, 100);
    }

    playCardFlip() {
        // Quick flip sound
        this.playSweep(400, 800, 0.1, 'triangle', 0.12);
    }

    playCardMatch() {
        // Match found - happy chime
        this.playTone(880, 0.15, 'sine', 0.15);
        setTimeout(() => {
            this.playTone(1108, 0.2, 'sine', 0.15);
        }, 80);
    }

    playLetterSelect() {
        // Letter selection
        this.playTone(740, 0.08, 'sine', 0.12);
    }

    playWordComplete() {
        // Word completed successfully
        const notes = [523, 659, 784, 1047]; // C major chord arpeggio
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.15, 'triangle', 0.15);
            }, i * 70);
        });
    }

    playCountingTick() {
        // Gentle tick for counting
        this.playTone(1000, 0.05, 'sine', 0.08);
    }

    playNumberAppear() {
        // Number pops into view
        this.playTone(880, 0.08, 'triangle', 0.1);
    }

    // STREAK & COMBO SOUNDS
    playStreak(count) {
        // Different sounds for different streak levels
        if (count >= 10) {
            this.playAchievement();
        } else if (count >= 5) {
            this.playSuccess();
        } else {
            this.playCorrect();
        }
    }

    playPerfectScore() {
        // Major celebration
        const melody = [
            523, 659, 784, 1047,  // Ascending C major
            1047, 1319, 1568      // Continue upward
        ];

        melody.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.12, 'sine', 0.15);
            }, i * 60);
        });
    }

    // LOW-LEVEL AUDIO GENERATION
    playTone(frequency, duration, waveType = 'sine', volume = 0.3, fadeOut = 0.1) {
        if (!this.enabled || !this.audioContext) return;

        this.resumeContext();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.type = waveType;
        oscillator.frequency.value = frequency;

        // Apply volume
        const adjustedVolume = volume * this.volume;
        gainNode.gain.value = adjustedVolume;

        // Fade out to avoid clicks
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(adjustedVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

        oscillator.start(now);
        oscillator.stop(now + duration + fadeOut);
    }

    playSweep(startFreq, endFreq, duration, waveType = 'sine', volume = 0.3) {
        if (!this.enabled || !this.audioContext) return;

        this.resumeContext();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.type = waveType;

        const now = this.audioContext.currentTime;
        oscillator.frequency.setValueAtTime(startFreq, now);
        oscillator.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

        const adjustedVolume = volume * this.volume;
        gainNode.gain.value = adjustedVolume;
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    playChord(frequencies, duration, waveType = 'sine', volume = 0.3) {
        frequencies.forEach(freq => {
            this.playTone(freq, duration, waveType, volume / frequencies.length);
        });
    }

    // CONTROL METHODS
    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    isEnabled() {
        return this.enabled;
    }
}

// Global instance
window.webAudioSounds = new WebAudioSounds();

// Initialize on first user interaction
document.addEventListener('click', () => {
    window.webAudioSounds.resumeContext();
}, { once: true });

console.log('🎵 Web Audio Sounds ready! All games have sound without any downloads.');

# Kids Zone Sound Effects Implementation Plan

## 🔴 Overview

This document outlines the sound effects system for Jerusalem Hills Kids Zone games. All sounds will be:
- **Short** (< 1 second for most, < 2 seconds for special events)
- **Lightweight** (< 50KB each, preferably < 20KB)
- **Child-friendly** (positive, encouraging, fun)
- **Creative Commons** or **Public Domain**
- **Format**: MP3 or OGG (browser compatible)

---

## 🟡 Sound Events by Game

### **Math Quest (Addition Game)**

| Event | Sound Description | Trigger Point | File Name |
|-------|------------------|---------------|-----------|
| **Game Start** | Cheerful "boing" or "ding" | Click "Start Game" button | `start.mp3` |
| **Correct Answer** | Success chime, "ding-ding" | User enters correct answer | `correct.mp3` |
| **Incorrect Answer** | Gentle "whoops" tone | User enters wrong answer | `incorrect.mp3` |
| **New Question** | Subtle "swoosh" or page turn | After answer feedback | `next-question.mp3` |
| **High Score** | Celebratory jingle | Score reaches 5, 10, 15, etc. | `milestone.mp3` |

**Code Integration Points:**
- Line 89-93: `start` button click → play `start.mp3`
- Line 114-117: Correct answer → play `correct.mp3`
- Line 118-121: Incorrect answer → play `incorrect.mp3`
- Line 79-87: `newQuestion()` → play `next-question.mp3` (subtle)
- Line 115-116: Check if `score % 5 === 0` → play `milestone.mp3`

---

### **Word Builder (Unscramble Game)**

| Event | Sound Description | Trigger Point | File Name |
|-------|------------------|---------------|-----------|
| **Game Load** | Upbeat startup tone | Page loads (window.onload) | `start.mp3` (shared) |
| **Correct Answer** | Success melody, "ta-da!" | User unscrambles correctly | `correct.mp3` (shared) |
| **Incorrect Guess** | Gentle "try again" tone | User enters wrong word | `incorrect.mp3` (shared) |
| **Hint Given** | Light "hint" chime | Show hint after wrong answer | `hint.mp3` |
| **Skip Word** | Neutral "whoosh" transition | Click "Skip Word" button | `skip.mp3` |
| **New Word** | Subtle card shuffle sound | New word presented | `next-question.mp3` (shared) |

**Code Integration Points:**
- Line 132: `window.onload = newWord` → play `start.mp3` (optional, may be too much)
- Line 119-124: Correct answer → play `correct.mp3`
- Line 125-128: Incorrect answer → play `incorrect.mp3`, then `hint.mp3` when showing hint
- Line 101: `skip` button → play `skip.mp3`
- Line 91-98: `newWord()` → play `next-question.mp3` (very subtle)

---

### **Memory Match (Pair Matching Game)**

| Event | Sound Description | Trigger Point | File Name |
|-------|------------------|---------------|-----------|
| **Game Start** | "Let's play!" chime | Click "New Game" button | `start.mp3` (shared) |
| **Card Flip** | Light "flip" or "pop" | Click any card | `flip.mp3` |
| **Match Found** | Success chime, "match!" | Two cards match | `match.mp3` |
| **No Match** | Gentle "oops" tone | Cards don't match | `no-match.mp3` |
| **Game Complete** | Victory fanfare (2-3 sec) | All pairs matched | `victory.mp3` |

**Code Integration Points:**
- Line 73-97: `initGame()` → play `start.mp3`
- Line 106: Card click (show emoji) → play `flip.mp3`
- Line 119-130: Match found → play `match.mp3`
- Line 127-129: All matches complete → play `victory.mp3`
- Line 131-135: No match → play `no-match.mp3`

---

## 🟢 Sound File Requirements

### File Specifications
```
Format: MP3 (widely supported)
Bitrate: 64-96 kbps (balance quality vs. size)
Sample Rate: 22050 Hz (adequate for simple sounds)
Channels: Mono (smaller file size)
Length: 0.3-1.0 seconds (most), 2-3 seconds (victory only)
Target Size: < 20KB per file
```

### Sound Library Recommendations

**Free Sound Sources (Creative Commons / Public Domain):**

1. **Freesound.org** (Creative Commons)
   - https://freesound.org
   - Search tags: "correct", "success", "chime", "ding", "whoosh", "flip", "kid-friendly"
   - Filter by: CC0 (Public Domain) or CC-BY (attribution required)

2. **Zapsplat.com** (Free with attribution)
   - https://www.zapsplat.com
   - Category: Game Sounds → UI Sounds
   - Tags: "button", "success", "error", "notification"

3. **Mixkit.co** (Free, no attribution)
   - https://mixkit.co/free-sound-effects/
   - Category: Game Sounds, UI Sounds
   - Pre-optimized for web

4. **OpenGameArt.org** (Open Source)
   - https://opengameart.org/art-search-advanced?keys=&field_art_type_tid%5B%5D=13
   - Filter: Sound Effects
   - License: CC0, CC-BY

5. **Kenney.nl** (Public Domain)
   - https://www.kenney.nl/assets?q=audio
   - Game assets including sound effects
   - All CC0 (no attribution required)

---

## 🔴 Sound Files Needed (Total: 9 unique sounds)

| File Name | Description | Used In | Estimated Size | Priority |
|-----------|-------------|---------|----------------|----------|
| **start.mp3** | Game start chime | All 3 games | 15KB | 🔴 High |
| **correct.mp3** | Success/correct answer | Math, Words | 18KB | 🔴 High |
| **incorrect.mp3** | Wrong answer (gentle) | Math, Words | 18KB | 🔴 High |
| **next-question.mp3** | Subtle transition | Math, Words | 12KB | 🟡 Medium |
| **milestone.mp3** | Score milestone jingle | Math | 20KB | 🟢 Low |
| **hint.mp3** | Hint given chime | Words | 15KB | 🟡 Medium |
| **skip.mp3** | Neutral transition | Words | 12KB | 🟢 Low |
| **flip.mp3** | Card flip sound | Memory | 10KB | 🔴 High |
| **match.mp3** | Pair matched | Memory | 18KB | 🔴 High |
| **no-match.mp3** | Cards don't match | Memory | 15KB | 🟡 Medium |
| **victory.mp3** | Game complete fanfare | Memory | 35KB | 🔴 High |

**Total Storage:** ~188KB for all sounds

---

## 🟡 Implementation Code

### Step 1: Create Sound Manager Utility

Create `/kids/assets/js/sound-manager.js`:

```javascript
// Sound Manager for Kids Zone Games
// Handles loading and playing sound effects

class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.5; // 50% volume by default
    }

    // Load a sound file
    loadSound(name, path) {
        this.sounds[name] = new Audio(path);
        this.sounds[name].volume = this.volume;
        this.sounds[name].preload = 'auto';
    }

    // Play a sound
    play(name) {
        if (!this.enabled || !this.sounds[name]) return;

        // Clone audio to allow overlapping sounds
        const sound = this.sounds[name].cloneNode();
        sound.volume = this.volume;
        sound.play().catch(err => {
            // Silently fail if autoplay blocked
            console.log('Sound play prevented:', err.message);
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
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.volume;
        });
    }
}

// Create global sound manager instance
const soundManager = new SoundManager();
```

### Step 2: Load Sounds in Each Game

Add to the `<head>` of each game HTML:

```html
<!-- Sound Manager -->
<script src="../assets/js/sound-manager.js"></script>
```

Add to the `<script>` section (before game logic):

```javascript
// Load sound effects
soundManager.loadSound('start', '../assets/sounds/start.mp3');
soundManager.loadSound('correct', '../assets/sounds/correct.mp3');
soundManager.loadSound('incorrect', '../assets/sounds/incorrect.mp3');
soundManager.loadSound('next', '../assets/sounds/next-question.mp3');

// Game-specific sounds
// For Math:
soundManager.loadSound('milestone', '../assets/sounds/milestone.mp3');

// For Words:
soundManager.loadSound('hint', '../assets/sounds/hint.mp3');
soundManager.loadSound('skip', '../assets/sounds/skip.mp3');

// For Memory:
soundManager.loadSound('flip', '../assets/sounds/flip.mp3');
soundManager.loadSound('match', '../assets/sounds/match.mp3');
soundManager.loadSound('no-match', '../assets/sounds/no-match.mp3');
soundManager.loadSound('victory', '../assets/sounds/victory.mp3');
```

### Step 3: Add Sound Triggers

**Math Quest Example:**

```javascript
// Line 89-93: Start button
document.getElementById('start').onclick = () => {
    soundManager.play('start');  // ADD THIS
    score = 0;
    s.textContent = `Score: ${score}`;
    newQuestion();
};

// Line 114-117: Correct answer
if (userAnswer === answer) {
    score++;
    soundManager.play('correct');  // ADD THIS
    if (score % 5 === 0 && score > 0) {
        soundManager.play('milestone');  // Milestone bonus sound
    }
    r.textContent = "✅ Correct! Great job!";
    r.style.color = "#4CAF50";
}

// Line 118-121: Incorrect answer
else {
    soundManager.play('incorrect');  // ADD THIS
    r.textContent = `❌ Not quite! The answer is ${answer}`;
    r.style.color = "#ff6f61";
}

// Line 79-87: New question (subtle)
function newQuestion() {
    soundManager.play('next');  // ADD THIS (very subtle sound)
    num1 = Math.floor(Math.random() * 10) + 1;
    num2 = Math.floor(Math.random() * 10) + 1;
    // ... rest of function
}
```

**Word Builder Example:**

```javascript
// Line 119-124: Correct answer
if (g === current) {
    score++;
    soundManager.play('correct');  // ADD THIS
    res.textContent = "✅ Correct! Well done!";
    res.style.color = "#4CAF50";
    scoreDisplay.textContent = `Score: ${score}`;
    setTimeout(newWord, 1500);
}

// Line 125-128: Incorrect answer with hint
else {
    soundManager.play('incorrect');  // ADD THIS
    setTimeout(() => soundManager.play('hint'), 300);  // Play hint sound after error
    res.textContent = `❌ Try again! Hint: starts with "${current[0]}"`;
    res.style.color = "#ff6f61";
}

// Line 101: Skip button
document.getElementById('skip').onclick = () => {
    soundManager.play('skip');  // ADD THIS
    newWord();
};
```

**Memory Match Example:**

```javascript
// Line 73-97: Init game
function initGame() {
    soundManager.play('start');  // ADD THIS
    matches = 0;
    // ... rest of function
}

// Line 106: Card flip
function handleCardClick() {
    if (lock || this === first || this.style.visibility === 'hidden' || this.textContent !== '') {
        return;
    }

    soundManager.play('flip');  // ADD THIS
    this.textContent = this.dataset.emoji;
    // ... rest of function
}

// Line 119-130: Match found
if (first.dataset.emoji === second.dataset.emoji) {
    soundManager.play('match');  // ADD THIS
    first.style.visibility = 'hidden';
    second.style.visibility = 'hidden';
    matches++;

    if (matches === emojis.length) {
        soundManager.play('victory');  // Game complete!
        document.getElementById('message').textContent = "🎉 You matched all pairs! Great job!";
    }
}

// Line 131-135: No match
else {
    soundManager.play('no-match');  // ADD THIS
    first.textContent = "";
    second.textContent = "";
}
```

### Step 4: Add Sound Toggle Button (Optional)

Add to each game's header:

```html
<header>
    <h1>🧮 Math Quest</h1>
    <button id="sound-toggle" class="sound-toggle" title="Toggle Sound">🔊</button>
    <div class="game-nav">
        <!-- existing nav -->
    </div>
</header>
```

Add to game script:

```javascript
// Sound toggle functionality
document.getElementById('sound-toggle').onclick = function() {
    const enabled = soundManager.toggle();
    this.textContent = enabled ? '🔊' : '🔇';
    this.title = enabled ? 'Turn Sound Off' : 'Turn Sound On';
};
```

Add to CSS:

```css
.sound-toggle {
    position: absolute;
    top: 10px;
    right: 10px;
    background: white;
    border: 2px solid #667eea;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.2s;
}

.sound-toggle:hover {
    background: #667eea;
    transform: scale(1.1);
}
```

---

## 🟢 Privacy & Performance Considerations

### Browser Autoplay Policies
- **Issue**: Browsers block autoplay without user interaction
- **Solution**: Sounds only play after user clicks buttons (compliant)
- **Fallback**: Silent failure if autoplay blocked (no error shown to user)

### File Size Optimization
```bash
# Convert to optimized MP3 (requires ffmpeg)
ffmpeg -i input.wav -codec:a libmp3lame -b:a 64k -ar 22050 -ac 1 output.mp3

# Compress existing MP3
ffmpeg -i input.mp3 -codec:a libmp3lame -b:a 64k -ar 22050 -ac 1 output-optimized.mp3
```

### Lazy Loading
Sounds are loaded when game page loads, not on site entry (kids zone has no sounds on homepage).

### COPPA Compliance
- ✅ No external sound APIs (all local files)
- ✅ No tracking or analytics on sound usage
- ✅ No cookies or storage used
- ✅ Completely offline-capable

---

## 🔴 Implementation Checklist

### Phase 1: Setup (30 minutes)
- [ ] Create `/kids/assets/sounds/` directory
- [ ] Download sound files from Creative Commons sources
- [ ] Optimize sound files (< 20KB each)
- [ ] Create `sound-manager.js` utility script
- [ ] Test sound manager loads correctly

### Phase 2: Math Quest (20 minutes)
- [ ] Add sound manager script to math.html
- [ ] Load required sounds (start, correct, incorrect, next, milestone)
- [ ] Add sound triggers to button clicks
- [ ] Test all sound events
- [ ] Add sound toggle button

### Phase 3: Word Builder (20 minutes)
- [ ] Add sound manager script to words.html
- [ ] Load required sounds (start, correct, incorrect, hint, skip)
- [ ] Add sound triggers to game events
- [ ] Test all sound events
- [ ] Add sound toggle button

### Phase 4: Memory Match (20 minutes)
- [ ] Add sound manager script to memory.html
- [ ] Load required sounds (start, flip, match, no-match, victory)
- [ ] Add sound triggers to card interactions
- [ ] Test all sound events
- [ ] Add sound toggle button

### Phase 5: Testing & Polish (30 minutes)
- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on mobile devices (iOS Safari, Android Chrome)
- [ ] Verify autoplay works after user interaction
- [ ] Verify sound toggle persists during game
- [ ] Check file sizes (total < 200KB)
- [ ] Verify no console errors
- [ ] Test with sound off (fallback)

### Phase 6: Deployment
- [ ] Commit sound files to repository
- [ ] Update CLAUDE.md with sound system documentation
- [ ] Add attribution file if required by CC licenses
- [ ] Deploy to GitHub Pages
- [ ] Test live site

---

## 🟡 Attribution Requirements

If using Creative Commons sounds (CC-BY), create `/kids/assets/sounds/ATTRIBUTION.md`:

```markdown
# Sound Effects Attribution

All sound effects used in Jerusalem Hills Kids Zone are licensed under Creative Commons.

## Sound Files

- **start.mp3** - "Game Start Chime" by [Author Name] - CC-BY 3.0 - https://freesound.org/people/...
- **correct.mp3** - "Success Sound" by [Author Name] - CC0 (Public Domain)
- **flip.mp3** - "Card Flip" by [Author Name] - CC-BY 4.0 - https://freesound.org/people/...
- [etc...]

## Licenses

- **CC0 (Public Domain)**: No attribution required, but we credit creators anyway
- **CC-BY**: Attribution required, provided above
- All sounds optimized for web (MP3, 64kbps, 22.05kHz, mono)
```

---

## 🟢 Alternative: Web Audio API (Advanced)

For future enhancement, consider using Web Audio API for:
- Dynamic volume control
- Sound effects (reverb, delay)
- Synthesized sounds (no file downloads)
- Better performance

Example synthesized "ding" sound (no file needed):

```javascript
function playDing() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800; // 800Hz
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}
```

---

## 🔴 Recommended Next Steps

1. **Download Sounds** (Use Kenney.nl or Mixkit for CC0/free sounds)
2. **Create sound-manager.js**
3. **Implement in one game** (start with Math Quest as test)
4. **Test thoroughly**
5. **Roll out to other games**

**Estimated Total Time:** 2-3 hours for complete implementation

**Files to Create:**
- `/kids/assets/sounds/` directory with 11 MP3 files (~188KB total)
- `/kids/assets/js/sound-manager.js` (utility script)
- `/kids/assets/sounds/ATTRIBUTION.md` (if using CC-BY sounds)

**Files to Modify:**
- `/kids/games/math.html`
- `/kids/games/words.html`
- `/kids/games/memory.html`

---

**Last Updated:** October 19, 2025
**Status:** Ready for Implementation
**Priority:** Medium (enhances UX, not critical)

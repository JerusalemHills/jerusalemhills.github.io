// Curriculum Explorer JavaScript

class CurriculumExplorer {
    constructor() {
        this.currentLevel = 'all';
        this.progressData = this.loadProgress();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProgressBars();
        this.setupCellInteractions();
        console.log('🎓 Curriculum Explorer initialized!');
    }

    setupEventListeners() {
        // Level selector buttons
        const levelButtons = document.querySelectorAll('.level-btn');
        levelButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const level = e.target.dataset.level;
                this.filterByLevel(level);
                this.updateActiveButton(e.target);
            });
        });

        // Curriculum cells
        const cells = document.querySelectorAll('.curriculum-cell');
        cells.forEach(cell => {
            cell.addEventListener('click', (e) => {
                this.openSubject(e.currentTarget);
            });
        });
    }

    filterByLevel(level) {
        this.currentLevel = level;
        const rows = document.querySelectorAll('.grid-row');
        
        rows.forEach(row => {
            if (level === 'all' || row.dataset.level === level) {
                row.classList.remove('hidden');
            } else {
                row.classList.add('hidden');
            }
        });

        // Animate visible cells
        setTimeout(() => {
            const visibleCells = document.querySelectorAll('.grid-row:not(.hidden) .curriculum-cell');
            visibleCells.forEach((cell, index) => {
                setTimeout(() => {
                    cell.style.animation = 'unlock 0.3s ease-out';
                }, index * 50);
            });
        }, 100);
    }

    updateActiveButton(activeBtn) {
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    openSubject(cell) {
        const subject = cell.dataset.subject;
        const level = cell.dataset.level;
        
        // Add click animation
        cell.style.transform = 'scale(0.95)';
        setTimeout(() => {
            cell.style.transform = '';
        }, 150);

        // Play interaction sound
        this.playSound('click');

        // Navigate to subject page
        const subjectUrl = `subjects/${subject}.html?level=${level}`;
        
        // For now, show a preview modal instead of navigation
        this.showSubjectPreview(subject, level, cell);
    }

    showSubjectPreview(subject, level, cell) {
        const modal = this.createSubjectModal(subject, level, cell);
        document.body.appendChild(modal);
        
        // Animate modal appearance
        setTimeout(() => {
            modal.classList.add('visible');
        }, 10);
    }

    createSubjectModal(subject, level, cell) {
        const cellTitle = cell.querySelector('.cell-title').textContent;
        const cellDesc = cell.querySelector('.cell-desc').textContent;
        const cellIcon = cell.querySelector('.cell-icon').textContent;
        
        const modal = document.createElement('div');
        modal.className = 'subject-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-icon">${cellIcon}</div>
                    <h3>${cellTitle}</h3>
                    <p>Level ${level} • ${cellDesc}</p>
                    <button class="modal-close" onclick="this.closest('.subject-modal').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="coming-soon">
                        <h4>🚀 Coming Soon!</h4>
                        <p>This amazing ${subject} adventure is being prepared for you!</p>
                        <div class="preview-features">
                            <div class="feature">🎮 Interactive Games</div>
                            <div class="feature">🏆 Achievement Badges</div>
                            <div class="feature">📊 Progress Tracking</div>
                            <div class="feature">🎯 Skill Challenges</div>
                        </div>
                        <button class="preview-btn" onclick="this.closest('.subject-modal').remove()">
                            🔔 Notify Me When Ready
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    }

    loadProgressBars() {
        const progressBars = document.querySelectorAll('.progress');
        progressBars.forEach(bar => {
            const cell = bar.closest('.curriculum-cell');
            const subject = cell.dataset.subject;
            const level = cell.dataset.level;
            const key = `${subject}-${level}`;
            
            const progress = this.progressData[key] || 0;
            bar.style.width = `${progress}%`;
            
            // Add completion indicator
            if (progress === 100) {
                cell.classList.add('completed');
                const completionBadge = document.createElement('div');
                completionBadge.className = 'completion-badge';
                completionBadge.innerHTML = '✅';
                cell.appendChild(completionBadge);
            }
        });
    }

    setupCellInteractions() {
        const cells = document.querySelectorAll('.curriculum-cell');
        cells.forEach(cell => {
            // Hover effects
            cell.addEventListener('mouseenter', () => {
                this.playSound('hover');
                cell.style.transform = 'translateY(-2px) scale(1.02)';
            });
            
            cell.addEventListener('mouseleave', () => {
                cell.style.transform = '';
            });
            
            // Touch effects for mobile
            cell.addEventListener('touchstart', () => {
                cell.style.transform = 'scale(0.98)';
            });
            
            cell.addEventListener('touchend', () => {
                cell.style.transform = '';
            });
        });
    }

    updateProgress(subject, level, progress) {
        const key = `${subject}-${level}`;
        this.progressData[key] = progress;
        this.saveProgress();
        
        // Update visual progress bar
        const cell = document.querySelector(`[data-subject="${subject}"][data-level="${level}"]`);
        if (cell) {
            const progressBar = cell.querySelector('.progress');
            progressBar.style.width = `${progress}%`;
            
            // Celebration animation for completion
            if (progress === 100) {
                this.celebrateCompletion(cell);
            }
        }
    }

    celebrateCompletion(cell) {
        // Play celebration sound
        this.playSound('complete');
        
        // Add completion effects
        cell.classList.add('completed');
        
        // Create celebration particles
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'celebration-particle';
            particle.innerHTML = ['🌟', '✨', '🎉', '🏆'][Math.floor(Math.random() * 4)];
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 2 + 's';
            cell.appendChild(particle);
            
            setTimeout(() => particle.remove(), 3000);
        }
        
        // Add completion badge
        if (!cell.querySelector('.completion-badge')) {
            const badge = document.createElement('div');
            badge.className = 'completion-badge';
            badge.innerHTML = '✅';
            cell.appendChild(badge);
        }
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('jerusalemhills-curriculum-progress');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.warn('Could not load progress data:', e);
            return {};
        }
    }

    saveProgress() {
        try {
            localStorage.setItem('jerusalemhills-curriculum-progress', JSON.stringify(this.progressData));
        } catch (e) {
            console.warn('Could not save progress data:', e);
        }
    }

    playSound(type) {
        // Check if sounds are enabled
        if (!this.soundsEnabled()) return;
        
        const sounds = {
            hover: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQxAiNLqHaXe5CjhBLXKJhJWJJjG',
            click: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmXGH+',
            complete: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQxSjIp'
        };
        
        if (sounds[type]) {
            const audio = new Audio(sounds[type]);
            audio.volume = 0.3;
            audio.play().catch(() => {}); // Ignore autoplay restrictions
        }
    }

    soundsEnabled() {
        return localStorage.getItem('jerusalemhills-sounds-enabled') !== 'false';
    }

    // Demo function to simulate progress
    simulateProgress() {
        const subjects = ['math', 'literacy', 'science', 'social', 'financial'];
        const levels = ['1', '2', '3', '4'];
        
        subjects.forEach(subject => {
            levels.forEach(level => {
                const progress = Math.floor(Math.random() * 101);
                this.updateProgress(subject, level, progress);
            });
        });
    }

    // Export progress data
    exportProgress() {
        const data = {
            progress: this.progressData,
            timestamp: new Date().toISOString(),
            platform: 'Jerusalem Hills Kids Curriculum'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'curriculum-progress.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    // Reset all progress
    resetProgress() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            this.progressData = {};
            this.saveProgress();
            location.reload();
        }
    }
}

// Add modal styles
const modalStyles = `
<style>
.subject-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s;
}

.subject-modal.visible {
    opacity: 1;
}

.modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
}

.modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
    text-align: center;
    margin-bottom: 1.5rem;
    position: relative;
}

.modal-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.modal-close {
    position: absolute;
    top: -1rem;
    right: -1rem;
    background: #FF6B6B;
    color: white;
    border: none;
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    cursor: pointer;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.coming-soon {
    text-align: center;
}

.preview-features {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin: 1.5rem 0;
}

.feature {
    background: #E3F2FD;
    padding: 1rem;
    border-radius: 0.5rem;
    font-weight: 600;
    color: #1565C0;
}

.preview-btn {
    background: linear-gradient(135deg, #4CAF50, #45A049);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 2rem;
    font-weight: 600;
    cursor: pointer;
    font-size: 1rem;
    margin-top: 1rem;
}

.completion-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #4CAF50;
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.celebration-particle {
    position: absolute;
    font-size: 1.5rem;
    pointer-events: none;
    animation: celebration 3s ease-out forwards;
}

@keyframes celebration {
    0% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
    100% {
        opacity: 0;
        transform: translateY(-100px) scale(0.5);
    }
}

.curriculum-cell.completed {
    border-color: #4CAF50;
    background: linear-gradient(135deg, #E8F5E9, #F1F8E9);
}

@media (max-width: 768px) {
    .modal-content {
        padding: 1.5rem;
        width: 95%;
    }
    
    .preview-features {
        grid-template-columns: 1fr;
    }
}
</style>
`;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add modal styles
    document.head.insertAdjacentHTML('beforeend', modalStyles);
    
    // Initialize curriculum explorer
    window.curriculumExplorer = new CurriculumExplorer();
    
    // Add development helpers to console
    if (window.location.hostname === 'localhost') {
        console.log('🎓 Development mode - Available commands:');
        console.log('curriculumExplorer.simulateProgress() - Add random progress');
        console.log('curriculumExplorer.exportProgress() - Export progress data');
        console.log('curriculumExplorer.resetProgress() - Reset all progress');
    }
});
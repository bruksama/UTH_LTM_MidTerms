/**
 * Scoreboard Component
 * Displays player scores with real-time updates and smooth animations
 */
class Scoreboard {
    constructor() {
        this.scores = {};
        this.previousRanks = {}; // Track previous ranks for smooth transitions
        this.localPlayerId = null;
        this.highlightTimers = new Map();
        this.animationTimers = new Map();
        this.scoreboardEl = null;
    }

    setLocalPlayerId(playerId) {
        this.localPlayerId = playerId;
    }

    /**
     * Update scoreboard with new scores
     * @param {Array} players - Array of player objects with scores
     * @param {string} drawerId - Current drawer id to highlight
     */
    update(players = [], drawerId = null) {
        this.scoreboardEl = document.getElementById('scoreboard');
        if (!this.scoreboardEl) return;

        const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
        
        // Calculate rank changes
        const currentRanks = {};
        sortedPlayers.forEach((player, index) => {
            currentRanks[player.id] = index;
        });

        // Store existing items for smooth transitions
        const existingItems = Array.from(this.scoreboardEl.children);
        const itemMap = new Map();
        existingItems.forEach(item => {
            const playerId = item.dataset.playerId;
            if (playerId) {
                itemMap.set(playerId, item);
            }
        });

        // Clear scoreboard but keep items for animation
        this.scoreboardEl.innerHTML = '';

        // Create or update score items with smooth transitions
        sortedPlayers.forEach((player, index) => {
            const previousRank = this.previousRanks[player.id] !== undefined 
                ? this.previousRanks[player.id] 
                : index;
            const rankChanged = previousRank !== index;
            const previousScore = this.scores[player.id] || 0;
            const currentScore = player.score || 0;
            const scoreDiff = currentScore - previousScore;

            // Get existing item or create new one
            let scoreItem = itemMap.get(player.id);
            const isNewItem = !scoreItem;

            if (!scoreItem) {
                scoreItem = document.createElement('div');
                scoreItem.dataset.playerId = player.id;
                scoreItem.classList.add('score-item', 'score-item-enter');
            } else {
                // Update existing item with transition
                if (rankChanged) {
                    scoreItem.classList.add('score-item-move');
                    scoreItem.style.setProperty('--from-rank', previousRank);
                    scoreItem.style.setProperty('--to-rank', index);
                }
            }

            // Update classes (preserve animation classes)
            if (!isNewItem) {
                scoreItem.className = 'score-item';
                scoreItem.dataset.playerId = player.id;
            }
            if (index === 0) {
                scoreItem.classList.add('leader');
                // Add crown animation for new leader
                if (previousRank !== 0 && previousRank !== undefined) {
                    scoreItem.classList.add('new-leader');
                }
            }

            if (player.id === drawerId) {
                scoreItem.classList.add('drawer');
            }

            if (player.id === this.localPlayerId) {
                scoreItem.classList.add('me');
            }

            // Handle score increase animation
            if (scoreDiff > 0) {
                this._flagScoreIncrease(scoreItem, scoreDiff);
            }

            // Update content
            scoreItem.innerHTML = `
                <span class="score-rank">${index + 1}</span>
                <span class="score-name">${sanitizeHTML(player.name)}</span>
                <span class="score-value-wrapper">
                    <span class="score-value" data-score="${currentScore}">${currentScore}</span>
                </span>
            `;

            // Add score diff badge
            if (scoreDiff > 0) {
                const badge = document.createElement('span');
                badge.className = 'score-diff';
                badge.textContent = `+${scoreDiff}`;
                badge.style.animation = 'scoreBadgePop 0.5s ease-out';
                scoreItem.appendChild(badge);
                
                // Animate score value
                this._animateScoreValue(scoreItem.querySelector('.score-value'), previousScore, currentScore);
            }

            this.scoreboardEl.appendChild(scoreItem);

            // Clean up animation classes after transition
            if (rankChanged || isNewItem) {
                const timer = setTimeout(() => {
                    scoreItem.classList.remove('score-item-move', 'score-item-enter', 'new-leader');
                    scoreItem.style.removeProperty('--from-rank');
                    scoreItem.style.removeProperty('--to-rank');
                }, 500);
                this.animationTimers.set(player.id, timer);
            }
        });

        // Update stored data
        this._storeScores(sortedPlayers);
        this.previousRanks = currentRanks;
    }

    _flagScoreIncrease(element, diff) {
        element.classList.add('score-up');

        const timeout = this.highlightTimers.get(element);
        if (timeout) {
            clearTimeout(timeout);
        }

        const timer = setTimeout(() => {
            element.classList.remove('score-up');
            element.classList.remove('score-up-hold');
            element.classList.remove('score-up-glow');
            this.highlightTimers.delete(element);
        }, 2000);
        this.highlightTimers.set(element, timer);

        if (diff >= 100) {
            element.classList.add('score-up-hold');
            element.classList.add('score-up-glow');
        } else if (diff >= 50) {
            element.classList.add('score-up-glow');
        }
    }

    _animateScoreValue(element, fromValue, toValue) {
        if (!element) return;

        const duration = 600;
        const startTime = performance.now();
        const startValue = fromValue;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(startValue + (toValue - startValue) * easeOut);
            
            element.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = toValue;
            }
        };

        requestAnimationFrame(animate);
    }

    _storeScores(players) {
        this.scores = {};
        players.forEach(player => {
            this.scores[player.id] = player.score || 0;
        });
    }

    /**
     * Get score for a specific player
     * @param {string} playerId - Player ID
     * @returns {number} - Player score
     */
    getScore(playerId) {
        return this.scores[playerId] || 0;
    }

    /**
     * Get rank for a specific player
     * @param {string} playerId - Player ID
     * @returns {number} - Player rank (1-based)
     */
    getRank(playerId) {
        const sortedScores = Object.entries(this.scores)
            .sort((a, b) => b[1] - a[1]);
        const rank = sortedScores.findIndex(([id]) => id === playerId);
        return rank >= 0 ? rank + 1 : null;
    }

    reset() {
        this.scores = {};
        this.previousRanks = {};
        
        // Clear all timers
        this.highlightTimers.forEach(timer => clearTimeout(timer));
        this.animationTimers.forEach(timer => clearTimeout(timer));
        this.highlightTimers.clear();
        this.animationTimers.clear();

        const scoreboardEl = document.getElementById('scoreboard');
        if (scoreboardEl) {
            scoreboardEl.innerHTML = '';
        }
    }
}


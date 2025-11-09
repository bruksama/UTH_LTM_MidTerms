/**
 * Scoreboard Component
 * Displays player scores
 */
class Scoreboard {
    constructor() {
        this.scores = {};
    }

    /**
     * Update scoreboard with new scores
     * @param {Array} players - Array of player objects with scores
     */
    update(players) {
        const scoreboard = document.getElementById('scoreboard');
        if (!scoreboard) return;

        // Sort players by score (descending)
        const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

        scoreboard.innerHTML = '';
        sortedPlayers.forEach((player, index) => {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'score-item';
            if (index === 0) {
                scoreItem.classList.add('highlight');
            }
            scoreItem.innerHTML = `
                <span>${sanitizeHTML(player.name)}</span>
                <span>${player.score || 0}</span>
            `;
            scoreboard.appendChild(scoreItem);
        });

        this.scores = {};
        sortedPlayers.forEach(player => {
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
}


/**
 * Scoreboard Component
 * Displays player scores
 */
class Scoreboard {
  constructor(containerId = "scoreboard") {
    this.container = document.getElementById(containerId);
    this.players = {}; // map id -> player
    this.sortedPlayers = [];
    if (!this.container)
      console.warn(`Scoreboard container '${containerId}' not found`);
  }

  /**
   * Update full player list (replace)
   * @param {Array} players - [{id, name, score, is_drawer}]
   */
  update(players) {
    if (!Array.isArray(players)) return;
    players.forEach((p) => {
      if (p && p.id) {
        this.players[p.id] = {
          id: p.id,
          name: p.name || "Unknown",
          score: Number.isFinite(p.score) ? p.score : 0,
          is_drawer: !!p.is_drawer,
        };
      }
    });
    this._resortAndRender();
  }

  /**
   * Add or update a single player
   * @param {Object} player
   */
  addPlayer(player) {
    if (!player || !player.id) return;
    this.players[player.id] = {
      id: player.id,
      name: player.name || "Unknown",
      score: Number.isFinite(player.score) ? player.score : 0,
      is_drawer: !!player.is_drawer,
    };
    this._resortAndRender();
  }

  /**
   * Remove a player by id
   * @param {string} playerId
   */
  removePlayer(playerId) {
    if (!playerId) return;
    delete this.players[playerId];
    this._resortAndRender();
  }

  /**
   * Update a single player's score
   * @param {string} playerId
   * @param {number} score
   */
  updateScore(playerId, score) {
    if (!playerId) return;
    if (!this.players[playerId]) {
      // create placeholder
      this.players[playerId] = {
        id: playerId,
        name: "Unknown",
        score: 0,
        is_drawer: false,
      };
    }
    this.players[playerId].score = Number.isFinite(score) ? score : 0;
    this._resortAndRender(true, playerId);
  }

  /**
   * Mark which player is the drawer
   * @param {string} playerId
   */
  setDrawer(playerId) {
    Object.values(this.players).forEach(
      (p) => (p.is_drawer = p.id === playerId)
    );
    this._resortAndRender();
  }

  /**
   * Internal: resort players and render
   * @param {boolean} animateScoreChange - whether to animate a specific player's score update
   * @param {string} highlightPlayerId - playerId to animate
   */
  _resortAndRender(animateScoreChange = false, highlightPlayerId = null) {
    this.sortedPlayers = Object.values(this.players).sort(
      (a, b) => (b.score || 0) - (a.score || 0)
    );
    this._render(animateScoreChange, highlightPlayerId);
  }

  /**
   * Render scoreboard DOM
   */
  _render(animateScoreChange = false, highlightPlayerId = null) {
    if (!this.container) return;
    this.container.innerHTML = "";
    if (this.sortedPlayers.length === 0) {
      this.container.innerHTML =
        '<div class="scoreboard-empty">Chưa có người chơi</div>';
      return;
    }

    // header
    const header = document.createElement("div");
    header.className = "scoreboard-header";
    header.innerHTML =
      '<div class="scoreboard-header-rank">Xếp hạng</div><div class="scoreboard-header-name">Tên</div><div class="scoreboard-header-score">Điểm</div>';
    this.container.appendChild(header);

    this.sortedPlayers.forEach((p, idx) => {
      const row = document.createElement("div");
      row.className = "scoreboard-row";
      row.id = `scoreboard-row-${p.id}`;
      if (idx === 0) row.classList.add("scoreboard-row-1st");
      else if (idx === 1) row.classList.add("scoreboard-row-2nd");
      else if (idx === 2) row.classList.add("scoreboard-row-3rd");
      if (p.is_drawer) row.classList.add("scoreboard-row-drawer");

      const rank = document.createElement("div");
      rank.className = "scoreboard-col rank";
      rank.textContent = idx + 1;

      const name = document.createElement("div");
      name.className = "scoreboard-col name";
      name.innerHTML = this._sanitize(p.name);
      if (p.is_drawer)
        name.innerHTML += '<span class="drawer-badge"> 🎨</span>';

      const score = document.createElement("div");
      score.className = "scoreboard-col score";
      score.textContent = p.score || 0;

      row.appendChild(rank);
      row.appendChild(name);
      row.appendChild(score);

      this.container.appendChild(row);

      if (
        animateScoreChange &&
        highlightPlayerId &&
        highlightPlayerId === p.id
      ) {
        row.classList.add("score-update");
        setTimeout(() => row.classList.remove("score-update"), 700);
      }
    });
  }

  /**
   * Simple sanitizer to prevent XSS
   */
  _sanitize(text) {
    const d = document.createElement("div");
    d.textContent = text;
    return d.innerHTML;
  }

  /**
   * Get score by id
   */
  getScore(playerId) {
    return this.players[playerId]?.score || 0;
  }

  /**
   * Clear scoreboard
   */
  clear() {
    this.players = {};
    this.sortedPlayers = [];
    if (this.container)
      this.container.innerHTML =
        '<div class="scoreboard-empty">Chưa có người chơi</div>';
  }
}

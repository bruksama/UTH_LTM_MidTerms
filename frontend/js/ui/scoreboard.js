/**
 * Scoreboard Component
 * Displays player scores
 */
class Scoreboard {
  constructor(containerId = "scoreboard") {
    this.container = document.getElementById(containerId);
    this.players = {}; // map id -> player
    this.sortedPlayers = [];
    this.deltaTimeouts = {};
    if (!this.container) {
      console.warn(`Scoreboard container '${containerId}' not found`);
    }
  }

  /**
   * Update full player list (replace)
   * @param {Array} players - [{id, name, score, is_drawer}]
   * @param {Object} options
   * @param {boolean} options.animate - whether to animate score changes
   */
  update(players, options = {}) {
    if (!Array.isArray(players)) return;
    const { animate = false } = options;
    const highlightIds = [];

    players.forEach((p) => {
      if (!p || !p.id) return;
      const existing = this.players[p.id] || {};
      const previousScore = Number.isFinite(existing.score)
        ? existing.score
        : 0;
      const newScore = Number.isFinite(p.score) ? p.score : previousScore;
      const delta = newScore - previousScore;

      this.players[p.id] = {
        id: p.id,
        name: p.name || existing.name || "Unknown",
        score: newScore,
        is_drawer: !!p.is_drawer,
        lastDelta: animate ? delta : 0,
      };

      if (animate && delta !== 0) {
        highlightIds.push(p.id);
      }
    });

    this._resortAndRender(
      animate && highlightIds.length > 0,
      highlightIds.length ? highlightIds : null
    );

    highlightIds.forEach((playerId) => this._scheduleDeltaClear(playerId));
  }

  /**
   * Add or update a single player
   * @param {Object} player
   */
  addPlayer(player) {
    if (!player || !player.id) return;
    const existing = this.players[player.id] || {};
    this.players[player.id] = {
      id: player.id,
      name: player.name || existing.name || "Unknown",
      score: Number.isFinite(player.score) ? player.score : existing.score || 0,
      is_drawer: !!player.is_drawer,
      lastDelta: 0,
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
    this._clearDeltaTimeout(playerId);
    this._resortAndRender();
  }

  /**
   * Update a single player's score
   * @param {string} playerId
   * @param {number} score
   * @param {number|null} deltaOverride
   */
  updateScore(playerId, score, deltaOverride = null) {
    if (!playerId) return;
    if (!this.players[playerId]) {
      this.players[playerId] = {
        id: playerId,
        name: "Unknown",
        score: 0,
        is_drawer: false,
        lastDelta: 0,
      };
    }

    const previousScore = Number.isFinite(this.players[playerId].score)
      ? this.players[playerId].score
      : 0;
    const newScore = Number.isFinite(score) ? score : previousScore;
    const delta =
      deltaOverride !== null && Number.isFinite(deltaOverride)
        ? deltaOverride
        : newScore - previousScore;

    this.players[playerId].score = newScore;
    this.players[playerId].lastDelta = delta;

    this._resortAndRender(true, [playerId]);
    this._scheduleDeltaClear(playerId);
  }

  /**
   * Apply round results payload [{player_id, player_name, score, points_earned}]
   * @param {Array} scores
   */
  applyRoundResults(scores) {
    if (!Array.isArray(scores) || scores.length === 0) return;
    const highlightIds = [];

    scores.forEach((entry) => {
      if (!entry) return;
      const playerId = entry.player_id || entry.id;
      if (!playerId) return;

      const existing = this.players[playerId] || {
        id: playerId,
        name: entry.player_name || "Unknown",
        score: 0,
        is_drawer: false,
        lastDelta: 0,
      };

      const previousScore = Number.isFinite(existing.score) ? existing.score : 0;
      const newScore = Number.isFinite(entry.score) ? entry.score : previousScore;
      const delta = Number.isFinite(entry.points_earned)
        ? entry.points_earned
        : newScore - previousScore;

      this.players[playerId] = {
        id: playerId,
        name: entry.player_name || existing.name || "Unknown",
        score: newScore,
        is_drawer: !!existing.is_drawer,
        lastDelta: delta,
      };

      if (delta !== 0) {
        highlightIds.push(playerId);
      }
    });

    this._resortAndRender(highlightIds.length > 0, highlightIds.length ? highlightIds : null);
    highlightIds.forEach((playerId) => this._scheduleDeltaClear(playerId));
  }

  /**
   * Mark which player is the drawer
   * @param {string} playerId
   */
  setDrawer(playerId) {
    Object.values(this.players).forEach((p) => {
      p.is_drawer = p.id === playerId;
    });
    this._resortAndRender();
  }

  /**
   * Internal: resort players and render
   * @param {boolean} animateScoreChange - whether to animate score update(s)
   * @param {Array<string>|null} highlightPlayerIds - player ids to animate
   */
  _resortAndRender(animateScoreChange = false, highlightPlayerIds = null) {
    this.sortedPlayers = Object.values(this.players).sort(
      (a, b) => (b.score || 0) - (a.score || 0)
    );
    this._render(animateScoreChange, highlightPlayerIds);
  }

  /**
   * Render scoreboard DOM
   */
  _render(animateScoreChange = false, highlightPlayerIds = null) {
    if (!this.container) return;
    this.container.innerHTML = "";
    if (this.sortedPlayers.length === 0) {
      this.container.innerHTML =
        '<div class="scoreboard-empty">Chưa có người chơi</div>';
      return;
    }

    const highlightSet = Array.isArray(highlightPlayerIds)
      ? new Set(highlightPlayerIds)
      : null;

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
      row.dataset.playerId = p.id;

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
      if (p.is_drawer) {
        name.innerHTML += '<span class="drawer-badge" title="Đang vẽ">🎨</span>';
      }

      const score = document.createElement("div");
      score.className = "scoreboard-col score";
      score.textContent = Number.isFinite(p.score) ? p.score : 0;

      if (Number.isFinite(p.lastDelta) && p.lastDelta !== 0) {
        const deltaSpan = document.createElement("span");
        const sign = p.lastDelta > 0 ? "+" : "";
        deltaSpan.className = `score-delta ${
          p.lastDelta > 0 ? "score-delta-positive" : "score-delta-negative"
        }`;
        deltaSpan.textContent = `${sign}${p.lastDelta}`;
        score.appendChild(deltaSpan);
        row.classList.add(
          p.lastDelta > 0 ? "scoreboard-row-positive" : "scoreboard-row-negative"
        );
      }

      row.appendChild(rank);
      row.appendChild(name);
      row.appendChild(score);
      this.container.appendChild(row);

      if (animateScoreChange && highlightSet?.has(p.id)) {
        row.classList.add("score-update");
        setTimeout(() => row.classList.remove("score-update"), 900);
      }
    });
  }

  /**
   * Simple sanitizer to prevent XSS
   */
  _sanitize(text) {
    const d = document.createElement("div");
    d.textContent = text || "";
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
    Object.values(this.deltaTimeouts).forEach((timeoutId) =>
      clearTimeout(timeoutId)
    );
    this.deltaTimeouts = {};
    this.players = {};
    this.sortedPlayers = [];
    if (this.container) {
      this.container.innerHTML =
        '<div class="scoreboard-empty">Chưa có người chơi</div>';
    }
  }

  _scheduleDeltaClear(playerId, delay = 1600) {
    if (!playerId) return;
    this._clearDeltaTimeout(playerId);
    this.deltaTimeouts[playerId] = setTimeout(() => {
      if (this.players[playerId]) {
        this.players[playerId].lastDelta = 0;
        this._resortAndRender();
      }
      this._clearDeltaTimeout(playerId);
    }, delay);
  }

  _clearDeltaTimeout(playerId) {
    if (!playerId) return;
    if (this.deltaTimeouts[playerId]) {
      clearTimeout(this.deltaTimeouts[playerId]);
      delete this.deltaTimeouts[playerId];
    }
  }
}

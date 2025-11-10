/**
 * Game State UI Management
 * Handles game state updates and UI rendering
 */
class GameUI {
    constructor(socketClient, scoreboard) {
        this.socket = socketClient;
        this.scoreboard = scoreboard;
        this.isDrawer = false;
        this.currentWord = '';
        this.currentDrawerId = null;
        this.roundNumber = 0;
        this.roundDuration = 90;
        this.timerSeconds = 0;
        this.state = 'waiting';
        this.players = new Map();
        this.localPlayerId = null;

        this.elements = {
            wordDisplay: document.getElementById('word-display'),
            secretWord: document.getElementById('secret-word'),
            drawerInfo: document.getElementById('current-drawer'),
            timerDisplay: document.getElementById('timer-display'),
            timerBar: document.getElementById('timer-progress-bar'),
            timerWrapper: document.getElementById('timer-progress'),
            stateOverlay: document.getElementById('game-state-overlay'),
            stateMessage: document.getElementById('game-state-message'),
            playersList: document.getElementById('players-list')
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.socket.on('connected', () => {
            if (this.socket.socket) {
                this.localPlayerId = this.socket.socket.id;
                if (this.scoreboard) {
                    this.scoreboard.setLocalPlayerId(this.localPlayerId);
                }
            }
        });

        this.socket.on('game_started', (data) => {
            this.handleGameStarted(data);
        });

        this.socket.on('round_started', (data) => {
            this.handleRoundStarted(data);
        });

        this.socket.on('round_ended', (data) => {
            this.handleRoundEnded(data);
        });

        this.socket.on('timer_update', (data) => {
            if (typeof data.seconds === 'number') {
                this.updateTimer(data.seconds);
            }
        });

        this.socket.on('player_joined', (data) => {
            this.handlePlayerJoined(data.player);
        });

        this.socket.on('player_left', (data) => {
            this.handlePlayerLeft(data.player_id, data.player_name);
        });

        this.socket.on('game_state_update', (data) => {
            this.handleGameStateUpdate(data);
        });
    }

    syncPlayers(players = []) {
        this.players.clear();
        players.forEach(player => {
            this.players.set(player.id, Object.assign({}, player));
        });
        this.renderPlayersList();
        this.updateScoreboard();
    }

    handleGameStarted(data = {}) {
        this.state = 'playing';
        this.roundNumber = data.round_number || 1;
        if (Array.isArray(data.players)) {
            this.syncPlayers(data.players);
        }

        this.showStateBanner(`Trận đấu bắt đầu! Vòng ${this.roundNumber}`, 'success', 3000);
        if (window.notifications) {
            window.notifications.success('Trò chơi bắt đầu, chúc bạn may mắn!');
        }
    }

    handleRoundStarted(data = {}) {
        this.state = 'playing';
        this.roundNumber = data.round_number || this.roundNumber + 1;
        this.currentDrawerId = data.drawer_id || null;
        this.isDrawer = Boolean(data.is_drawer);
        this.currentWord = data.word || '';
        if (typeof data.round_duration === 'number') {
            this.roundDuration = data.round_duration;
        }

        this.players.forEach(player => {
            player.is_drawer = player.id === this.currentDrawerId;
        });
        this.renderPlayersList();
        this.updateScoreboard();

        this.updateDrawerInfo(data.drawer_name);
        this.updateWordDisplay();
        this.resetTimerDisplay();
        this.showStateBanner(`Vòng ${this.roundNumber} đã bắt đầu`, 'info', 2000);

        // Reset viewer canvas for new round
        if (window.viewerCanvas) {
            window.viewerCanvas.reset();
        }
    }

    handleRoundEnded(data = {}) {
        this.state = 'round_ended';
        this.isDrawer = false;
        this.currentDrawerId = null;

        if (this.elements.wordDisplay) {
            this.elements.wordDisplay.classList.add('hidden');
        }

        if (Array.isArray(data.scores)) {
            data.scores.forEach(scoreEntry => {
                const player = this.players.get(scoreEntry.player_id);
                if (player) {
                    player.score = scoreEntry.score;
                    player.points_earned = scoreEntry.points_earned;
                }
            });
        }
        this.renderPlayersList();
        this.updateScoreboard();

        const revealedWord = data.word || this.currentWord;
        this.showStateBanner(`Vòng kết thúc! Từ khóa: ${revealedWord}`, 'warning', 4000);
        if (window.notifications) {
            window.notifications.info(`Từ khóa là: ${revealedWord}`);
        }
    }

    handlePlayerJoined(player) {
        if (!player || !player.id) return;
        this.players.set(player.id, Object.assign({}, player));
        this.renderPlayersList();
        this.updateScoreboard();

        if (window.notifications) {
            window.notifications.info(`${sanitizeHTML(player.name)} đã tham gia phòng`);
        }
        if (window.chat) {
            window.chat.displaySystemMessage(`${player.name} đã tham gia phòng`);
        }
    }

    handlePlayerLeft(playerId, playerName) {
        if (!playerId) return;
        this.players.delete(playerId);
        this.renderPlayersList();
        this.updateScoreboard();

        if (window.notifications && playerName) {
            window.notifications.info(`${sanitizeHTML(playerName)} đã rời phòng`);
        }
        if (window.chat && playerName) {
            window.chat.displaySystemMessage(`${playerName} đã rời phòng`);
        }
    }

    handleGameStateUpdate(data = {}) {
        const { state, message, data: payload } = data;
        this.state = state || this.state;

        switch (state) {
            case 'waiting':
                this.showStateBanner(message || 'Đang chờ thêm người chơi...', 'info');
                if (this.scoreboard) {
                    this.scoreboard.reset();
                }
                break;
            case 'playing':
                if (payload && Array.isArray(payload.players)) {
                    this.syncPlayers(payload.players);
                }
                this.hideStateBanner();
                break;
            case 'round_ended':
                if (payload && payload.word) {
                    this.showStateBanner(`Vòng kết thúc! Từ khóa: ${payload.word}`, 'warning', 4000);
                }
                break;
            case 'game_ended':
                this.showStateBanner(message || 'Trò chơi kết thúc!', 'success');
                break;
            default:
                if (message) {
                    this.showStateBanner(message, 'info', 2500);
                }
        }
    }

    updateTimer(seconds) {
        this.timerSeconds = seconds;
        const displayEl = this.elements.timerDisplay;
        if (!displayEl) return;

        displayEl.textContent = formatTime(seconds);

        if (seconds <= 10) {
            displayEl.dataset.state = 'critical';
        } else if (seconds <= 30) {
            displayEl.dataset.state = 'warning';
        } else {
            displayEl.dataset.state = 'normal';
        }

        if (this.elements.timerBar && this.roundDuration) {
            const clamped = Math.max(0, Math.min(seconds, this.roundDuration));
            const percent = (clamped / this.roundDuration) * 100;
            this.elements.timerBar.style.width = `${percent}%`;
        }
    }

    resetTimerDisplay() {
        if (this.elements.timerDisplay) {
            this.elements.timerDisplay.dataset.state = 'normal';
            this.elements.timerDisplay.textContent = formatTime(this.roundDuration);
        }
        if (this.elements.timerBar) {
            this.elements.timerBar.style.width = '100%';
        }
    }

    updateDrawerInfo(drawerName) {
        if (!this.elements.drawerInfo) return;

        if (this.isDrawer) {
            this.elements.drawerInfo.textContent = 'Đến lượt bạn vẽ!';
        } else {
            this.elements.drawerInfo.textContent = drawerName
                ? `Đang vẽ: ${drawerName}`
                : 'Chờ người vẽ...';
        }
    }

    updateWordDisplay() {
        if (!this.elements.wordDisplay || !this.elements.secretWord) return;

        if (this.isDrawer) {
            this.elements.wordDisplay.classList.remove('hidden');
            this.elements.secretWord.textContent = this.currentWord || '...';
            if (window.drawerCanvas) {
                window.drawerCanvas.enable();
            }
        } else {
            this.elements.wordDisplay.classList.add('hidden');
            if (window.drawerCanvas) {
                window.drawerCanvas.disable();
            }
        }
    }

    renderPlayersList() {
        const container = this.elements.playersList;
        if (!container) return;

        container.innerHTML = '';
        const playersArray = Array.from(this.players.values()).sort((a, b) => {
            return (b.score || 0) - (a.score || 0);
        });

        playersArray.forEach(player => {
            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';
            if (player.is_drawer) {
                playerItem.classList.add('drawer');
            }
            if (player.id === this.localPlayerId) {
                playerItem.classList.add('me');
            }
            playerItem.innerHTML = `
                <span class="player-name">${sanitizeHTML(player.name)}</span>
                <span class="player-score">${player.score || 0}</span>
            `;
            container.appendChild(playerItem);
        });
    }

    updateScoreboard() {
        if (!this.scoreboard) return;
        this.scoreboard.update(Array.from(this.players.values()), this.currentDrawerId);
    }

    showStateBanner(message, type = 'info', autoHideMs = null) {
        if (!this.elements.stateOverlay || !this.elements.stateMessage) return;

        this.elements.stateOverlay.dataset.type = type;
        this.elements.stateOverlay.classList.remove('hidden');
        this.elements.stateMessage.textContent = message;

        if (this.stateHideTimer) {
            clearTimeout(this.stateHideTimer);
        }

        if (autoHideMs) {
            this.stateHideTimer = setTimeout(() => this.hideStateBanner(), autoHideMs);
        }
    }

    hideStateBanner() {
        if (!this.elements.stateOverlay) return;
        this.elements.stateOverlay.classList.add('hidden');
    }

    updatePlayersList(players) {
        this.syncPlayers(players);
    }
}


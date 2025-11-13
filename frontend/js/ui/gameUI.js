/**
 * Game State UI Management
 * Handles game state updates and UI rendering
 */
class GameUI {
  constructor(socketClient) {
    this.socket = socketClient;
    this.isDrawer = false;
    this.currentWord = "";
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.socket.on("game_started", (data) => {
      this.handleGameStarted(data);
    });

    this.socket.on("round_started", (data) => {
      this.handleRoundStarted(data);
    });

    this.socket.on("round_ended", (data) => {
      this.handleRoundEnded(data);
    });

    this.socket.on("timer_update", (data) => {
      this.updateTimer(data.seconds);
    });

    this.socket.on("player_joined", (data) => {
      // Will be handled by roomUI, but update here if needed
    });

    this.socket.on("player_left", (data) => {
      // Update players list
    });
  }

  handleGameStarted(data) {
    console.log("Game started:", data);
    // Initialize game UI
  }

  handleRoundStarted(data) {
    this.isDrawer = data.is_drawer || false;
    this.currentWord = data.word || "";

    // Show word display if drawer
    const wordDisplay = document.getElementById("word-display");
    const secretWord = document.getElementById("secret-word");
    const drawerInfo = document.getElementById("current-drawer");

    if (this.isDrawer) {
      if (wordDisplay) wordDisplay.classList.remove("hidden");
      if (secretWord) secretWord.textContent = this.currentWord;
      if (drawerInfo) drawerInfo.textContent = "Đến lượt bạn vẽ!";

      // Enable drawing canvas
      if (window.drawerCanvas) {
        window.drawerCanvas.enable();
      }
      // Start round timer if provided
      const seconds = Number.isFinite(data.round_seconds)
        ? data.round_seconds
        : data.seconds || 90;
      if (typeof Timer !== "undefined") {
        if (this._timer) this._timer.stop();
        this._timer = new Timer(
          seconds,
          (s) => this.updateTimer(s),
          () => {
            // end callback
            // rely on server for authoritative round end; just update UI
            this.updateTimer(0);
          }
        );
        this._timer.start();
      }
    } else {
      if (wordDisplay) wordDisplay.classList.add("hidden");
      if (drawerInfo)
        drawerInfo.textContent = `Đang vẽ: ${data.drawer_name || "Người chơi"}`;

      // Disable drawing canvas
      if (window.drawerCanvas) {
        window.drawerCanvas.disable();
      }
      // Start viewer-side timer as well if provided
      const secondsV = Number.isFinite(data.round_seconds)
        ? data.round_seconds
        : data.seconds || 90;
      if (typeof Timer !== "undefined") {
        if (this._timer) this._timer.stop();
        this._timer = new Timer(
          secondsV,
          (s) => this.updateTimer(s),
          () => {
            this.updateTimer(0);
          }
        );
        this._timer.start();
      }
    }
  }

  handleRoundEnded(data) {
    this.isDrawer = false;
    const wordDisplay = document.getElementById("word-display");
    if (wordDisplay) wordDisplay.classList.add("hidden");

    // stop any running timer
    if (this._timer) {
      this._timer.stop();
      this._timer = null;
    }

    // Show revealed word
    if (window.notifications) {
      window.notifications.show(
        `Từ khóa là: ${data.word || this.currentWord}`,
        "info"
      );
    }
  }

  updateTimer(seconds) {
    const timerDisplay = document.getElementById("timer-display");
    if (timerDisplay) {
      timerDisplay.textContent = seconds;

      // Change color when time is running out
      if (seconds <= 10) {
        timerDisplay.style.color = "#f56565";
      } else if (seconds <= 30) {
        timerDisplay.style.color = "#ed8936";
      } else {
        timerDisplay.style.color = "#667eea";
      }
    }
  }

  updatePlayersList(players) {
    const playersList = document.getElementById("players-list");
    if (!playersList) return;

    playersList.innerHTML = "";
    players.forEach((player) => {
      const playerItem = document.createElement("div");
      playerItem.className = "player-item";
      if (player.is_drawer) {
        playerItem.classList.add("drawer");
      }
      playerItem.innerHTML = `
                <span>${sanitizeHTML(player.name)}</span>
                <span>${player.score || 0}</span>
            `;
      playersList.appendChild(playerItem);
    });
  }
}

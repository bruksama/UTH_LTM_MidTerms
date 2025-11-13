/**
 * Game State UI Management
 * Handles game state updates and UI rendering
 */
class GameUI {
  constructor(socketClient) {
    this.socket = socketClient;
    this.isDrawer = false;
    this.currentWord = "";
    this.remainingSeconds = 0;
    this._timerInterval = null;
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

    // Initialize timer from server-provided seconds or fallback to 90
    const initialSeconds = typeof data.seconds === "number" ? data.seconds : 90;
    this.remainingSeconds = initialSeconds;
    this.updateTimer(this.remainingSeconds);

    // Clear any existing interval
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
    }

    // Start local countdown to make UI responsive between server ticks
    this._timerInterval = setInterval(() => {
      this.remainingSeconds = Math.max(0, this.remainingSeconds - 1);
      this.updateTimer(this.remainingSeconds);
      if (this.remainingSeconds <= 0) {
        clearInterval(this._timerInterval);
        this._timerInterval = null;
      }
    }, 1000);

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
    } else {
      if (wordDisplay) wordDisplay.classList.add("hidden");
      if (drawerInfo)
        drawerInfo.textContent = `Đang vẽ: ${data.drawer_name || "Người chơi"}`;

      // Disable drawing canvas
      if (window.drawerCanvas) {
        window.drawerCanvas.disable();
      }
    }
  }

  handleRoundEnded(data) {
    this.isDrawer = false;
    const wordDisplay = document.getElementById("word-display");
    if (wordDisplay) wordDisplay.classList.add("hidden");

    // Stop local countdown when round ends
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
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
    // Keep local remainingSeconds in sync when server sends authoritative value
    if (typeof seconds === "number") {
      this.remainingSeconds = seconds;
    }
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

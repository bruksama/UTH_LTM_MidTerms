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

    // End of game lifecycle
    this.socket.on("game_ended", (data) => {
      this.handleGameEnded(data);
    });

    this.socket.on("timer_update", (data) => {
      this.updateTimer(data.seconds);
    });

    this.socket.on("player_joined", (data) => {
      // Update players list when possible
      if (Array.isArray(data?.players)) {
        this.updatePlayersList(data.players);
      } else if (
        window.scoreboard &&
        Array.isArray(window.scoreboard.sortedPlayers)
      ) {
        this.updatePlayersList(window.scoreboard.sortedPlayers);
      }
    });

    this.socket.on("player_left", (data) => {
      if (Array.isArray(data?.players)) {
        this.updatePlayersList(data.players);
      } else if (
        window.scoreboard &&
        Array.isArray(window.scoreboard.sortedPlayers)
      ) {
        this.updatePlayersList(window.scoreboard.sortedPlayers);
      }
    });
  }

  handleGameStarted(data) {
    console.log("Game started:", data);
    if (window.viewerCanvas) {
      window.viewerCanvas.clearCanvas(true);
    }
    if (window.drawerCanvas) {
      window.drawerCanvas.clearCanvas();
    }
    // Initialize game UI state
    this.isDrawer = false;
    this.currentWord = "";
    const initialSeconds =
      typeof data?.seconds === "number" ? data.seconds : 90;
    this.remainingSeconds = initialSeconds;
    this.updateTimer(this.remainingSeconds);

    // Hide word display and reset drawer info
    const wordDisplay = document.getElementById("word-display");
    const drawerInfo = document.getElementById("current-drawer");
    if (wordDisplay) wordDisplay.classList.add("hidden");
    if (drawerInfo) drawerInfo.textContent = "";

    // Ensure drawing is disabled until role is assigned
    if (window.drawerCanvas) {
      window.drawerCanvas.disable();
    }

    // Render current players list if available
    if (Array.isArray(data?.players)) {
      this.updatePlayersList(data.players);
    }
  }

  handleRoundStarted(data) {
    // 🔥 MỖI ROUND MỚI → RESET CANVAS CHO CẢ DRAWER & VIEWER
    if (window.viewerCanvas) {
      window.viewerCanvas.clearCanvas(true); // chỉ xóa local, không emit gì
    }
    if (window.drawerCanvas) {
      window.drawerCanvas.clearCanvas(); // xóa local + emit clear_canvas cho phòng
    }

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
    this._stopLocalTimer();

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
    const s = typeof seconds === "number" ? seconds : 90;
    this.remainingSeconds = s;
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
    if (!playersList || !Array.isArray(players)) return;

    // 🔥 Đồng bộ luôn scoreboard theo danh sách mới từ server
    if (window.scoreboard) {
      // ở đây không cần animate, chỉ muốn danh sách chuẩn
      window.scoreboard.update(players, { animate: false });
    }

    playersList.innerHTML = "";
    const myId = this.socket?.socket?.id || this.socket?.id || null;
    players.forEach((player) => {
      const playerItem = document.createElement("div");
      playerItem.className = "player-item";
      if (player.is_drawer) {
        playerItem.classList.add("drawer");
      }

      // Tạo innerHTML cơ bản
      playerItem.innerHTML = `
      <span>${sanitizeHTML(player.name)}</span>
      <span>${player.score || 0}</span>
    `;

      // Nếu mình là host và target không phải chính mình → thêm nút Kick
      if (window.isRoomHost && player.id !== window.socketClient?.socket?.id) {
        const btn = document.createElement("button");
        btn.textContent = "Kick";
        btn.className = "btn btn-danger btn-kick";
        btn.style.marginLeft = "8px";
        btn.addEventListener("click", () => {
          if (!window.currentRoomId) return;
          socketClient.emit("kick_player", {
            room_id: window.currentRoomId,
            target_id: player.id,
          });
        });
        playerItem.appendChild(btn);
      }

      playersList.appendChild(playerItem);
    });
  }

  handleGameEnded(data) {
    // Stop timer and reset UI elements
    this._stopLocalTimer();
    this.isDrawer = false;
    const wordDisplay = document.getElementById("word-display");
    const drawerInfo = document.getElementById("current-drawer");
    if (wordDisplay) wordDisplay.classList.add("hidden");
    if (drawerInfo) drawerInfo.textContent = "";

    if (typeof data?.seconds === "number") {
      this.updateTimer(data.seconds);
    }

    // Disable drawing capability at game end
    if (window.drawerCanvas) {
      window.drawerCanvas.disable();
    }

    if (window.notifications) {
      window.notifications.info("Trận đấu đã kết thúc!");
    }
  }

  _stopLocalTimer() {
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
    }
    this.remainingSeconds = 0;
    const timerDisplay = document.getElementById("timer-display");
    if (timerDisplay) {
      timerDisplay.textContent = "--";
      timerDisplay.style.color = "#667eea"; // màu mặc định
    }
  }

  resetState() {
    // dừng countdown local
    this._stopLocalTimer();

    // reset biến trạng thái
    this.isDrawer = false;
    this.currentWord = "";
    this.remainingSeconds = 0;

    // reset UI timer về 0 (hoặc "--" nếu mày muốn custom thêm)
    this.updateTimer(0);

    // Ẩn ô hiển thị từ khoá, reset text "người vẽ hiện tại"
    const wordDisplay = document.getElementById("word-display");
    const drawerInfo = document.getElementById("current-drawer");
    if (wordDisplay) wordDisplay.classList.add("hidden");
    if (drawerInfo) drawerInfo.textContent = "";
  }
}

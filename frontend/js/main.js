/**
 * Main Application Entry Point
 * Initializes all components and manages application flow
 */

// Initialize socket connection
socketClient.connect();

// Initialize UI components
const roomUI = new RoomUI(socketClient);
const gameUI = new GameUI(socketClient);
const scoreboard = new Scoreboard();
const chat = new Chat(socketClient);
const notifications = new Notifications();

window.currentRoomId = null;
window.isRoomHost = false;

// Nếu muốn vẫn nhớ tên player, dùng đoạn này:
const savedName = localStorage.getItem("playerName");
const playerName = savedName || "Player_" + Math.floor(Math.random() * 1000);
if (!savedName) {
  localStorage.setItem("playerName", playerName);
}

// Make components globally accessible
window.roomUI = roomUI;
window.gameUI = gameUI;
window.scoreboard = scoreboard;
window.chat = chat;
window.notifications = notifications;

// Initialize canvas components
const canvas = document.getElementById("game-canvas");
if (canvas) {
  // Initialize drawer canvas (will be enabled/disabled based on role)
  window.drawerCanvas = new DrawerCanvas("game-canvas", socketClient);
  window.drawerCanvas.disable(); // Start disabled until game starts

  // Initialize viewer canvas
  window.viewerCanvas = new ViewerCanvas("game-canvas");

  // Listen for canvas updates
  socketClient.on("canvas_update", (data) => {
    console.log("Canvas update:", data?.type || "batch");
    if (window.viewerCanvas) {
      window.viewerCanvas.handleCanvasUpdate(data);
    }
  });
}

// Socket event handlers
socketClient.on("connected", () => {
  console.log("Connected to game server");
  notifications.info("Đã kết nối với server");
});

socketClient.on("room_created", (data) => {
  console.log("Room created:", data.room_id);

  // Đánh dấu mình là host
  window.isRoomHost = true;
  window.currentRoomId = data.room_id;

  // Lưu lại để reload cũng nhớ
  localStorage.setItem("roomId", data.room_id);

  // Hiện code phòng nếu UI có phần hiển thị
  const roomIdDisplay = document.getElementById("room-id-text");
  const roomIdBlock = document.getElementById("room-id-display");
  if (roomIdDisplay) roomIdDisplay.textContent = data.room_id;
  if (roomIdBlock) roomIdBlock.classList.remove("hidden");

  // Cho phép host start game (nút)
  const startGameBtn = document.getElementById("start-game-btn");
  if (startGameBtn) startGameBtn.classList.remove("hidden");
});

socketClient.on("room_joined", (data) => {
  console.log("Room joined:", data.room_id);

  // Cập nhật room hiện tại
  if (data.room_id) {
    window.currentRoomId = data.room_id;
  }

  // 🔥 nhận flag host từ backend
  if (typeof data.is_host === "boolean") {
    window.isRoomHost = data.is_host;
  }

  // Hiển thị mã phòng ở UI chat / header (nếu có element này)
  const roomIdDisplay = document.getElementById("room-id-text");
  const roomIdBlock = document.getElementById("room-id-display");
  if (roomIdDisplay && data.room_id) {
    roomIdDisplay.textContent = data.room_id;
  }
  if (roomIdBlock) {
    roomIdBlock.classList.remove("hidden");
  }

  // Initialize scoreboard with current players
  if (data.players && Array.isArray(data.players) && window.scoreboard) {
    window.scoreboard.update(data.players);
  }
  if (data?.room_id) {
    socketClient.emit("request_chat_history", { room_id: data.room_id });
    if (window.chat)
      window.chat.displaySystemMessage(`Bạn đã tham gia phòng ${data.room_id}`);
  }

  const startGameBtn = document.getElementById("start-game-btn");
  if (startGameBtn) {
    if (window.isRoomHost) {
      startGameBtn.classList.remove("hidden");
      startGameBtn.disabled = false;
    } else {
      startGameBtn.classList.add("hidden");
      startGameBtn.disabled = true;
    }
  }
});

// Game state events
socketClient.on("round_started", (data) => {
  console.log("Round started - Drawer:", data.drawer_id, data);
  const myId = socketClient.socket?.id;
  const isDrawer = Boolean(data.is_drawer) || (myId && data.drawer_id === myId);

  // Bật / tắt canvas vẽ
  if (window.drawerCanvas) {
    if (isDrawer) {
      console.log("[DrawerCanvas] ENABLE drawing");
      window.drawerCanvas.enable();
    } else {
      console.log("[DrawerCanvas] DISABLE drawing");
      window.drawerCanvas.disable();
    }
  }

  // Update scoreboard
  if (window.scoreboard && data.drawer_id) {
    window.scoreboard.setDrawer(data.drawer_id);
  }

  notifications.info("Vòng mới bắt đầu!");
  if (window.chat) window.chat.displaySystemMessage("Vòng mới bắt đầu!");
});

socketClient.on("round_ended", (data) => {
  console.log("Round ended");

  // Disable drawer canvas
  if (window.drawerCanvas) {
    window.drawerCanvas.disable();
  }

  if (window.scoreboard && data && Array.isArray(data.scores)) {
    window.scoreboard.applyRoundResults(data.scores);
  }
  const startGameBtn = document.getElementById("start-game-btn");
  if (startGameBtn && window.isRoomHost) {
    startGameBtn.disabled = false;
    startGameBtn.classList.remove("btn-disabled"); // nếu có CSS
  }
  // Thông báo + system line (hiển thị từ khoá nếu có)
  const revealed = data?.word ? ` Từ khóa: ${data.word}` : "";
  notifications.info(`Vòng kết thúc.${revealed}`);
  if (window.chat)
    window.chat.displaySystemMessage(`Vòng kết thúc.${revealed}`);
});

socketClient.on("game_ended", (data) => {
  console.log("Game ended");

  // Disable all drawing
  if (window.drawerCanvas) {
    window.drawerCanvas.disable();
  }

  // Reset canvas
  if (window.viewerCanvas) {
    window.viewerCanvas.reset();
  }

  if (window.scoreboard) {
    window.scoreboard.setDrawer(null);
  }

  const startGameBtn = document.getElementById("start-game-btn");
  if (startGameBtn && window.isRoomHost) {
    startGameBtn.disabled = false;
    startGameBtn.classList.remove("btn-disabled");
  }

  // Thông báo + system line
  notifications.info("Trận đấu đã kết thúc!");
  if (window.chat) window.chat.displaySystemMessage("Trận đấu đã kết thúc!");
});

socketClient.on("game_started", (data) => {
  console.log("Game started");
  if (window.scoreboard && data && Array.isArray(data.players)) {
    window.scoreboard.update(data.players);
  }

  // Thông báo + system line
  notifications.info("Trận đấu bắt đầu!");
  if (window.chat) window.chat.displaySystemMessage("Trận đấu bắt đầu!");
});

// Scoreboard related events
socketClient.on("player_joined", (data) => {
  if (data && data.player && window.scoreboard) {
    window.scoreboard.addPlayer(data.player);
  }
  // Toast + system line
  const name = data?.player?.name || "Người chơi";
  notifications.info(`${name} đã tham gia phòng`);
  if (window.chat)
    window.chat.displaySystemMessage(`${name} đã tham gia phòng`);
});

socketClient.on("player_left", (data) => {
  if (data && data.player_id && window.scoreboard) {
    window.scoreboard.removePlayer(data.player_id);
  }
  // Toast + system line
  const name = data?.player_name || "Người chơi";
  notifications.info(`${name} đã rời phòng`);
  if (window.chat) window.chat.displaySystemMessage(`${name} đã rời phòng`);
});

socketClient.on("kicked", (data) => {
  const name = data?.player_name || "Người chơi";

  window.isRoomHost = false;
  if (window.drawerCanvas) window.drawerCanvas.disable();
  if (window.viewerCanvas) window.viewerCanvas.reset();
  if (window.scoreboard) window.scoreboard.setDrawer(null);
  notifications.info(`${name} đã bị kick khỏi phòng`);
  if (window.chat) {
    window.chat.displaySystemMessage(`${name} đã bị kick khỏi phòng`);
  }

  const roomSelection = document.getElementById("room-selection");
  const gameScreen = document.getElementById("game-screen");
  if (roomSelection && gameScreen) {
    gameScreen.classList.remove("active");
    gameScreen.classList.add("hidden");

    roomSelection.classList.add("active");
    roomSelection.classList.remove("hidden");
  }

  // Cập nhật lại scoreboard nếu cần: có thể emit 'request_room_state' hoặc rely vào player_left
});

socketClient.on("scores_updated", (data) => {
  if (data && data.players && window.scoreboard) {
    window.scoreboard.update(data.players, { animate: true });
  }
});

socketClient.on("player_score_updated", (data) => {
  if (
    data &&
    data.player_id &&
    typeof data.score === "number" &&
    window.scoreboard
  ) {
    const delta =
      typeof data.points_earned === "number"
        ? data.points_earned
        : typeof data.delta === "number"
        ? data.delta
        : null;
    window.scoreboard.updateScore(data.player_id, data.score, delta);
  }
});

socketClient.on("drawer_changed", (data) => {
  if (data && data.drawer_id && window.scoreboard) {
    window.scoreboard.setDrawer(data.drawer_id);
  }
});

socketClient.on("canvas_cleared", (data) => {
  console.log("Canvas cleared by drawer");
  if (window.viewerCanvas) {
    window.viewerCanvas.clearCanvas(true);
  }
});

socketClient.on("correct_guess", (data) => {
  // Toast + system line (khớp với chat.js)
  const name = data?.player_name || "Ai đó";
  const word = data?.word || "???";
  notifications.success(`🎉 ${name} đã đoán đúng: ${word}`);
  if (window.chat)
    window.chat.displaySystemMessage(`🎉 ${name} đã đoán đúng: ${word}`);
});

socketClient.on("disconnect", () => {
  console.warn("Disconnected from server");
  notifications.error("Mất kết nối với server");

  // Disable drawing on disconnect
  if (window.drawerCanvas) {
    window.drawerCanvas.disable();
  }
});

socketClient.on("error", (data) => {
  console.error("Socket error:", data);
  const msg = data?.message || "Đã xảy ra lỗi";

  // Nếu phòng không tồn tại (ví dụ server đã restart)
  if (msg === "Room not found") {
    window.currentRoomId = null;
    window.isRoomHost = false;

    // Chuyển UI về màn chọn phòng
    const roomSelection = document.getElementById("room-selection");
    const gameScreen = document.getElementById("game-screen");
    if (roomSelection && gameScreen) {
      roomSelection.classList.add("active");
      roomSelection.classList.remove("hidden");

      gameScreen.classList.remove("active");
      gameScreen.classList.add("hidden");
    }

    // Dọn scoreboard / canvas nếu muốn
    if (window.scoreboard) {
      window.scoreboard.update([]);
    }
    if (
      window.viewerCanvas &&
      typeof window.viewerCanvas.reset === "function"
    ) {
      window.viewerCanvas.reset();
    }
    if (
      window.drawerCanvas &&
      typeof window.drawerCanvas.disable === "function"
    ) {
      window.drawerCanvas.disable();
    }
  }

  notifications.error(msg);
});
function goToLobby() {
  // Xoá state trên localStorage
  localStorage.removeItem("roomId");
  localStorage.removeItem("inGame");
  localStorage.removeItem("isRoomHost");

  // Reset biến global
  window.currentRoomId = null;
  window.isRoomHost = false;

  const roomSelection = document.getElementById("room-selection");
  const gameScreen = document.getElementById("game-screen");

  if (roomSelection && gameScreen) {
    // 🔥 giống UI bên phải: chỉ hiển thị card lobby
    roomSelection.classList.add("active");
    roomSelection.classList.remove("hidden");

    gameScreen.classList.remove("active");
    gameScreen.classList.add("hidden");
  }

  // Dọn scoreboard / canvas cho sạch
  if (window.scoreboard && typeof window.scoreboard.update === "function") {
    window.scoreboard.update([]);
  }
  if (window.viewerCanvas && typeof window.viewerCanvas.reset === "function") {
    window.viewerCanvas.reset();
  }
  if (
    window.drawerCanvas &&
    typeof window.drawerCanvas.disable === "function"
  ) {
    window.drawerCanvas.disable();
  }

  // Clear form input, để client nhìn giống tab host ban đầu
  const roomIdInput = document.getElementById("room-id-input");
  const nameInput = document.getElementById("player-name-input");
  if (roomIdInput) roomIdInput.value = "";
  if (nameInput) nameInput.value = "";
}

// ================== START GAME BUTTON ==================
const startGameBtn = document.getElementById("start-game-btn");
if (startGameBtn) {
  startGameBtn.addEventListener("click", () => {
    if (!window.currentRoomId) {
      notifications.error("Chưa xác định được phòng hiện tại.");
      return;
    }

    if (!window.isRoomHost) {
      notifications.error("Chỉ chủ phòng mới có thể bắt đầu trận.");
      return;
    }

    console.log("Host start_game for room:", window.currentRoomId);
    socketClient.emit("start_game", { room_id: window.currentRoomId });
  });
}
// ================== END START GAME BUTTON ==================

socketClient.on("room_closed", (data) => {
  const reason =
    data?.reason === "host_left"
      ? "Chủ phòng đã rời, phòng đã đóng."
      : "Phòng đã đóng.";
  notifications.info(reason);
  if (window.chat) window.chat.displaySystemMessage(reason);

  goToLobby();
  // Xóa state phòng/game
  localStorage.removeItem("roomId");
  localStorage.removeItem("inGame");
  localStorage.removeItem("isRoomHost");
  window.currentRoomId = null;
  window.isRoomHost = false;

  if (window.drawerCanvas) window.drawerCanvas.disable();
  if (window.viewerCanvas && typeof window.viewerCanvas.reset === "function") {
    window.viewerCanvas.reset();
  }
  if (window.scoreboard && typeof window.scoreboard.update === "function") {
    window.scoreboard.update([]);
  }

  notifications.info(reason);
  if (window.chat) window.chat.displaySystemMessage(reason);

  const roomSelection = document.getElementById("room-selection");
  const gameScreen = document.getElementById("game-screen");
  if (roomSelection && gameScreen) {
    gameScreen.classList.add("active");
    roomSelection.classList.remove("hidden");

    gameScreen.classList.remove("active");
    gameScreen.classList.add("hidden");
  }
});

// Handle page unload
window.addEventListener("beforeunload", () => {
  socketClient.emit("leave_room", {});
  socketClient.disconnect();
});

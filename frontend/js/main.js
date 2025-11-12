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
const roomId = localStorage.getItem("roomId") || "ROOM001";
const playerName =
  localStorage.getItem("playerName") ||
  "Player_" + Math.floor(Math.random() * 1000);
localStorage.setItem("roomId", roomId);
localStorage.setItem("playerName", playerName);

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
  socketClient.emit("join_room", { room_id: roomId, player_name: playerName });
});

socketClient.on("room_joined", (data) => {
  console.log("Room joined:", data.room_id);
  // Initialize scoreboard with current players
  if (data.players && Array.isArray(data.players) && window.scoreboard) {
    window.scoreboard.update(data.players);
  }
  socketClient.emit("request_chat_history", { room_id: data.room_id });
});

// Game state events
socketClient.on("round_started", (data) => {
  console.log("Round started - Drawer:", data.drawer_id);

  // Enable drawer canvas if current player is drawer
  if (window.drawerCanvas && data.is_drawer) {
    window.drawerCanvas.enable();
    console.log("Drawer canvas enabled");
  } else if (window.drawerCanvas) {
    window.drawerCanvas.disable();
  }

  if (window.scoreboard && data && data.drawer_id) {
    window.scoreboard.setDrawer(data.drawer_id);
  }
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
});

socketClient.on("game_started", (data) => {
  console.log("Game started");
  if (window.scoreboard && data && Array.isArray(data.players)) {
    window.scoreboard.update(data.players);
  }
});

// Scoreboard related events
socketClient.on("player_joined", (data) => {
  if (data && data.player && window.scoreboard) {
    window.scoreboard.addPlayer(data.player);
  }
});

socketClient.on("player_left", (data) => {
  if (data && data.player_id && window.scoreboard) {
    window.scoreboard.removePlayer(data.player_id);
  }
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
    window.viewerCanvas.clearCanvas();
  }
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
  notifications.error(data.message || "Đã xảy ra lỗi");
});

// Handle page unload
window.addEventListener("beforeunload", () => {
  socketClient.emit("leave_room", {});
  socketClient.disconnect();
});

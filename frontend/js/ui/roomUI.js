/**
 * Room Management UI
 * Handles room creation and joining
 */
class RoomUI {
  constructor(socketClient) {
    this.socket = socketClient;
    this.currentRoomId = localStorage.getItem("roomId") || null;
    this.currentRoomId = null;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Create room button
    const createBtn = document.getElementById("create-room-btn");
    if (createBtn) {
      createBtn.addEventListener("click", () => this.createRoom());
    }

    // Join room button
    const joinBtn = document.getElementById("join-room-btn");
    if (joinBtn) {
      joinBtn.addEventListener("click", () => this.joinRoom());
    }

    // Enter key on inputs
    const roomIdInput = document.getElementById("room-id-input");
    const playerNameInput = document.getElementById("player-name-input");

    [roomIdInput, playerNameInput].forEach((input) => {
      if (input) {
        input.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            this.joinRoom();
          }
        });
      }
    });

    // Socket event listeners
    this.socket.on("room_created", (data) => {
      this.handleRoomCreated(data);
    });

    this.socket.on("room_joined", (data) => {
      this.handleRoomJoined(data);
    });
  }

  createRoom() {
    const playerName = document
      .getElementById("player-name-input")
      .value.trim();
    if (!playerName) {
      alert("Vui lòng nhập tên của bạn");
      return;
    }

    this.socket.emit("create_room", {
      player_name: playerName,
    });
  }

  joinRoom() {
    const roomId = document
      .getElementById("room-id-input")
      .value.trim()
      .toUpperCase();
    const playerName = document
      .getElementById("player-name-input")
      .value.trim();

    if (!roomId) {
      alert("Vui lòng nhập mã phòng");
      return;
    }

    if (!playerName) {
      alert("Vui lòng nhập tên của bạn");
      return;
    }

    this.socket.emit("join_room", {
      room_id: roomId,
      player_name: playerName,
    });
  }

  handleRoomCreated(data) {
    this.currentRoomId = data.room_id;
    localStorage.setItem("roomId", data.room_id);
    window.currentRoomId = data.room_id;
    const roomIdDisplay = document.getElementById("room-id-display");
    const roomIdText = document.getElementById("room-id-text");

    if (roomIdDisplay && roomIdText) {
      roomIdText.textContent = data.room_id;
      roomIdDisplay.classList.remove("hidden");
    }

    // Auto join the created room
    const playerName = document
      .getElementById("player-name-input")
      .value.trim();
    this.socket.emit("join_room", {
      room_id: data.room_id,
      player_name: playerName,
    });
  }

  handleRoomJoined(data) {
    this.currentRoomId = data.room_id;

    if (data.room_id) {
      window.currentRoomId = data.room_id;
    }

    const roomSelection = document.getElementById("room-selection");
    const gameScreen = document.getElementById("game-screen");

    if (roomSelection && gameScreen) {
      roomSelection.classList.remove("active");
      roomSelection.classList.add("hidden");

      gameScreen.classList.add("active");
      gameScreen.classList.remove("hidden");
    }

    if (window.gameUI && Array.isArray(data.players)) {
      window.gameUI.updatePlayersList(data.players);
    }
  }
}

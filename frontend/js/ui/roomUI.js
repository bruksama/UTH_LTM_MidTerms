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

<<<<<<<<< Temporary merge branch 1
  handleRoomCreated(data) {
    // Lưu room hiện tại & đánh dấu host
    this.currentRoomId = data.room_id;
    window.currentRoomId = data.room_id;
    window.isRoomHost = true;

    // Cập nhật URL: localhost:8000/#ABC123
    window.location.hash = data.room_id;

    // Hiện mã phòng ở màn tạo phòng (block phía trên)
    const roomIdDisplay = document.getElementById("room-id-display");
    const roomIdText = document.getElementById("room-id-text");
=========
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

>>>>>>>>> Temporary merge branch 2
    if (roomIdDisplay && roomIdText) {
      roomIdText.textContent = data.room_id;
      roomIdDisplay.classList.remove("hidden");
    }

<<<<<<<<< Temporary merge branch 1
    // Hiển thị mã phòng cố định bên trái (panel game)
    const fixedRoomId = document.getElementById("fixed-room-id");
    if (fixedRoomId) {
      fixedRoomId.textContent = data.room_id;
    }

    // Auto join phòng vừa tạo
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
      // set global
      window.currentRoomId = data.room_id;

      // Nếu mình KHÔNG phải host (chỉ join vào) thì cũng gắn URL hash
      if (!window.isRoomHost) {
        window.location.hash = data.room_id;
      }
    }

    // Cập nhật ô mã phòng cố định bên trái
    const fixedRoomId = document.getElementById("fixed-room-id");
    if (fixedRoomId && data.room_id) {
      fixedRoomId.textContent = data.room_id;
    }

    // Ẩn màn chọn phòng, hiện màn game
    const roomSelection = document.getElementById("room-selection");
    const gameScreen = document.getElementById("game-screen");
    if (roomSelection && gameScreen) {
      roomSelection.classList.remove("active");
      gameScreen.classList.add("active");
    }

    // Cập nhật danh sách player
    if (window.gameUI && Array.isArray(data.players)) {
      window.gameUI.updatePlayersList(data.players);
    }
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
=========
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
>>>>>>>>> Temporary merge branch 2
  }
}

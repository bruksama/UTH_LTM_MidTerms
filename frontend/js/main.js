/**
 * Main Application Entry Point
 * Initializes all components and manages application flow
 */

// Initialize socket connection
socketClient.connect();

// Initialize UI components
const roomUI = new RoomUI(socketClient);
const scoreboard = new Scoreboard();
const gameUI = new GameUI(socketClient, scoreboard);
const chat = new Chat(socketClient);
const notifications = new Notifications();
const roomId = localStorage.getItem('roomId') || 'ROOM001';
const playerName = localStorage.getItem('playerName') || ('Player_' + Math.floor(Math.random() * 1000));
localStorage.setItem('roomId', roomId);
localStorage.setItem('playerName', playerName);

// Make components globally accessible
window.roomUI = roomUI;
window.gameUI = gameUI;
window.scoreboard = scoreboard;
window.chat = chat;
window.notifications = notifications;

// Initialize canvas components
const canvas = document.getElementById('game-canvas');
if (canvas) {
    // Initialize drawer canvas (will be enabled/disabled based on role)
    window.drawerCanvas = new DrawerCanvas('game-canvas', socketClient);
    window.drawerCanvas.disable(); // Start disabled until game starts
    
    // Initialize viewer canvas
    window.viewerCanvas = new ViewerCanvas('game-canvas');
    
    // Listen for canvas updates
    socketClient.on('canvas_update', (data) => {
        if (window.viewerCanvas) {
            window.viewerCanvas.handleCanvasUpdate(data);
        }
    });
}

// Socket event handlers
socketClient.on('connected', () => {
    console.log('Connected to game server');
    notifications.info('Đã kết nối với server');
    socketClient.emit('join_room', { room_id: roomId, player_name: playerName });
});
socketClient.on('room_joined', (data) => {
    socketClient.emit('request_chat_history', { room_id: data.room_id });
});

socketClient.on('disconnect', () => {
    notifications.error('Mất kết nối với server');
});

socketClient.on('error', (data) => {
    notifications.error(data.message || 'Đã xảy ra lỗi');
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    socketClient.emit('leave_room', {});
    socketClient.disconnect();
});


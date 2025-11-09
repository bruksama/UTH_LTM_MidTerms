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


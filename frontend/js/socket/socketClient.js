/**
 * Socket.IO Client Wrapper
 * Manages connection to the Flask-SocketIO server
 */
class SocketClient {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.eventHandlers = {};
    }

    /**
     * Connect to the server
     * @param {string} serverUrl - Server URL (default: current host)
     */
    connect(serverUrl = null) {
        if (!serverUrl) {
            const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
            const host = window.location.hostname;
            const port = window.location.port || (protocol === 'https:' ? '443' : '80');
            serverUrl = `${protocol}//${host}:5000`;
        }

        this.socket = io(serverUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        this.setupEventListeners();
    }

    /**
     * Setup default event listeners
     */
    setupEventListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.connected = true;
            this.emit('connected');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.connected = false;
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        // Register custom event handlers
        Object.keys(this.eventHandlers).forEach(event => {
            this.socket.on(event, this.eventHandlers[event]);
        });
    }

    /**
     * Register an event handler
     * @param {string} event - Event name
     * @param {Function} handler - Event handler function
     */
    on(event, handler) {
        this.eventHandlers[event] = handler;
        if (this.socket) {
            this.socket.on(event, handler);
        }
    }

    /**
     * Remove an event handler
     * @param {string} event - Event name
     */
    off(event) {
        delete this.eventHandlers[event];
        if (this.socket) {
            this.socket.off(event);
        }
    }

    /**
     * Emit an event to the server
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    emit(event, data = {}) {
        if (this.socket && this.connected) {
            this.socket.emit(event, data);
        } else {
            console.warn('Socket not connected. Cannot emit:', event);
        }
    }

    /**
     * Disconnect from the server
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.connected = false;
        }
    }

    /**
     * Get connection status
     * @returns {boolean}
     */
    isConnected() {
        return this.connected && this.socket && this.socket.connected;
    }
}

// Create global instance
const socketClient = new SocketClient();


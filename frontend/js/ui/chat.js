/**
 * Chat Component
 * Handles chat messages and guessing
 */
class Chat {
    constructor(socketClient) {
        this.socket = socketClient;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Send message button
        const sendBtn = document.getElementById('send-message-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        // Enter key on chat input
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        // Socket event listeners
        this.socket.on('chat_message', (data) => {
            this.displayMessage(data);
        });

        this.socket.on('correct_guess', (data) => {
            this.displayCorrectGuess(data);
        });
    }

    sendMessage() {
        const chatInput = document.getElementById('chat-input');
        if (!chatInput) return;

        const message = chatInput.value.trim();
        if (!message) return;

        // Emit message to server
        this.socket.emit('send_message', {
            message: message
        });

        // Clear input
        chatInput.value = '';
    }

    displayMessage(data) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        
        if (data.is_guess) {
            messageDiv.classList.add('guess');
        }

        messageDiv.innerHTML = `
            <span class="player-name">${sanitizeHTML(data.player_name)}:</span>
            <span>${sanitizeHTML(data.message)}</span>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    displayCorrectGuess(data) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message correct';
        messageDiv.innerHTML = `
            <strong>🎉 ${sanitizeHTML(data.player_name)} đã đoán đúng!</strong>
            <br>Từ khóa là: <strong>${sanitizeHTML(data.word)}</strong>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    displaySystemMessage(message) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message system';
        messageDiv.textContent = message;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}


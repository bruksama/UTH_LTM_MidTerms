/**
 * Chat Component
 * Handles chat messages and guessing
 */
class Chat {
    constructor(socketClient) {
        this.socket = socketClient;
        this.playerName = localStorage.getItem('playerName') || 'Guest';
        this.roomId = localStorage.getItem('roomId') || 'ROOM001';
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Send message button
        const sendBtn = document.getElementById('send-message-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        // Enter key on chat input (keydown + preventDefault để tránh double-submit)
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
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

        // Nhận lịch sử chat
        this.socket.on('chat_history', (messages) => {
            const chatMessages = document.getElementById('chat-messages');
            if (!chatMessages || !Array.isArray(messages)) return;
            chatMessages.innerHTML = ''; // Clear existing messages
            messages.forEach((m) => this.displayMessage(m));
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }

    sendMessage() {
        const chatInput = document.getElementById('chat-input');
        if (!chatInput) return;

        const message = chatInput.value.trim();
        if (!message) return;

        // Emit message to server
        this.socket.emit('send_message', {
            room_id: this.roomId,
            player_name: this.playerName,
            message: message
        });

        // Clear input
        chatInput.value = '';
    }

    _timeNow() {
        const d = new Date();
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
    }

    displayMessage(data) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const name = data?.player_name ?? '???';
        const text = data?.message ?? '';
        const isGuess = !!data?.is_guess;
        const time = this._timeNow();

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        if (isGuess) messageDiv.classList.add('guess');

        messageDiv.innerHTML = `
            <span class="time">[${time}]</span>
            <span class="player-name">${sanitizeHTML(name)}:</span>
            <span>${sanitizeHTML(text)}</span>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    displayCorrectGuess(data) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const name = data?.player_name ?? 'Ai đó';
        const word = data?.word ?? '';
        const time = this._timeNow();

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message correct';
        messageDiv.innerHTML = `
            <span class="time">[${time}]</span>
            <strong>🎉 ${sanitizeHTML(name)} đã đoán đúng!</strong>
            <br>Từ khóa là: <strong>${sanitizeHTML(word)}</strong>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    displaySystemMessage(message) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const time = this._timeNow();

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message system';
        messageDiv.innerHTML = `<span class="time">[${time}]</span> ${sanitizeHTML(message || '')}`;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

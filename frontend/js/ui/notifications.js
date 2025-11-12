/**
 * Notification System
 * Displays temporary notifications to the user
 */
class Notifications {
    constructor() {
        this.container = document.getElementById('notifications');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notifications';
            this.container.className = 'notifications';
            document.body.appendChild(this.container);
        }
    }

    /**
     * Show a notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info)
     * @param {number} duration - Duration in milliseconds (default: 3000)
     */
    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        // Add icon + close
        const icon = this._getIcon(type);
        notification.innerHTML = `
            <span class="icon">${icon}</span>
            <span class="text">${message}</span>
            <button class="close-btn" aria-label="Close">&times;</button>
        `;

        this.container.appendChild(notification);

        // Pause on hover
        let timer = setTimeout(remove, duration);
        notification.addEventListener('mouseenter', () => clearTimeout(timer));
        notification.addEventListener('mouseleave', () => {
            timer = setTimeout(remove, Math.max(500, duration / 2));
        });

        // Manual close (guard)
        const btn = notification.querySelector('.close-btn');
        if (btn) btn.addEventListener('click', remove);

        function remove() {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 250);
        }
    }

    _getIcon(type) {
        switch (type) {
            case 'success': return '✔️';
            case 'error':   return '❌';
            case 'info':
            default:        return '💬';
        }
    }

    success(message, duration) { this.show(message, 'success', duration); }
    error(message, duration)   { this.show(message, 'error', duration); }
    info(message, duration)    { this.show(message, 'info', duration); }
}

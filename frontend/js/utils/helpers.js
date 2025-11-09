/**
 * Utility Helper Functions
 */

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Format time in seconds to MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generate a random color
 * @returns {string} - Hex color code
 */
function randomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Check if string is empty or whitespace only
 * @param {string} str - String to check
 * @returns {boolean}
 */
function isEmpty(str) {
    return !str || str.trim().length === 0;
}

/**
 * Get element by ID
 * @param {string} id - Element ID
 * @returns {HTMLElement}
 */
function $(id) {
    return document.getElementById(id);
}

/**
 * Create element with attributes
 * @param {string} tag - HTML tag name
 * @param {Object} attrs - Attributes object
 * @param {string} text - Text content
 * @returns {HTMLElement}
 */
function createElement(tag, attrs = {}, text = '') {
    const el = document.createElement(tag);
    Object.keys(attrs).forEach(key => {
        if (key === 'className') {
            el.className = attrs[key];
        } else {
            el.setAttribute(key, attrs[key]);
        }
    });
    if (text) {
        el.textContent = text;
    }
    return el;
}


/**
 * Canvas Drawing Logic for Drawer
 * Handles drawing events and emits them to server
 */
class DrawerCanvas {
    constructor(canvasId, socketClient) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.socket = socketClient;
        this.isDrawing = false;
        this.currentColor = '#000000';
        this.currentBrushSize = 5;
        this.lastX = 0;
        this.lastY = 0;

        this.setupEventListeners();
        this.setupDrawingTools();
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });
    }

    setupDrawingTools() {
        // Color picker
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.setColor(e.target.dataset.color);
            });
        });

        // Brush size slider
        const brushSlider = document.getElementById('brush-size-slider');
        const brushDisplay = document.getElementById('brush-size-display');
        if (brushSlider) {
            brushSlider.addEventListener('input', (e) => {
                const size = parseInt(e.target.value);
                this.setBrushSize(size);
                if (brushDisplay) {
                    brushDisplay.textContent = size;
                }
            });
        }

        // Clear canvas button
        const clearBtn = document.getElementById('clear-canvas-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearCanvas());
        }
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        this.lastX = pos.x;
        this.lastY = pos.y;

        // Emit drawing start event
        this.socket.emit('drawing_start', {
            x: pos.x,
            y: pos.y
        });
    }

    draw(e) {
        if (!this.isDrawing) return;

        const pos = this.getMousePos(e);

        // Draw on local canvas
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentBrushSize;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();

        // Emit drawing move event
        this.socket.emit('drawing_move', {
            x: pos.x,
            y: pos.y
        });

        this.lastX = pos.x;
        this.lastY = pos.y;
    }

    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            // Emit drawing end event
            this.socket.emit('drawing_end', {});
        }
    }

    setColor(color) {
        this.currentColor = color;
        this.socket.emit('change_color', { color });
    }

    setBrushSize(size) {
        this.currentBrushSize = size;
        this.socket.emit('change_brush_size', { size });
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.socket.emit('clear_canvas', {});
    }

    enable() {
        this.canvas.style.cursor = 'crosshair';
        document.getElementById('drawing-tools').classList.remove('hidden');
    }

    disable() {
        this.canvas.style.cursor = 'default';
        document.getElementById('drawing-tools').classList.add('hidden');
    }
}


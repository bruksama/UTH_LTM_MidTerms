/**
 * Canvas Viewing Logic for Viewers/Guessers
 * Receives drawing updates from server and renders them
 */
class ViewerCanvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.currentColor = '#000000';
        this.currentBrushSize = 5;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
    }

    /**
     * Handle canvas update from server
     * @param {Object} data - Drawing data from server
     */
    handleCanvasUpdate(data) {
        switch (data.type) {
            case 'start':
                this.startDrawing(data.x, data.y);
                break;
            case 'move':
                this.draw(data.x, data.y);
                break;
            case 'end':
                this.stopDrawing();
                break;
            case 'color':
                this.setColor(data.color);
                break;
            case 'brush_size':
                this.setBrushSize(data.size);
                break;
            case 'clear':
                this.clearCanvas();
                break;
        }
    }

    startDrawing(x, y) {
        this.isDrawing = true;
        this.lastX = x;
        this.lastY = y;
    }

    draw(x, y) {
        if (!this.isDrawing) return;

        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentBrushSize;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();

        this.lastX = x;
        this.lastY = y;
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    setColor(color) {
        this.currentColor = color;
    }

    setBrushSize(size) {
        this.currentBrushSize = size;
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}


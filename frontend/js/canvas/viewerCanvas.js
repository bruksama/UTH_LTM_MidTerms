/**
 * Canvas Viewing Logic for Viewers/Guessers
 * Receives drawing updates from server and renders them
 */
class ViewerCanvas {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`ViewerCanvas: Canvas element with id "${canvasId}" not found`);
        }

        this.ctx = this.canvas.getContext('2d');
        this.currentColor = '#000000';
        this.currentBrushSize = 5;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.options = Object.assign({
            pointerEvents: false,
            enableSnapshots: true
        }, options);

        if (!this.options.pointerEvents) {
            this.canvas.style.pointerEvents = 'none';
        }

        this._initContext();
        this._setupResizeObserver();
    }

    _initContext() {
        if (!this.ctx) return;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.miterLimit = 1;
    }

    _setupResizeObserver() {
        if (typeof ResizeObserver === 'undefined') return;

        const parent = this.canvas.parentElement;
        if (!parent) return;

        this.resizeObserver = new ResizeObserver(() => {
            this._matchCanvasToElement();
        });
        this.resizeObserver.observe(parent);
        this._matchCanvasToElement();
    }

    _matchCanvasToElement() {
        const parent = this.canvas.parentElement;
        if (!parent) return;

        const { width, height } = parent.getBoundingClientRect();
        if (!width || !height) return;

        // Preserve existing drawing by copying to an offscreen canvas
        const offscreen = document.createElement('canvas');
        offscreen.width = this.canvas.width;
        offscreen.height = this.canvas.height;
        const offscreenCtx = offscreen.getContext('2d');
        offscreenCtx.drawImage(this.canvas, 0, 0);

        // Resize actual canvas
        this.canvas.width = width;
        this.canvas.height = height;
        this._initContext();

        // Redraw previous content scaled to new size
        this.ctx.drawImage(offscreen, 0, 0, width, height);
    }

    /**
     * Handle canvas update from server
     * @param {Object} data - Drawing data from server
     */
    handleCanvasUpdate(data = {}) {
        if (!data || !data.type) {
            console.warn('ViewerCanvas: Invalid canvas update data', data);
            return;
        }

        try {
            switch (data.type) {
                case 'start':
                    if (typeof data.x === 'number' && typeof data.y === 'number') {
                        this.startDrawing(data.x, data.y);
                    }
                    break;
                case 'move':
                    if (typeof data.x === 'number' && typeof data.y === 'number') {
                        this.draw(data.x, data.y);
                    }
                    break;
                case 'end':
                    this.stopDrawing();
                    break;
                case 'color':
                    if (data.color) {
                        this.setColor(data.color);
                    }
                    break;
                case 'brush_size':
                    if (typeof data.size === 'number' && data.size > 0) {
                        this.setBrushSize(data.size);
                    }
                    break;
                case 'clear':
                    this.clearCanvas();
                    break;
                case 'batch':
                    this.drawBatch(data.points || []);
                    break;
                case 'snapshot':
                    if (this.options.enableSnapshots) {
                        this.applySnapshot(data);
                    }
                    break;
                default:
                    console.warn('ViewerCanvas: Unhandled canvas update type', data.type);
            }
        } catch (error) {
            console.error('ViewerCanvas: Error handling canvas update', error, data);
        }
    }

    drawBatch(points) {
        if (!Array.isArray(points) || points.length === 0) return;

        let previous = null;
        points.forEach(point => {
            if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') return;

            if (!previous || point.type === 'start') {
                this.startDrawing(point.x, point.y);
            } else if (point.type === 'end') {
                this.draw(point.x, point.y);
                this.stopDrawing();
            } else {
                this.draw(point.x, point.y);
            }

            if (point.color) {
                this.setColor(point.color);
            }
            if (point.size) {
                this.setBrushSize(point.size);
            }

            previous = point;
        });

        if (this.isDrawing) {
            this.stopDrawing();
        }
    }

    applySnapshot(data) {
        const { image, width, height } = data;
        if (!image) return;

        const applyImage = (img) => {
            this.clearCanvas();
            if (width && height) {
                this.canvas.width = width;
                this.canvas.height = height;
                this._initContext();
            }
            this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
        };

        if (image instanceof HTMLImageElement) {
            applyImage(image);
            return;
        }

        const img = new Image();
        img.onload = () => applyImage(img);
        img.onerror = () => console.error('ViewerCanvas: Failed to load snapshot image');
        img.src = image.startsWith('data:') ? image : `data:image/png;base64,${image}`;
    }

    startDrawing(x, y) {
        if (typeof x !== 'number' || typeof y !== 'number') return;
        this.isDrawing = true;
        this.lastX = x;
        this.lastY = y;
    }

    draw(x, y) {
        if (!this.isDrawing) return;
        if (typeof x !== 'number' || typeof y !== 'number') return;

        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentBrushSize;
        this.ctx.stroke();

        this.lastX = x;
        this.lastY = y;
    }

    stopDrawing() {
        this.isDrawing = false;
        this.ctx.closePath();
    }

    setColor(color) {
        if (!color) return;
        this.currentColor = color;
    }

    setBrushSize(size) {
        if (!size) return;
        this.currentBrushSize = size;
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Reset drawing state when clearing
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
    }

    /**
     * Reset canvas for a new round
     * Clears the canvas and resets all drawing state
     */
    reset() {
        this.clearCanvas();
        this.currentColor = '#000000';
        this.currentBrushSize = 5;
    }

    /**
     * Get canvas dimensions
     * @returns {Object} - {width, height}
     */
    getDimensions() {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }

    destroy() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        this.canvas = null;
        this.ctx = null;
    }
}


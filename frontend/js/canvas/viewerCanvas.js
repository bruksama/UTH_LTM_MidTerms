/**
 * Canvas Viewing Logic for Viewers/Guessers
 * Receives drawing updates from server and renders them in real-time.
 * Features:
 *  - Smooth stroke rendering
 *  - Color & brush size synchronisation
 *  - Canvas clear & snapshot support
 *  - Basic performance metrics for debugging
 */
class ViewerCanvas {
  /**
   * Initialize ViewerCanvas
   * @param {string} canvasId - Canvas element ID
   */
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error(`Canvas with ID '${canvasId}' not found`);
      return;
    }

    this.ctx = this.canvas.getContext("2d");
    if (!this.ctx) {
      console.error("Failed to get canvas 2D context");
      return;
    }

    // Drawing state
    this.currentColor = "#000000";
    this.currentBrushSize = 5;
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;

    // Canvas & remote sync metadata
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.remoteCanvasSize = { width: this.width, height: this.height };
    this.scaleX = 1;
    this.scaleY = 1;

    // Event queue for smooth rendering
    this.eventQueue = [];
    this.frameRequest = null;
    this._frameRequestType = null;
    this.isInitialized = true;

    // Performance tracking
    this.updateCount = 0;
    this.firstEventTimestamp = null;
    this.lastEventTimestamp = null;

    // Prepare canvas base state
    this._initializeCanvasSurface();
    this.clearCanvas(true);

    console.log("ViewerCanvas initialized successfully");
  }

  /**
   * Normalize incoming data (single event, array or batch payload)
   * and schedule rendering.
   * @param {Object|Array} data
   */
  handleCanvasUpdate(data) {
    if (!this.isInitialized) return;

    const events = this._normalizeEvents(data);
    if (!events.length) {
      console.warn("No canvas events to process:", data);
      return;
    }

    this.eventQueue.push(...events);
    this._scheduleQueueFlush();
  }

  /**
   * Start a new stroke on the canvas
   * Called when drawer starts drawing
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {void}
   */
  startDrawing(x, y) {
    if (!this.ctx || !this.canvas) return;

    const { x: drawX, y: drawY } = this._normalizeCoords(x, y);
    if (!Number.isFinite(drawX) || !Number.isFinite(drawY)) {
      console.warn("Invalid coordinates for startDrawing:", x, y);
      return;
    }

    this.isDrawing = true;
    this.lastX = drawX;
    this.lastY = drawY;

    try {
      this.ctx.beginPath();
      this.ctx.moveTo(drawX, drawY);
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineWidth = this.currentBrushSize;
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      this.ctx.globalCompositeOperation = "source-over";
    } catch (error) {
      console.error("Error starting drawing:", error);
      this.isDrawing = false;
    }
  }

  /**
   * Draw a line from last position to new position
   * Uses smooth rendering with proper line styling
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {void}
   */
  draw(x, y) {
    if (!this.isDrawing || !this.ctx) return;

    const { x: drawX, y: drawY } = this._normalizeCoords(x, y);
    if (!Number.isFinite(drawX) || !Number.isFinite(drawY)) {
      console.warn("Invalid coordinates for draw:", x, y);
      return;
    }

    try {
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(drawX, drawY);
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineWidth = this.currentBrushSize;
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      this.ctx.globalCompositeOperation = "source-over";
      this.ctx.stroke();
      this.ctx.closePath();

      this.lastX = drawX;
      this.lastY = drawY;
    } catch (error) {
      console.error("Error drawing line:", error);
    }
  }

  /**
   * Stop the current stroke
   * Called when drawer stops drawing
   * @returns {void}
   */
  stopDrawing() {
    if (!this.ctx) return;

    this.isDrawing = false;

    try {
      this.ctx.closePath();
    } catch (error) {
      console.error("Error closing path:", error);
    }
  }

  /**
   * Set current drawing color
   * Validates color format before applying
   * @param {string} color - Hex color code (e.g., "#FF0000")
   * @returns {void}
   */
  setColor(color) {
    if (!color || typeof color !== "string") {
      console.warn("Invalid color:", color);
      return;
    }

    // Validate hex color format (case-insensitive)
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      console.warn("Invalid hex color format:", color);
      return;
    }

    this.currentColor = color;
  }

  /**
   * Set current brush size
   * Clamps size between 3 and 20 pixels for consistency
   * @param {number} size - Brush size in pixels
   * @returns {void}
   */
  setBrushSize(size) {
    if (typeof size !== "number") {
      console.warn("Invalid brush size:", size);
      return;
    }

    this.currentBrushSize = Math.min(Math.max(size, 3), 20);
  }

  /**
   * Clear entire canvas
   * Resets to white background for next drawing
   * @param {boolean} skipMetric - internal flag to avoid metric side-effects
   * @returns {void}
   */
  clearCanvas(skipMetric = false) {
    if (!this.ctx || !this.canvas) return;

    try {
      this.ctx.save();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = "#FFFFFF";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();

      this.isDrawing = false;
      this.lastX = 0;
      this.lastY = 0;

      if (!skipMetric) {
        this._recordEventMetric();
      }
    } catch (error) {
      console.error("Error clearing canvas:", error);
    }
  }

  /**
   * Apply snapshot image (base64 or dataURL) to canvas.
   * @param {string} imageData
   */
  applySnapshot(imageData) {
    if (!imageData || typeof imageData !== "string") {
      console.warn("Invalid snapshot data", imageData);
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        this.clearCanvas(true);
        this.ctx.drawImage(img, 0, 0, this.width, this.height);
        this._recordEventMetric();
      } catch (error) {
        console.error("Error applying snapshot:", error);
      }
    };
    img.onerror = (err) => {
      console.error("Failed to load canvas snapshot", err);
    };

    if (imageData.startsWith("data:")) {
      img.src = imageData;
    } else {
      img.src = `data:image/png;base64,${imageData}`;
    }
  }

  /**
   * Get current canvas state (for debugging/testing)
   * @returns {Object} Current state of canvas
   */
  getState() {
    return {
      isDrawing: this.isDrawing,
      currentColor: this.currentColor,
      currentBrushSize: this.currentBrushSize,
      lastPosition: { x: this.lastX, y: this.lastY },
      canvasSize: {
        width: this.canvas?.width || 0,
        height: this.canvas?.height || 0,
      },
      updateCount: this.updateCount,
      lastEventTimestamp: this.lastEventTimestamp,
    };
  }

  /**
   * Reset canvas to initial state
   * @returns {void}
   */
  reset() {
    this.clearCanvas(true);
    this.currentColor = "#000000";
    this.currentBrushSize = 5;
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.updateCount = 0;
    this.firstEventTimestamp = null;
    this.lastEventTimestamp = null;
    this.eventQueue = [];
  }

  /**
   * Clean up any resources (call on teardown)
   */
  destroy() {
    if (this.frameRequest) {
      if (
        this._frameRequestType === "raf" &&
        typeof cancelAnimationFrame === "function"
      ) {
        cancelAnimationFrame(this.frameRequest);
      } else if (this._frameRequestType === "timeout") {
        clearTimeout(this.frameRequest);
      }
      this.frameRequest = null;
    }
    this.eventQueue = [];
    this.isInitialized = false;
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance data
   */
  getMetrics() {
    const now = Date.now();
    const timeSinceLastUpdate = this.lastEventTimestamp
      ? now - this.lastEventTimestamp
      : null;
    const totalDuration =
      this.firstEventTimestamp && this.lastEventTimestamp
        ? this.lastEventTimestamp - this.firstEventTimestamp || 1
        : null;

    const updatesPerSecond =
      totalDuration && totalDuration > 0
        ? (this.updateCount * 1000) / totalDuration
        : 0;

    return {
      updateCount: this.updateCount,
      timeSinceLastUpdate,
      updatesPerSecond,
    };
  }

  /**
   * Internal helpers
   */

  _initializeCanvasSurface() {
    // Ensure canvas has explicit background to avoid transparency flicker
    if (!this.canvas.style.backgroundColor) {
      this.canvas.style.backgroundColor = "#FFFFFF";
    }

    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.remoteCanvasSize = { width: this.width, height: this.height };
    this.scaleX = 1;
    this.scaleY = 1;
  }

  _normalizeEvents(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data.filter(Boolean);
    if (Array.isArray(data?.events)) return data.events.filter(Boolean);
    if (typeof data === "object" && data.type) return [data];
    return [];
  }

  _scheduleQueueFlush() {
    if (this.frameRequest) return;

    if (typeof requestAnimationFrame === "function") {
      this._frameRequestType = "raf";
      this.frameRequest = requestAnimationFrame(() => {
        this.frameRequest = null;
        this._flushQueue();
      });
    } else {
      this._frameRequestType = "timeout";
      this.frameRequest = setTimeout(() => {
        this.frameRequest = null;
        this._flushQueue();
      }, 0);
    }
  }

  _flushQueue() {
    const MAX_EVENTS_PER_FRAME = 120;
    let processed = 0;

    while (this.eventQueue.length && processed < MAX_EVENTS_PER_FRAME) {
      const event = this.eventQueue.shift();
      this._applyEvent(event);
      processed += 1;
    }

    if (this.eventQueue.length) {
      this._scheduleQueueFlush();
    }
  }

  _applyEvent(event) {
    if (!event || typeof event !== "object") return;

    const type = event.type;
    if (!type) {
      console.warn("Canvas event missing type:", event);
      return;
    }

    // Optional remote canvas size data for scaling
    this._syncRemoteSize(event);
    this._applyDrawingMeta(event);

    try {
      switch (type) {
        case "start":
          this.startDrawing(event.x, event.y);
          break;
        case "move":
          this.draw(event.x, event.y);
          break;
        case "end":
          this.stopDrawing();
          break;
        case "color":
          this.setColor(event.color);
          break;
        case "brush_size":
          this.setBrushSize(event.size);
          break;
        case "clear":
          this.clearCanvas(true);
          break;
        case "snapshot":
          this.applySnapshot(event.image || event.dataUrl || event.dataURL);
          break;
        default:
          console.warn("Unknown canvas update type:", type);
      }

      this._recordEventMetric();
    } catch (error) {
      console.error("Error handling canvas update:", error, event);
    }
  }

  _applyDrawingMeta(event) {
    if (event && typeof event.color === "string") {
      this.setColor(event.color);
    }
    if (event && Number.isFinite(event.size)) {
      this.setBrushSize(event.size);
    }
  }

  _syncRemoteSize(event) {
    const remoteWidth = Number(event?.canvasWidth);
    const remoteHeight = Number(event?.canvasHeight);
    let updated = false;

    if (remoteWidth > 0 && remoteWidth !== this.remoteCanvasSize.width) {
      this.remoteCanvasSize.width = remoteWidth;
      updated = true;
    }
    if (remoteHeight > 0 && remoteHeight !== this.remoteCanvasSize.height) {
      this.remoteCanvasSize.height = remoteHeight;
      updated = true;
    }

    if (updated) {
      this.scaleX =
        this.remoteCanvasSize.width > 0
          ? this.width / this.remoteCanvasSize.width
          : 1;
      this.scaleY =
        this.remoteCanvasSize.height > 0
          ? this.height / this.remoteCanvasSize.height
          : 1;
    }
  }

  _normalizeCoords(x, y) {
    return {
      x: Number.isFinite(x) ? x * this.scaleX : NaN,
      y: Number.isFinite(y) ? y * this.scaleY : NaN,
    };
  }

  _recordEventMetric() {
    const now = Date.now();
    if (!this.firstEventTimestamp) {
      this.firstEventTimestamp = now;
    }
    this.lastEventTimestamp = now;
    this.updateCount += 1;
  }
}

window.ViewerCanvas = ViewerCanvas;

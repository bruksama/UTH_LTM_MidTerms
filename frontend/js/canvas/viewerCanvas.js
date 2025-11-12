/**
 * Canvas Viewing Logic for Viewers/Guessers
 * Receives drawing updates from server and renders them in real-time
 * Features: smooth drawing, color sync, brush size sync, canvas clearing
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

    this.currentColor = "#000000";
    this.currentBrushSize = 5;
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;

    // Performance tracking
    this.updateCount = 0;
    this.lastUpdateTime = Date.now();

    console.log("ViewerCanvas initialized successfully");
  }

  /**
   * Handle canvas update from server
   * Dispatches to appropriate handler based on event type
   * @param {Object} data - Drawing data {type, x, y, color, size}
   * @returns {void}
   */
  handleCanvasUpdate(data) {
    if (!data || !data.type) {
      console.warn("Invalid canvas update data:", data);
      return;
    }

    try {
      switch (data.type) {
        case "start":
          this.startDrawing(data.x, data.y);
          break;

        case "move":
          this.draw(data.x, data.y);
          break;

        case "end":
          this.stopDrawing();
          break;

        case "color":
          this.setColor(data.color);
          break;

        case "brush_size":
          this.setBrushSize(data.size);
          break;

        case "clear":
          this.clearCanvas();
          break;

        default:
          console.warn("Unknown canvas update type:", data.type);
      }

      this.updateCount++;
    } catch (error) {
      console.error("Error handling canvas update:", error, data);
    }
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

    // Validate coordinates
    if (typeof x !== "number" || typeof y !== "number") {
      console.warn("Invalid coordinates for startDrawing:", x, y);
      return;
    }

    this.isDrawing = true;
    this.lastX = x;
    this.lastY = y;

    try {
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
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

    // Validate coordinates
    if (typeof x !== "number" || typeof y !== "number") {
      console.warn("Invalid coordinates for draw:", x, y);
      return;
    }

    try {
      // Apply line styling for smooth rendering
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineWidth = this.currentBrushSize;
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      this.ctx.globalCompositeOperation = "source-over";

      // Draw line from last point to current point
      this.ctx.lineTo(x, y);
      this.ctx.stroke();

      // Update last position for next stroke
      this.lastX = x;
      this.lastY = y;
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

    // Clamp size between 3 and 20 to prevent invalid values
    this.currentBrushSize = Math.min(Math.max(size, 3), 20);
  }

  /**
   * Clear entire canvas
   * Resets to white background for next drawing
   * @returns {void}
   */
  clearCanvas() {
    if (!this.ctx || !this.canvas) return;

    try {
      // Clear canvas to transparent
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Fill with white background
      this.ctx.fillStyle = "white";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Reset drawing state
      this.isDrawing = false;
      this.lastX = 0;
      this.lastY = 0;
    } catch (error) {
      console.error("Error clearing canvas:", error);
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
    };
  }

  /**
   * Reset canvas to initial state
   * @returns {void}
   */
  reset() {
    this.clearCanvas();
    this.currentColor = "#000000";
    this.currentBrushSize = 5;
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.updateCount = 0;
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance data
   */
  getMetrics() {
    const timeSinceLastUpdate = Date.now() - this.lastUpdateTime;
    return {
      updateCount: this.updateCount,
      timeSinceLastUpdate: timeSinceLastUpdate,
      updatesPerSecond: this.updateCount / (timeSinceLastUpdate / 1000),
    };
  }
}

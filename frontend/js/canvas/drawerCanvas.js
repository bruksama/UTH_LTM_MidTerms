/**
 * Canvas Drawing Logic for Drawer
 * Handles drawing events and emits them to server
 */
class DrawerCanvas {
  constructor(canvasId, socketClient) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.socket = socketClient;
    this.isDrawing = false;
    this.enabled = false;
    this.currentColor = "#000000";
    this.currentBrushSize = 5;
    this.lastX = 0;
    this.lastY = 0;

    // NEW: emitter đã được throttle / debounce
    const fallbackThrottle = (fn, ms) => fn; // phòng khi helpers chưa load
    const fallbackDebounce = (fn, ms) => fn;

    const _throttle =
      typeof throttle === "function" ? throttle : fallbackThrottle;
    const _debounce =
      typeof debounce === "function" ? debounce : fallbackDebounce;

    // Throttle ~ 16ms (60fps).
    this.emitMoveThrottled = _throttle((payload) => {
      this.socket?.emit("drawing_move", payload);
    }, 16);

    // Debounce khi đổi màu & cỡ bút để tránh spam khi kéo slider/nhấp liên tục
    this.emitColorDebounced = _debounce((payload) => {
      this.socket?.emit("change_color", payload);
    }, 120);

    this.emitBrushDebounced = _debounce((payload) => {
      this.socket?.emit("change_brush_size", payload);
    }, 120);

    this.setupEventListeners();
    this.setupDrawingTools();
  }

  setupEventListeners() {
    // Mouse events
    this.canvas.addEventListener("mousedown", (e) => this.startDrawing(e));
    this.canvas.addEventListener("mousemove", (e) => this.draw(e));
    this.canvas.addEventListener("mouseup", () => this.stopDrawing());
    this.canvas.addEventListener("mouseout", () => this.stopDrawing());

    // Touch events for mobile
    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      this.canvas.dispatchEvent(mouseEvent);
    });

    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      this.canvas.dispatchEvent(mouseEvent);
    });

    this.canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      const mouseEvent = new MouseEvent("mouseup", {});
      this.canvas.dispatchEvent(mouseEvent);
    });
  }

  setupDrawingTools() {
    // Color picker
    document.querySelectorAll(".color-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document
          .querySelectorAll(".color-btn")
          .forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");
        this.setColor(e.target.dataset.color);
      });
    });

    // Brush size slider
    const brushSlider = document.getElementById("brush-size-slider");
    const brushDisplay = document.getElementById("brush-size-display");
    if (brushSlider) {
      brushSlider.addEventListener("input", (e) => {
        const size = parseInt(e.target.value);
        this.setBrushSize(size);
        if (brushDisplay) {
          brushDisplay.textContent = size;
        }
      });
    }

    // Clear canvas button
    const clearBtn = document.getElementById("clear-canvas-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => this.clearCanvas());
    }
  }

  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  startDrawing(e) {
    if (!this.enabled) return;
    this.isDrawing = true;
    const pos = this.getMousePos(e);
    this.lastX = pos.x;
    this.lastY = pos.y;

    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);

    this.socket?.emit("drawing_start", { x: pos.x, y: pos.y });
  }

  draw(e) {
    if (!this.isDrawing || !this.enabled) return;

    const pos = this.getMousePos(e);

    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.currentBrushSize;
    this.ctx.lineCap = "round";

    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();

    this.emitMoveThrottled({ x: pos.x, y: pos.y });

    this.lastX = pos.x;
    this.lastY = pos.y;
  }

  stopDrawing() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.ctx.closePath();
    this.socket?.emit("drawing_end", {});
  }

  setColor(color) {
    this.currentColor = color;
    this.emitColorDebounced({ color });
  }
  setBrushSize(size) {
    this.currentBrushSize = size;
    this.emitBrushDebounced({ size });
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.socket?.emit("clear_canvas", {});
  }

  enable() {
    this.enabled = true;
    this.canvas.style.cursor = "crosshair";
    const tools = document.getElementById("drawing-tools");
    if (tools) tools.classList.remove("hidden");
  }

  disable() {
    this.enabled = false;
    this.isDrawing = false;
    this.canvas.style.cursor = "default";
    const tools = document.getElementById("drawing-tools");
    if (tools) tools.classList.add("hidden");
  }
}
window.DrawerCanvas = DrawerCanvas;

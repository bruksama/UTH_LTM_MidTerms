/**
 * Canvas Drawing Logic for Drawer
 * Handles drawing events and emits them to server
 */
class DrawerCanvas {
  constructor(canvasId, socketClient) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error("[DrawerCanvas] canvas not found:", canvasId);
      return;
    }

    this.ctx = this.canvas.getContext("2d");
    this.socket = socketClient;
    this.isDrawing = false;
    this.enabled = false;
    this.currentColor = "#000000";
    this.currentBrushSize = 5;
    this.lastX = 0;
    this.lastY = 0;

    const fallbackThrottle = (fn, ms) => fn;
    const fallbackDebounce = (fn, ms) => fn;

    const _throttle =
      typeof throttle === "function" ? throttle : fallbackThrottle;
    const _debounce =
      typeof debounce === "function" ? debounce : fallbackDebounce;

    this.emitMoveThrottled = _throttle((payload) => {
      this.socket?.emit("drawing_move", payload);
    }, 16);

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
    this.canvas.addEventListener("mouseleave", () => this.stopDrawing());

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

    this.canvas.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        const touch = e.touches[0] || e.changedTouches[0];
        this.draw({
          clientX: touch.clientX,
          clientY: touch.clientY,
        });
      },
      { passive: false }
    );

    this.canvas.addEventListener(
      "touchend",
      (e) => {
        e.preventDefault();
        this.stopDrawing();
      },
      { passive: false }
    );
  }

  setupDrawingTools() {
    document.querySelectorAll(".color-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document
          .querySelectorAll(".color-btn")
          .forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");
        this.setColor(e.target.dataset.color);
      });
    });

    const brushSlider = document.getElementById("brush-size-slider");
    const brushDisplay = document.getElementById("brush-size-display");
    if (brushSlider) {
      brushSlider.addEventListener("input", (e) => {
        const size = parseInt(e.target.value, 10) || 1;
        this.setBrushSize(size);
        if (brushDisplay) brushDisplay.textContent = size;
      });
    }

    const clearBtn = document.getElementById("clear-canvas-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => this.clearCanvas());
    }
  }

  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  startDrawing(e) {
    console.log("[DrawerCanvas] mousedown, enabled =", this.enabled);
    if (!this.enabled) return;

    const pos = this.getMousePos(e);
    this.isDrawing = true;
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
    this.currentColor = color || "#000000";
    this.emitColorDebounced({ color: this.currentColor });
  }

  setBrushSize(size) {
    this.currentBrushSize = size || 1;
    this.emitBrushDebounced({ size: this.currentBrushSize });
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.socket?.emit("clear_canvas", {});
  }

  enable() {
    this.enabled = true;
    this.canvas.style.cursor = "crosshair";
    this.canvas.style.pointerEvents = "auto"; // 🔥 đảm bảo bắt được chuột
    const tools = document.getElementById("drawing-tools");
    if (tools) tools.classList.remove("hidden");
    console.log("[DrawerCanvas] ENABLE()");
  }

  disable() {
    this.enabled = false;
    this.isDrawing = false;
    this.canvas.style.cursor = "default";
    this.canvas.style.pointerEvents = "none"; // 🔥 chặn click khi không phải drawer
    const tools = document.getElementById("drawing-tools");
    if (tools) tools.classList.add("hidden");
    console.log("[DrawerCanvas] DISABLE()");
  }
}
window.DrawerCanvas = DrawerCanvas;

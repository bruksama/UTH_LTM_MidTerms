// Timer utility used by GameUI
// Supports both browser (window.Timer) and Node (module.exports)
class Timer {
  /**
   * Create a countdown timer
   * @param {number} seconds - starting seconds
   * @param {function(number):void} onTick - called each second with remaining seconds
   * @param {function():void} onEnd - called when timer reaches 0
   */
  constructor(seconds, onTick, onEnd) {
    this.seconds = Math.max(0, Math.floor(seconds) || 0);
    this.onTick = typeof onTick === "function" ? onTick : () => {};
    this.onEnd = typeof onEnd === "function" ? onEnd : () => {};

    this._interval = null;
    this._running = false;
  }

  start() {
    if (this._running) return;
    this._running = true;
    // immediate tick
    this.onTick(this.seconds);
    if (this.seconds <= 0) {
      this._finish();
      return;
    }
    this._interval = setInterval(() => {
      this.seconds -= 1;
      try {
        this.onTick(this.seconds);
      } catch (e) {
        console.error("Timer onTick error", e);
      }
      if (this.seconds <= 0) {
        this._finish();
      }
    }, 1000);
  }

  _finish() {
    this.stop();
    try {
      this.onEnd();
    } catch (e) {
      console.error("Timer onEnd error", e);
    }
  }

  stop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
    this._running = false;
  }

  reset(seconds) {
    this.stop();
    this.seconds = Math.max(0, Math.floor(seconds) || 0);
  }

  isRunning() {
    return this._running;
  }
}

if (typeof window !== "undefined") {
  window.Timer = Timer;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = Timer;
}

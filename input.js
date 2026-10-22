// input.js
(function (global) {
  class InputManager {
    constructor() {
      this.keys = {};
      this.touch = { throttle: 0, brake: 0, steer: 0 };
      this.gamepadIndex = null;

      window.addEventListener('keydown', (e) => (this.keys[e.code] = true));
      window.addEventListener('keyup', (e) => (this.keys[e.code] = false));
      window.addEventListener('blur', () => (this.keys = {}));
    }

    setTouch({ throttle = 0, brake = 0, steer = 0 }) {
      this.touch.throttle = throttle;
      this.touch.brake = brake;
      this.touch.steer = steer;
    }

    poll() {
      let throttle = 0, brake = 0, steer = 0, handbrake = false;

      if (this.keys['KeyW'] || this.keys['ArrowUp']) throttle = 1;
      if (this.keys['KeyS'] || this.keys['ArrowDown']) brake = 1;
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) steer -= 1;
      if (this.keys['KeyD'] || this.keys['ArrowRight']) steer += 1;
      if (this.keys['Space']) handbrake = true;

      throttle = Math.max(throttle, this.touch.throttle);
      brake = Math.max(brake, this.touch.brake);
      if (this.touch.steer !== 0) steer = this.touch.steer;

      const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : [];
      const pad = pads[this.gamepadIndex ?? 0] || pads[0];
      if (pad) {
        this.gamepadIndex = pad.index;
        const axis = pad.axes[0] ?? 0;
        if (Math.abs(axis) > 0.15) steer = axis;
        const t = pad.buttons[7]?.value ?? 0;
        const b = pad.buttons[6]?.value ?? 0;
        if (t > 0.2) throttle = t;
        if (b > 0.2) brake = b;
        if (pad.buttons[0]?.pressed) handbrake = true;
      }

      return {
        throttle: clamp(throttle, 0, 1),
        brake: clamp(brake, 0, 1),
        steer: clamp(steer, -1, 1),
        handbrake
      };
    }
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  global.InputManager = InputManager;
})(typeof window !== 'undefined' ? window : this);
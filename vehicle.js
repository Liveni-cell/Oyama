// vehicle.js
(function (global) {
  const THREE = global.THREE;

  class Vehicle {
    constructor(mesh, type = 'car', opts = {}) {
      this.mesh = mesh;
      this.type = type; // 'car'
      this.pos = mesh.position.clone();
      this.yaw = 0;

      this.maxSpeed = opts.maxSpeed ?? 62;      // m/s (~220 km/h)
      this.accel = opts.accel ?? 18;
      this.brakeDecel = opts.brakeDecel ?? 30;
      this.drag = opts.drag ?? 0.985;
      this.steerSpeed = opts.steerSpeed ?? 3.0;
      this.turnRadius = opts.turnRadius ?? 7.5;
      this.driftFactor = opts.driftFactor ?? 0.18;

      this.speed = 0;
      this.steerAngle = 0;
      this.vel = new THREE.Vector3();
    }

    update(dt, input) {
      const { throttle, brake, steer, handbrake } = input;

      if (throttle > 0) {
        if (this.speed < 0) {
          this.speed += this.brakeDecel * throttle * dt;
        } else {
          this.speed += this.accel * throttle * dt;
        }
      } else if (brake > 0) {
        if (this.speed > 0) {
          this.speed -= this.brakeDecel * brake * dt;
        } else {
          this.speed -= (this.accel * 0.6) * brake * dt;
        }
      } else {
        this.speed *= Math.pow(this.drag, dt * 60);
      }

      if (handbrake) this.speed *= Math.pow(0.95, dt * 60);

      if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
      if (this.speed < -this.maxSpeed * 0.4) this.speed = -this.maxSpeed * 0.4;
      if (Math.abs(this.speed) < 0.02) this.speed = 0;

      const moveFactor = Math.min(Math.abs(this.speed) / 10, 1);
      const targetSteer = steer * (0.8 + 0.2 * (1 - moveFactor));
      const steerDiff = targetSteer - this.steerAngle;
      if (Math.abs(steerDiff) < 0.01) {
        this.steerAngle = targetSteer;
      } else {
        this.steerAngle += Math.sign(steerDiff) * Math.min(Math.abs(steerDiff), this.steerSpeed * dt);
      }
      this.steerAngle = clamp(this.steerAngle, -0.8, 0.8);

      if (Math.abs(this.speed) > 0.1) {
        const R = this.turnRadius / (Math.abs(this.steerAngle) + 0.001);
        const omega = (this.speed / R) * Math.sign(this.steerAngle);
        this.yaw += omega * dt;

        const fwd = new THREE.Vector3(Math.sin(this.yaw), 0, -Math.cos(this.yaw));
        const targetVel = fwd.clone().multiplyScalar(this.speed);
        this.vel.lerp(targetVel, 1 - this.driftFactor);
      } else {
        this.vel.set(0, 0, 0);
      }

      this.pos.add(this.vel.clone().multiplyScalar(dt));
      this.mesh.position.copy(this.pos);
      this.mesh.rotation.y = this.yaw;
    }

    getSpeedKmh() { return this.speed * 3.6; }
    getRpm() {
      const s = Math.abs(this.speed);
      const t = 0.6 + 0.4 * (s / this.maxSpeed);
      return 900 + t * 8100;
    }
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  global.Vehicle = Vehicle;
})(typeof window !== 'undefined' ? window : this);
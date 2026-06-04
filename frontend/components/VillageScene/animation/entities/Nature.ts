import { Entity, EntityConfig } from "../Entity";
import { COLORS, vx, vy, vscale } from "../../config";

// --- Cloud ---
export class Cloud extends Entity {
  private _w = 0;
  private _h = 0;
  private offset = Math.random() * Math.PI * 2;

  constructor(config: EntityConfig) {
    super({ z: 0.05, ...config });
  }

  resize(canvasW: number, canvasH: number): void {
    this._w = canvasW;
    this._h = canvasH;
  }

  update(dt: number, _time: number): void {
    this.x += this.speed * dt * 15;
    if (this.x > 2200) this.x = -200;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const cx = vx(this.x, this._w);
    const cy = vy(this.y, this._h);
    const s = vscale(1, this._w) * this.scale;
    const bob = Math.sin(performance.now() / 1000 * 0.3 + this.offset) * 2;

    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = COLORS.cloud;

    const parts = [
      [0, 0, 30 * s],
      [25 * s, -5 * s, 25 * s],
      [-20 * s, -3 * s, 20 * s],
      [12 * s, -8 * s, 18 * s],
      [-8 * s, -10 * s, 15 * s],
    ];

    for (const [px, py, r] of parts) {
      ctx.beginPath();
      ctx.arc(cx + px, cy + py + bob, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// --- Bird ---
export class Bird extends Entity {
  private _w = 0;
  private _h = 0;
  private centerX: number;
  private centerY: number;
  private radiusA: number;
  private radiusB: number;
  private phase: number;
  private wingPhase = 0;

  constructor(config: EntityConfig & {
    centerX?: number;
    centerY?: number;
    radiusA?: number;
    radiusB?: number;
    phase?: number;
  }) {
    super({ z: 0.03, ...config });
    this.centerX = config.centerX ?? config.x;
    this.centerY = config.centerY ?? config.y;
    this.radiusA = config.radiusA ?? 100;
    this.radiusB = config.radiusB ?? 60;
    this.phase = config.phase ?? Math.random() * Math.PI * 2;
  }

  resize(canvasW: number, canvasH: number): void {
    this._w = canvasW;
    this._h = canvasH;
  }

  update(_dt: number, time: number): void {
    this.x = this.centerX + Math.cos(time * this.speed + this.phase) * this.radiusA;
    this.y = this.centerY + Math.sin(time * this.speed * 0.7 + this.phase) * this.radiusB;
    this.wingPhase = time * this.speed * 4;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const cx = vx(this.x, this._w);
    const cy = vy(this.y, this._h);
    const s = vscale(1, this._w) * this.scale;
    const wingUp = Math.sin(this.wingPhase) * 4 * s;

    ctx.save();
    ctx.strokeStyle = "#1A1507";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";

    // Body
    ctx.beginPath();
    ctx.ellipse(cx, cy, 6 * s, 2 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#1A1507";
    ctx.fill();

    // Left wing
    ctx.beginPath();
    ctx.moveTo(cx - 2 * s, cy);
    ctx.quadraticCurveTo(cx - 10 * s, cy - 5 * s - wingUp, cx - 6 * s, cy - 1 * s);
    ctx.stroke();

    // Right wing
    ctx.beginPath();
    ctx.moveTo(cx + 2 * s, cy);
    ctx.quadraticCurveTo(cx + 10 * s, cy + 5 * s + wingUp, cx + 6 * s, cy - 1 * s);
    ctx.stroke();

    ctx.restore();
  }
}

// --- Grass ---
export class Grass extends Entity {
  private _w = 0;
  private _h = 0;
  private offset = Math.random() * Math.PI * 2;
  private stalks: number[] = [];

  constructor(config: EntityConfig) {
    super({ z: 0.9, ...config });
    const n = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      this.stalks.push((Math.random() - 0.5) * 15);
    }
  }

  resize(canvasW: number, canvasH: number): void {
    this._w = canvasW;
    this._h = canvasH;
  }

  update(_dt: number, _time: number): void {}

  draw(ctx: CanvasRenderingContext2D): void {
    const cx = vx(this.x, this._w);
    const by = vy(this.y, this._h);
    const s = vscale(1, this._w) * this.scale;
    const time = performance.now() / 1000;
    const sway = Math.sin(time * 2 + this.offset) * 3 * s;

    ctx.save();
    ctx.strokeStyle = COLORS.grass;
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";

    for (const sx of this.stalks) {
      const bx = cx + sx * s;
      const tipX = bx + sway;
      const tipY = by - (8 + Math.abs(sx) * 0.5) * s;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(bx + sway * 0.5, by - 5 * s, tipX, tipY);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// --- Ritual Marker ---
export class RitualMarker extends Entity {
  private _w = 0;
  private _h = 0;
  private offset = Math.random() * Math.PI * 2;

  constructor(config: EntityConfig) {
    super({ z: 0.6, ...config });
  }

  resize(canvasW: number, canvasH: number): void {
    this._w = canvasW;
    this._h = canvasH;
  }

  update(_dt: number, _time: number): void {}

  draw(ctx: CanvasRenderingContext2D): void {
    const cx = vx(this.x, this._w);
    const by = vy(this.y, this._h);
    const s = vscale(1, this._w) * this.scale;
    const time = performance.now() / 1000;
    const glow = 10 + 8 * Math.sin(time * 1.2 + this.offset);

    // Stone pillar
    ctx.fillStyle = COLORS.tech.markerStone;
    ctx.beginPath();
    ctx.moveTo(cx - 6 * s, by);
    ctx.lineTo(cx - 4 * s, by - 40 * s);
    ctx.lineTo(cx + 4 * s, by - 40 * s);
    ctx.lineTo(cx + 6 * s, by);
    ctx.closePath();
    ctx.fill();

    // Pillar line detail
    ctx.strokeStyle = "rgba(90, 60, 30, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, by - 38 * s);
    ctx.lineTo(cx, by - 2 * s);
    ctx.stroke();

    // Diamond symbol at top
    ctx.save();
    ctx.shadowColor = COLORS.tech.markerGlow;
    ctx.shadowBlur = glow;
    ctx.fillStyle = COLORS.tech.markerGlow;
    ctx.beginPath();
    ctx.moveTo(cx, by - 50 * s);
    ctx.lineTo(cx + 6 * s, by - 44 * s);
    ctx.lineTo(cx, by - 38 * s);
    ctx.lineTo(cx - 6 * s, by - 44 * s);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

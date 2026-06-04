import { Entity, EntityConfig } from "../Entity";
import { COLORS, vx, vy, vscale } from "../../config";

interface Waypoint {
  x: number;
  y: number;
}

export interface VillagerConfig extends EntityConfig {
  waypoints: Waypoint[];
  speed?: number;
}

export class Villager extends Entity {
  waypoints: Waypoint[];
  private currentTarget = 0;
  private _w = 0;
  private _h = 0;
  private stepTime = Math.random() * Math.PI * 2;
  private facingRight = true;

  constructor(config: VillagerConfig) {
    super({ z: 0.85, speed: config.speed ?? 0.5, ...config });
    this.waypoints = config.waypoints;
  }

  resize(canvasW: number, canvasH: number): void {
    this._w = canvasW;
    this._h = canvasH;
  }

  update(dt: number, time: number): void {
    if (this.waypoints.length === 0) return;

    const target = this.waypoints[this.currentTarget];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const moveSpeed = this.speed * 30 * dt;

    this.stepTime = time;

    if (dist < 2) {
      this.currentTarget = (this.currentTarget + 1) % this.waypoints.length;
    } else {
      this.facingRight = dx > 0;
      this.x += (dx / dist) * moveSpeed;
      this.y += (dy / dist) * moveSpeed;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const cx = vx(this.x, this._w);
    const by = vy(this.y, this._h);
    const s = vscale(1, this._w) * this.scale;
    const stepBob = Math.abs(Math.sin(this.stepTime * 3)) * 2 * s;
    const legSwing = Math.sin(this.stepTime * 3) * 3 * s;
    const dir = this.facingRight ? 1 : -1;

    ctx.save();

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.beginPath();
    ctx.ellipse(cx, by, 6 * s, 2 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (robe/sash)
    ctx.fillStyle = COLORS.character.body;
    ctx.beginPath();
    ctx.moveTo(cx - 4 * s, by);
    ctx.lineTo(cx - 3 * s, by - 16 * s - stepBob);
    ctx.lineTo(cx + 3 * s, by - 16 * s - stepBob);
    ctx.lineTo(cx + 4 * s, by);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.fillStyle = COLORS.character.skin;
    ctx.beginPath();
    ctx.arc(cx + dir * 1 * s, by - 20 * s - stepBob, 4 * s, 0, Math.PI * 2);
    ctx.fill();

    // Head wrap/crown detail
    ctx.strokeStyle = COLORS.tech.markerGlow;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx + dir * 1 * s, by - 20 * s - stepBob, 4.5 * s, Math.PI * 0.6, Math.PI * 0.4, true);
    ctx.stroke();

    // Legs
    ctx.strokeStyle = COLORS.character.body;
    ctx.lineWidth = 2 * s;
    ctx.lineCap = "round";
    // Left leg
    ctx.beginPath();
    ctx.moveTo(cx - 2 * s, by - 2 * s);
    ctx.lineTo(cx - 2 * s - legSwing, by);
    ctx.stroke();
    // Right leg
    ctx.beginPath();
    ctx.moveTo(cx + 2 * s, by - 2 * s);
    ctx.lineTo(cx + 2 * s + legSwing, by);
    ctx.stroke();

    // Arm (carrying something)
    ctx.strokeStyle = COLORS.character.skin;
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(cx + dir * 3 * s, by - 14 * s - stepBob);
    ctx.lineTo(cx + dir * 6 * s, by - 10 * s - stepBob);
    ctx.stroke();

    // Basket/goods on head or carried
    ctx.fillStyle = COLORS.hut.wall;
    ctx.beginPath();
    ctx.ellipse(cx + dir * 6 * s, by - 9 * s - stepBob, 3 * s, 2 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

import { Entity, EntityConfig } from "../Entity";
import { COLORS, VIRTUAL_WIDTH, vx, vy, vscale } from "../../config";

export interface HutConfig extends EntityConfig {
  hasHexPattern?: boolean;
  roofWidth?: number;
  roofHeight?: number;
  wallWidth?: number;
  wallHeight?: number;
}

export class Hut extends Entity {
  wallWidth: number;
  wallHeight: number;
  roofWidth: number;
  roofHeight: number;
  hasHexPattern: boolean;
  private _w = 0;
  private _h = 0;

  constructor(config: HutConfig) {
    super({ z: 0.5, ...config });
    this.wallWidth = config.wallWidth ?? 80;
    this.wallHeight = config.wallHeight ?? 100;
    this.roofWidth = config.roofWidth ?? 140;
    this.roofHeight = config.roofHeight ?? 90;
    this.hasHexPattern = config.hasHexPattern ?? false;
  }

  resize(canvasW: number, canvasH: number): void {
    this._w = canvasW;
    this._h = canvasH;
  }

  update(_dt: number, _time: number): void {}

  draw(ctx: CanvasRenderingContext2D): void {
    const ww = vscale(this.wallWidth, this._w);
    const wh = vscale(this.wallHeight, this._w);
    const rw = vscale(this.roofWidth, this._w);
    const rh = vscale(this.roofHeight, this._w);
    const cx = vx(this.x, this._w);
    const by = vy(this.y, this._h);
    const ty = by - wh;
    const apex = ty - rh;

    // Wall
    const wallGrad = ctx.createLinearGradient(cx - ww / 2, 0, cx + ww / 2, 0);
    wallGrad.addColorStop(0, COLORS.hut.wallShadow);
    wallGrad.addColorStop(0.3, COLORS.hut.wall);
    wallGrad.addColorStop(0.7, COLORS.hut.wall);
    wallGrad.addColorStop(1, COLORS.hut.wallShadow);
    ctx.fillStyle = wallGrad;
    ctx.beginPath();
    ctx.moveTo(cx - ww / 2, by);
    ctx.lineTo(cx - ww / 2 + 5, ty);
    ctx.lineTo(cx + ww / 2 - 5, ty);
    ctx.lineTo(cx + ww / 2, by);
    ctx.closePath();
    ctx.fill();

    // Wall bottom ellipse
    ctx.fillStyle = COLORS.hut.wallShadow;
    ctx.beginPath();
    ctx.ellipse(cx, by, ww / 2, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wall top ellipse
    ctx.fillStyle = COLORS.hut.wallShadow;
    ctx.beginPath();
    ctx.ellipse(cx, ty, ww / 2 - 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hex pattern on wall
    if (this.hasHexPattern) {
      this.drawHexPattern(ctx, cx, ty, wh, ww);
    }

    // Doorway
    const doorW = vscale(20, this._w);
    const doorH = vscale(45, this._w);
    ctx.fillStyle = COLORS.hut.doorway;
    ctx.beginPath();
    ctx.moveTo(cx - doorW / 2, by);
    ctx.lineTo(cx - doorW / 2, by - doorH + doorW / 2);
    ctx.arc(cx, by - doorH + doorW / 2, doorW / 2, Math.PI, 0, true);
    ctx.lineTo(cx + doorW / 2, by);
    ctx.closePath();
    ctx.fill();

    // Warm interior glow
    const doorGlow = ctx.createRadialGradient(
      cx, by - doorH / 2, 0,
      cx, by - doorH / 2, doorW * 1.5
    );
    doorGlow.addColorStop(0, "rgba(212, 168, 83, 0.12)");
    doorGlow.addColorStop(1, "rgba(212, 168, 83, 0)");
    ctx.fillStyle = doorGlow;
    ctx.fillRect(cx - doorW * 2, by - doorH * 2, doorW * 4, doorH * 2.5);

    // Roof (conical thatched)
    ctx.fillStyle = COLORS.hut.roof;
    ctx.beginPath();
    ctx.moveTo(apex, ty - rh);
    ctx.quadraticCurveTo(cx - rw / 2, ty - 10, cx - rw / 2, ty + 5);
    ctx.lineTo(cx + rw / 2, ty + 5);
    ctx.quadraticCurveTo(cx + rw / 2, ty - 10, apex, ty - rh);
    ctx.closePath();
    ctx.fill();

    // Roof overhang shadow
    ctx.fillStyle = "rgba(13, 10, 3, 0.3)";
    ctx.beginPath();
    ctx.ellipse(cx, ty + 5, rw / 2, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Thatch texture strokes
    ctx.strokeStyle = COLORS.hut.roofHighlight;
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      const t = i / 10;
      const sx = cx + (apex - cx) * t;
      const sy = (ty - rh) + (rh) * t;
      const spread = rw / 2 * t;
      ctx.beginPath();
      ctx.moveTo(sx - spread * 0.3, sy);
      ctx.lineTo(sx + spread * 0.3, sy + 5);
      ctx.stroke();
    }

    // Roof apex detail
    ctx.strokeStyle = COLORS.hut.roofDark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(apex - 5, ty - rh - 5);
    ctx.lineTo(apex + 5, ty - rh + 3);
    ctx.moveTo(apex + 5, ty - rh - 5);
    ctx.lineTo(apex - 5, ty - rh + 3);
    ctx.stroke();

    // Cross poles at apex
    ctx.strokeStyle = COLORS.tree.trunk;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(apex - 8, ty - rh);
    ctx.lineTo(apex + 8, ty - rh + 8);
    ctx.moveTo(apex + 8, ty - rh);
    ctx.lineTo(apex - 8, ty - rh + 8);
    ctx.stroke();
  }

  private drawHexPattern(
    ctx: CanvasRenderingContext2D,
    cx: number,
    ty: number,
    wh: number,
    ww: number
  ) {
    ctx.strokeStyle = COLORS.tech.hexPattern;
    ctx.lineWidth = 1;
    const hexR = vscale(10, this._w);
    const rows = 3;
    const cols = 4;
    const startY = ty + vscale(15, this._w);
    const hexH = hexR * 1.5;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const hx = cx - (ww / 2) + vscale(12, this._w) + c * hexR * 1.8 + (r % 2) * hexR * 0.9;
        const hy = startY + r * hexH;
        if (hx > cx + ww / 2 - vscale(10, this._w)) continue;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const px = hx + hexR * Math.cos(angle);
          const py = hy + hexR * Math.sin(angle);
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
  }
}

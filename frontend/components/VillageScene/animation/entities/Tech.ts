import { Entity, EntityConfig } from "../Entity";
import { COLORS, vx, vy, vscale } from "../../config";

// --- Holographic Display ---
export class HolographicDisplay extends Entity {
  private _w = 0;
  private _h = 0;
  private offset = Math.random() * Math.PI * 2;

  constructor(config: EntityConfig) {
    super({ z: 0.7, ...config });
  }

  resize(canvasW: number, canvasH: number): void {
    this._w = canvasW;
    this._h = canvasH;
  }

  update(_dt: number, _time: number): void {}

  draw(ctx: CanvasRenderingContext2D): void {
    const cx = vx(this.x, this._w);
    const cy = vy(this.y, this._h);
    const s = vscale(1, this._w) * this.scale;
    const time = performance.now() / 1000;
    const pulse = 0.6 + 0.4 * Math.sin(time * 1.5 + this.offset);
    const panelW = 70 * s;
    const panelH = 40 * s;

    ctx.save();

    // Panel background
    ctx.fillStyle = COLORS.tech.hologramBg;
    ctx.fillRect(cx - panelW / 2, cy - panelH / 2, panelW, panelH);

    // Panel border
    ctx.strokeStyle = COLORS.tech.hologramBorder;
    ctx.lineWidth = 1;
    ctx.globalAlpha = pulse;
    ctx.strokeRect(cx - panelW / 2, cy - panelH / 2, panelW, panelH);
    ctx.globalAlpha = 1;

    // Grid lines
    ctx.strokeStyle = COLORS.tech.hologramGrid;
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 5; i++) {
      const gx = cx - panelW / 2 + (panelW / 5) * i;
      ctx.beginPath();
      ctx.moveTo(gx, cy - panelH / 2);
      ctx.lineTo(gx, cy + panelH / 2);
      ctx.stroke();
    }
    for (let i = 1; i < 3; i++) {
      const gy = cy - panelH / 2 + (panelH / 3) * i;
      ctx.beginPath();
      ctx.moveTo(cx - panelW / 2, gy);
      ctx.lineTo(cx + panelW / 2, gy);
      ctx.stroke();
    }

    // Mini price chart line
    ctx.strokeStyle = COLORS.tech.hologramText;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < panelW - 10; x += 2) {
      const px = cx - panelW / 2 + 5 + x;
      const chartY = Math.sin((x + time * 30) * 0.05) * 5 * s
        + Math.sin((x + time * 20) * 0.02) * 8 * s;
      const py = cy + 5 * s + chartY;
      if (x === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Text: RITUAL price
    ctx.fillStyle = COLORS.tech.hologramText;
    ctx.font = `${9 * s}px monospace`;
    ctx.textAlign = "left";
    ctx.fillText("RITUAL", cx - panelW / 2 + 5, cy - panelH / 2 + 12);
    ctx.fillText("$1.97", cx - panelW / 2 + 5, cy - panelH / 2 + 22);

    ctx.restore();
  }
}

// --- Market Stall ---
export class MarketStall extends Entity {
  private _w = 0;
  private _h = 0;

  constructor(config: EntityConfig) {
    super({ z: 0.45, ...config });
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
    const roofW = 60 * s;
    const roofH = 20 * s;
    const postH = 35 * s;

    // Back wall cloth
    ctx.fillStyle = "rgba(200, 160, 100, 0.15)";
    ctx.fillRect(cx - roofW / 2 + 5, by - postH, roofW - 10, postH);

    // Display table
    ctx.fillStyle = COLORS.tree.trunk;
    ctx.fillRect(cx - 20 * s, by - 10 * s, 40 * s, 4 * s);

    // Goods on table (small colored dots)
    const goods = ["#D4A853", "#4ADE80", "#FBBF24", "#F87171", "#60A5FA"];
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = goods[i];
      ctx.beginPath();
      ctx.arc(cx - 15 * s + i * 7 * s, by - 12 * s, 2 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Posts
    ctx.strokeStyle = COLORS.tree.trunk;
    ctx.lineWidth = 3 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - roofW / 2, by);
    ctx.lineTo(cx - roofW / 2, by - postH);
    ctx.moveTo(cx + roofW / 2, by);
    ctx.lineTo(cx + roofW / 2, by - postH);
    ctx.stroke();

    // Thatched roof
    ctx.fillStyle = COLORS.hut.roof;
    ctx.beginPath();
    ctx.moveTo(cx - roofW / 2 - 5, by - postH);
    ctx.quadraticCurveTo(cx, by - postH - roofH, cx + roofW / 2 + 5, by - postH);
    ctx.lineTo(cx + roofW / 2 - 3, by - postH + 3);
    ctx.quadraticCurveTo(cx, by - postH - roofH + 5, cx - roofW / 2 + 3, by - postH + 3);
    ctx.closePath();
    ctx.fill();

    // Roof highlight
    ctx.strokeStyle = COLORS.hut.roofHighlight;
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const t = i / 4;
      ctx.beginPath();
      ctx.moveTo(cx - roofW / 2 * (1 - t) - 3 * (1 - t) * s, by - postH - roofH * t);
      ctx.lineTo(cx + roofW / 2 * (1 - t) + 3 * (1 - t) * s, by - postH - roofH * t + 3);
      ctx.stroke();
    }
  }
}

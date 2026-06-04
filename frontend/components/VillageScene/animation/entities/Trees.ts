import { Entity, EntityConfig } from "../Entity";
import { COLORS, vx, vy, vscale } from "../../config";

type TreeType = "acacia" | "palm";

export interface TreeConfig extends EntityConfig {
  treeType?: TreeType;
  swaySpeed?: number;
  swayAmount?: number;
}

export class Tree extends Entity {
  treeType: TreeType;
  swaySpeed: number;
  swayAmount: number;
  private _w = 0;
  private _h = 0;
  private swayOffset = Math.random() * Math.PI * 2;

  constructor(config: TreeConfig) {
    super({ z: config.treeType === "palm" ? 0.8 : 0.1, ...config });
    this.treeType = config.treeType ?? "acacia";
    this.swaySpeed = config.swaySpeed ?? 0.8;
    this.swayAmount = config.swayAmount ?? 0.02;
  }

  resize(canvasW: number, canvasH: number): void {
    this._w = canvasW;
    this._h = canvasH;
  }

  update(_dt: number, time: number): void {}

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.treeType === "acacia") this.drawAcacia(ctx);
    else this.drawPalm(ctx);
  }

  private drawAcacia(ctx: CanvasRenderingContext2D): void {
    const cx = vx(this.x, this._w);
    const by = vy(this.y, this._h);
    const trunkH = vscale(70, this._w) * this.scale;
    const trunkW = vscale(4, this._w) * this.scale;
    const canopyR = vscale(55, this._w) * this.scale;
    const time = performance.now() / 1000;
    const sway = Math.sin(time * this.swaySpeed + this.swayOffset) * this.swayAmount;

    // Trunk with subtle S-curve and sway
    ctx.strokeStyle = COLORS.tree.trunk;
    ctx.lineWidth = trunkW;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, by);
    ctx.bezierCurveTo(
      cx + sway * 5,
      by - trunkH * 0.3,
      cx + sway * 10,
      by - trunkH * 0.6,
      cx + sway * 15,
      by - trunkH
    );
    ctx.stroke();

    // Flat umbrella canopy
    const canopyCx = cx + sway * 15;
    const canopyCy = by - trunkH;
    ctx.fillStyle = COLORS.tree.acaciaLeaf;
    for (let i = 0; i < 7; i++) {
      const angle = (Math.PI * 2 * i) / 7;
      const dist = canopyR * (0.5 + Math.random() * 0.3);
      const ex = canopyCx + Math.cos(angle) * dist;
      const ey = canopyCy + Math.sin(angle) * dist * 0.4;
      ctx.beginPath();
      ctx.ellipse(ex, ey, canopyR * 0.6, canopyR * 0.25, angle * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    // Lighter overlay patches
    ctx.fillStyle = COLORS.tree.acaciaLeafLight;
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 * i) / 4 + 0.3;
      const dist = canopyR * 0.4;
      const ex = canopyCx + Math.cos(angle) * dist;
      const ey = canopyCy + Math.sin(angle) * dist * 0.3;
      ctx.beginPath();
      ctx.ellipse(ex, ey, canopyR * 0.35, canopyR * 0.15, angle * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawPalm(ctx: CanvasRenderingContext2D): void {
    const cx = vx(this.x, this._w);
    const by = vy(this.y, this._h);
    const trunkH = vscale(90, this._w) * this.scale;
    const frondLen = vscale(45, this._w) * this.scale;
    const time = performance.now() / 1000;
    const sway = Math.sin(time * this.swaySpeed + this.swayOffset) * this.swayAmount * 8;

    // Trunk with ringed texture
    ctx.strokeStyle = COLORS.tree.palmTrunk;
    ctx.lineWidth = vscale(5, this._w) * this.scale;
    ctx.beginPath();
    ctx.moveTo(cx, by);
    ctx.lineTo(cx + sway, by - trunkH);
    ctx.stroke();

    // Rings
    ctx.strokeStyle = "rgba(80, 50, 20, 0.4)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 8; i++) {
      const t = i / 8;
      const rx = cx + sway * t;
      const ry = by - trunkH * t;
      const ringW = vscale(3, this._w) * this.scale;
      ctx.beginPath();
      ctx.ellipse(rx, ry, ringW, 1.5, sway * 0.05, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Fronds
    const topX = cx + sway;
    const topY = by - trunkH;
    for (let i = 0; i < 7; i++) {
      const angle = (Math.PI * 2 * i) / 7;
      const frondSway = Math.sin(time * this.swaySpeed + this.swayOffset + i) * this.swayAmount * 10;
      const endX = topX + Math.cos(angle) * frondLen + frondSway;
      const endY = topY + Math.sin(angle) * frondLen * 0.5;

      ctx.strokeStyle = COLORS.tree.palmFrond;
      ctx.lineWidth = vscale(3, this._w) * this.scale;
      ctx.beginPath();
      ctx.moveTo(topX, topY);
      ctx.quadraticCurveTo(
        topX + Math.cos(angle) * frondLen * 0.5 + frondSway * 0.5,
        topY + Math.sin(angle) * frondLen * 0.25 + 10,
        endX,
        endY
      );
      ctx.stroke();

      // Midrib highlight
      ctx.strokeStyle = "rgba(60, 120, 50, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(topX, topY);
      ctx.quadraticCurveTo(
        topX + Math.cos(angle) * frondLen * 0.5 + frondSway * 0.5,
        topY + Math.sin(angle) * frondLen * 0.25 + 10,
        endX,
        endY
      );
      ctx.stroke();
    }
  }
}

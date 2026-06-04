import { BackgroundRenderer } from "../Scene";
import { COLORS, VIRTUAL_WIDTH, VIRTUAL_HEIGHT, vx, vy, vscale } from "../../config";

export function createBackgroundRenderers(): BackgroundRenderer[] {
  return [skyRenderer, sunRenderer, mountainsRenderer, groundRenderer];
}

const skyRenderer: BackgroundRenderer = {
  draw(ctx, _time, w, h) {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, COLORS.sky.top);
    gradient.addColorStop(0.4, COLORS.sky.mid);
    gradient.addColorStop(0.7, COLORS.sky.bottom);
    gradient.addColorStop(1, COLORS.ground.horizon);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  },
};

const sunRenderer: BackgroundRenderer = {
  draw(ctx, time, w, h) {
    const cx = w * 0.65;
    const cy = h * 0.2 + Math.sin(time * 0.015) * 40;
    const r = Math.min(w, h) * 0.08;

    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 3);
    glow.addColorStop(0, "rgba(255, 224, 102, 0.4)");
    glow.addColorStop(0.3, "rgba(255, 200, 100, 0.15)");
    glow.addColorStop(1, "rgba(255, 200, 100, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    core.addColorStop(0, COLORS.sun.core);
    core.addColorStop(0.7, "rgba(255, 200, 80, 0.8)");
    core.addColorStop(1, COLORS.sun.glow);
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  },
};

function drawMountainRange(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  peaks: [number, number][],
  color: string,
  offsetY: number
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (const [px, py] of peaks) {
    ctx.lineTo(px, h * offsetY + py);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
}

const mountainsRenderer: BackgroundRenderer = {
  draw(ctx, _time, w, h) {
    const s = (n: number) => vscale(n, w);

    // Far mountains
    drawMountainRange(
      ctx,
      w,
      h,
      [
        [s(-50), s(200)],
        [s(100), s(80)],
        [s(200), s(100)],
        [s(320), s(50)],
        [s(450), s(90)],
        [s(550), s(30)],
        [s(680), s(70)],
        [s(800), s(20)],
        [s(950), s(60)],
        [s(1100), s(40)],
        [s(1250), s(80)],
        [s(1400), s(30)],
        [s(1550), s(70)],
        [s(1700), s(50)],
        [s(1850), s(90)],
        [s(2000), s(120)],
      ],
      COLORS.mountain.far,
      0.2
    );

    // Mid mountains
    drawMountainRange(
      ctx,
      w,
      h,
      [
        [s(-30), s(160)],
        [s(80), s(100)],
        [s(180), s(130)],
        [s(260), s(80)],
        [s(380), s(110)],
        [s(500), s(60)],
        [s(600), s(100)],
        [s(720), s(50)],
        [s(850), s(90)],
        [s(1000), s(70)],
        [s(1150), s(100)],
        [s(1300), s(60)],
        [s(1450), s(95)],
        [s(1600), s(75)],
        [s(1800), s(110)],
        [s(1950), s(140)],
      ],
      COLORS.mountain.mid,
      0.25
    );

    // Near hills
    drawMountainRange(
      ctx,
      w,
      h,
      [
        [s(-60), s(120)],
        [s(50), s(80)],
        [s(150), s(100)],
        [s(280), s(60)],
        [s(400), s(90)],
        [s(550), s(50)],
        [s(700), s(80)],
        [s(850), s(40)],
        [s(1000), s(70)],
        [s(1200), s(45)],
        [s(1350), s(75)],
        [s(1550), s(55)],
        [s(1750), s(85)],
        [s(1900), s(60)],
        [s(2050), s(90)],
      ],
      COLORS.mountain.near,
      0.3
    );
  },
};

const groundRenderer: BackgroundRenderer = {
  draw(ctx, _time, w, h) {
    const groundY = h * 0.32;
    const gradient = ctx.createLinearGradient(0, groundY, 0, h);
    gradient.addColorStop(0, COLORS.ground.horizon);
    gradient.addColorStop(0.15, "#4a2e14");
    gradient.addColorStop(0.5, "#3a2010");
    gradient.addColorStop(1, COLORS.ground.bottom);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let x = 0; x <= w; x += 20) {
      const noise = Math.sin(x * 0.03) * 3 + Math.sin(x * 0.007) * 6;
      ctx.lineTo(x, groundY + noise);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
  },
};

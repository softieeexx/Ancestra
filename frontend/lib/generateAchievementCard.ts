import { Achievement } from "@/hooks/useAchievements";

// Card dimensions — 1200×675 (16:9, social-media optimal)
const CARD_W = 1200;
const CARD_H = 675;

interface CardData {
  achievement: Achievement;
  walletDisplay: string;
  swapCount: number;
  dateEarned: string;
}

// ── Igbo tier (Omume Ala) ──────────────────────────────────────────
function drawIgboCard(ctx: CanvasRenderingContext2D, data: CardData) {
  // Background — deep terracotta to dark earth
  const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  bg.addColorStop(0, "#1a0800");
  bg.addColorStop(0.5, "#2d0f00");
  bg.addColorStop(1, "#0d0500");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Igbo Uli body-art patterns — interlocking curved lines and spirals
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = "#E07020";
  ctx.lineWidth = 2;

  // Uli spiral motifs (large background)
  for (let cx = 0; cx < CARD_W + 120; cx += 120) {
    for (let cy = 0; cy < CARD_H + 120; cy += 120) {
      drawSpiral(ctx, cx, cy, 45, 3);
    }
  }
  ctx.restore();

  // Uli curved connecting lines (medium layer)
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = "#D4A853";
  ctx.lineWidth = 1.5;
  for (let x = 0; x < CARD_W; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.quadraticCurveTo(x + 30, CARD_H / 2, x, CARD_H);
    ctx.stroke();
  }
  ctx.restore();

  // Left accent bar — terracotta
  ctx.fillStyle = "#C05010";
  ctx.fillRect(0, 0, 6, CARD_H);

  // Top geometric Uli border — repeating diamond chain
  ctx.save();
  ctx.strokeStyle = "#E07020";
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.6;
  const bH = 28;
  ctx.fillStyle = "rgba(30, 8, 0, 0.8)";
  ctx.fillRect(0, 0, CARD_W, bH);
  ctx.fillRect(0, CARD_H - bH, CARD_W, bH);
  // Diamond chain
  for (let x = 20; x < CARD_W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, bH / 2);
    ctx.lineTo(x + 15, bH - 5);
    ctx.lineTo(x + 30, bH / 2);
    ctx.lineTo(x + 15, 5);
    ctx.closePath();
    ctx.stroke();
  }
  for (let x = 20; x < CARD_W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, CARD_H - bH / 2);
    ctx.lineTo(x + 15, CARD_H - bH + 5);
    ctx.lineTo(x + 30, CARD_H - bH / 2);
    ctx.lineTo(x + 15, CARD_H - 5);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();

  drawCardContent(ctx, data, "#E07020", "#F5C060", "#C05010");
}

// ── Yoruba tier (Ẹbọ) ────────────────────────────────────────────
function drawYorubaCard(ctx: CanvasRenderingContext2D, data: CardData) {
  // Background — deep indigo/midnight blue
  const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  bg.addColorStop(0, "#050818");
  bg.addColorStop(0.5, "#0a1030");
  bg.addColorStop(1, "#030510");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Yoruba Adire eleko — resist-dye geometric patterns in indigo/white
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.strokeStyle = "#7090E0";
  ctx.lineWidth = 1.5;
  // Adire grid — interlocking squares with cross-hatch fill
  const gridStep = 50;
  for (let gx = 0; gx < CARD_W + gridStep; gx += gridStep) {
    for (let gy = 0; gy < CARD_H + gridStep; gy += gridStep) {
      const offset = (Math.floor(gx / gridStep) + Math.floor(gy / gridStep)) % 2;
      if (offset === 0) {
        ctx.beginPath();
        ctx.rect(gx - 22, gy - 22, 44, 44);
        ctx.stroke();
        // cross inside
        ctx.beginPath();
        ctx.moveTo(gx - 15, gy - 15);
        ctx.lineTo(gx + 15, gy + 15);
        ctx.moveTo(gx + 15, gy - 15);
        ctx.lineTo(gx - 15, gy + 15);
        ctx.stroke();
      } else {
        // Circle in alternate cells
        ctx.beginPath();
        ctx.arc(gx, gy, 14, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
  ctx.restore();

  // Yoruba ORI symbol at center-right — concentric arcs
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.strokeStyle = "#D4A853";
  ctx.lineWidth = 2;
  for (let r = 40; r < 220; r += 30) {
    ctx.beginPath();
    ctx.arc(CARD_W * 0.82, CARD_H * 0.5, r, -Math.PI * 0.6, Math.PI * 0.6);
    ctx.stroke();
  }
  ctx.restore();

  // Left accent bar — deep blue with gold shimmer
  const barGrad = ctx.createLinearGradient(0, 0, 0, CARD_H);
  barGrad.addColorStop(0, "#1040C0");
  barGrad.addColorStop(0.5, "#D4A853");
  barGrad.addColorStop(1, "#1040C0");
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, 0, 6, CARD_H);

  // Top/bottom border — Adire meander
  ctx.save();
  ctx.fillStyle = "rgba(5, 8, 24, 0.85)";
  ctx.fillRect(0, 0, CARD_W, 28);
  ctx.fillRect(0, CARD_H - 28, CARD_W, 28);
  ctx.strokeStyle = "#4060B0";
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.7;
  // Meander/key pattern
  const step = 28;
  for (let x = 0; x < CARD_W; x += step * 2) {
    ctx.beginPath();
    ctx.moveTo(x, 5);
    ctx.lineTo(x + step * 0.5, 5);
    ctx.lineTo(x + step * 0.5, 22);
    ctx.lineTo(x + step * 1.5, 22);
    ctx.lineTo(x + step * 1.5, 5);
    ctx.lineTo(x + step * 2, 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, CARD_H - 5);
    ctx.lineTo(x + step * 0.5, CARD_H - 5);
    ctx.lineTo(x + step * 0.5, CARD_H - 22);
    ctx.lineTo(x + step * 1.5, CARD_H - 22);
    ctx.lineTo(x + step * 1.5, CARD_H - 5);
    ctx.lineTo(x + step * 2, CARD_H - 5);
    ctx.stroke();
  }
  ctx.restore();

  drawCardContent(ctx, data, "#4060C0", "#D4A853", "#1040C0");
}

// ── Hausa tier (Al'ada) ────────────────────────────────────────────
function drawHausaCard(ctx: CanvasRenderingContext2D, data: CardData) {
  // Background — deep emerald/forest
  const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  bg.addColorStop(0, "#010c08");
  bg.addColorStop(0.5, "#021a0e");
  bg.addColorStop(1, "#000a05");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Hausa embroidery patterns — interlocking 8-pointed stars (Kano star)
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.strokeStyle = "#20A060";
  ctx.lineWidth = 1.5;
  const starStep = 80;
  for (let sx = 40; sx < CARD_W + starStep; sx += starStep) {
    for (let sy = 40; sy < CARD_H + starStep; sy += starStep) {
      drawKanoStar(ctx, sx, sy, 28);
    }
  }
  ctx.restore();

  // Hausa palace architecture — arched window motifs
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = "#D4A853";
  ctx.lineWidth = 1.5;
  for (let ax = 80; ax < CARD_W; ax += 160) {
    ctx.beginPath();
    ctx.moveTo(ax - 20, CARD_H * 0.7);
    ctx.lineTo(ax - 20, CARD_H * 0.45);
    ctx.arc(ax, CARD_H * 0.45, 20, Math.PI, 0, false);
    ctx.lineTo(ax + 20, CARD_H * 0.7);
    ctx.stroke();
  }
  ctx.restore();

  // Left accent — deep green with gold
  const barGrad = ctx.createLinearGradient(0, 0, 0, CARD_H);
  barGrad.addColorStop(0, "#10A050");
  barGrad.addColorStop(0.5, "#D4A853");
  barGrad.addColorStop(1, "#10A050");
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, 0, 6, CARD_H);

  // Top/bottom border — Hausa plaited rope pattern
  ctx.save();
  ctx.fillStyle = "rgba(1, 12, 8, 0.85)";
  ctx.fillRect(0, 0, CARD_W, 28);
  ctx.fillRect(0, CARD_H - 28, CARD_W, 28);
  ctx.strokeStyle = "#20A060";
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.7;
  // Braided / plaited rope
  for (let x = 0; x < CARD_W; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, 14 + Math.sin((x / 20) * Math.PI) * 8);
    ctx.lineTo(x + 10, 14 + Math.sin(((x + 10) / 20) * Math.PI) * 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, 14 + Math.cos((x / 20) * Math.PI) * 8);
    ctx.lineTo(x + 10, 14 + Math.cos(((x + 10) / 20) * Math.PI) * 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, CARD_H - 14 + Math.sin((x / 20) * Math.PI) * 8);
    ctx.lineTo(x + 10, CARD_H - 14 + Math.sin(((x + 10) / 20) * Math.PI) * 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, CARD_H - 14 + Math.cos((x / 20) * Math.PI) * 8);
    ctx.lineTo(x + 10, CARD_H - 14 + Math.cos(((x + 10) / 20) * Math.PI) * 8);
    ctx.stroke();
  }
  ctx.restore();

  drawCardContent(ctx, data, "#20A060", "#D4A853", "#0A6030");
}

// ── Shared content layer ──────────────────────────────────────────
function drawCardContent(
  ctx: CanvasRenderingContext2D,
  data: CardData,
  accentColor: string,
  goldColor: string,
  darkAccent: string
) {
  const { achievement, walletDisplay, swapCount, dateEarned } = data;

  // Central card panel — semi-transparent backdrop
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath();
  roundRect(ctx, 60, 60, CARD_W - 120, CARD_H - 120, 16);
  ctx.fill();

  // Panel border
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  roundRect(ctx, 60, 60, CARD_W - 120, CARD_H - 120, 16);
  ctx.stroke();
  ctx.restore();

  // ANCESTRA branding — top left inside panel
  ctx.save();
  ctx.font = "bold 13px 'Georgia', serif";
  ctx.fillStyle = goldColor;
  ctx.globalAlpha = 0.9;
  ctx.letterSpacing = "0.15em";
  ctx.fillText("ANCESTRA", 90, 100);

  // Small "✦ RITUAL CHAIN" beside it
  ctx.font = "10px monospace";
  ctx.fillStyle = accentColor;
  ctx.globalAlpha = 0.7;
  ctx.fillText("✦ RITUAL CHAIN", 90, 118);
  ctx.restore();

  // Tier badge — top right
  ctx.save();
  ctx.fillStyle = darkAccent;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  roundRect(ctx, CARD_W - 220, 72, 148, 36, 8);
  ctx.fill();
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.6;
  ctx.stroke();
  ctx.font = "bold 11px monospace";
  ctx.fillStyle = goldColor;
  ctx.globalAlpha = 1;
  ctx.textAlign = "center";
  ctx.fillText(
    `TIER ${achievement.tier} · ${achievement.culture.toUpperCase()}`,
    CARD_W - 220 + 74,
    94
  );
  ctx.restore();

  // Main glyph / decorative diamond
  ctx.save();
  ctx.textAlign = "center";
  const glyphY = CARD_H * 0.42;
  ctx.font = "bold 72px 'Georgia', serif";
  ctx.fillStyle = accentColor;
  ctx.globalAlpha = 0.15;
  ctx.fillText("◈", CARD_W / 2, glyphY + 24);
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1;
  ctx.strokeText("◈", CARD_W / 2, glyphY + 24);
  ctx.restore();

  // Tier name — large centred headline
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "bold 64px 'Georgia', serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.globalAlpha = 0.95;
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 20;
  ctx.fillText(achievement.name, CARD_W / 2, CARD_H * 0.5);
  ctx.restore();

  // Culture & description subline
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "italic 18px 'Georgia', serif";
  ctx.fillStyle = goldColor;
  ctx.globalAlpha = 0.8;
  ctx.fillText(achievement.description, CARD_W / 2, CARD_H * 0.5 + 36);
  ctx.restore();

  // Divider line
  ctx.save();
  const divY = CARD_H * 0.65;
  const divGrad = ctx.createLinearGradient(CARD_W * 0.2, divY, CARD_W * 0.8, divY);
  divGrad.addColorStop(0, "rgba(0,0,0,0)");
  divGrad.addColorStop(0.3, accentColor);
  divGrad.addColorStop(0.7, goldColor);
  divGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(CARD_W * 0.2, divY);
  ctx.lineTo(CARD_W * 0.8, divY);
  ctx.stroke();
  ctx.restore();

  // Bottom meta row — wallet | transactions | date
  const metaY = CARD_H * 0.77;
  const col1 = CARD_W * 0.22;
  const col2 = CARD_W * 0.5;
  const col3 = CARD_W * 0.78;

  // Labels
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "9px monospace";
  ctx.fillStyle = accentColor;
  ctx.globalAlpha = 0.7;
  ctx.letterSpacing = "0.15em";
  ctx.fillText("WALLET", col1, metaY);
  ctx.fillText("SWAPS COMPLETED", col2, metaY);
  ctx.fillText("DATE EARNED", col3, metaY);
  ctx.restore();

  // Values
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "bold 16px 'Georgia', serif";
  ctx.fillStyle = "#EEEEEF";
  ctx.globalAlpha = 0.95;
  ctx.fillText(truncateWallet(walletDisplay), col1, metaY + 22);
  ctx.fillText(String(swapCount), col2, metaY + 22);
  ctx.fillText(dateEarned, col3, metaY + 22);
  ctx.restore();

  // Bottom RITUAL branding strip
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "10px monospace";
  ctx.fillStyle = goldColor;
  ctx.globalAlpha = 0.5;
  ctx.fillText(
    "◈  POWERED BY RITUAL CHAIN  ◈  ANCESTRA DEX  ◈",
    CARD_W / 2,
    CARD_H - 40
  );
  ctx.restore();
}

// ── Helper: Igbo spiral ────────────────────────────────────────────
function drawSpiral(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  maxR: number,
  turns: number
) {
  ctx.beginPath();
  const steps = 60 * turns;
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2 * turns;
    const r = (i / steps) * maxR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
}

// ── Helper: Hausa 8-pointed (Kano) star ──────────────────────────
function drawKanoStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number
) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const outer = (i * Math.PI * 2) / 8 - Math.PI / 8;
    const inner = outer + Math.PI / 8;
    const innerR = r * 0.4;
    ctx.lineTo(cx + Math.cos(outer) * r, cy + Math.sin(outer) * r);
    ctx.lineTo(cx + Math.cos(inner) * innerR, cy + Math.sin(inner) * innerR);
  }
  ctx.closePath();
  ctx.stroke();
}

// ── Helper: rounded rect ──────────────────────────────────────────
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function truncateWallet(addr: string): string {
  if (addr.length > 16) return addr.slice(0, 6) + "..." + addr.slice(-4);
  return addr;
}

// ── Public API ────────────────────────────────────────────────────
export function generateAchievementCard(cardData: CardData): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = CARD_W;
    canvas.height = CARD_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas context unavailable"));
      return;
    }

    const id = cardData.achievement.id;
    if (id === "omume-ala") drawIgboCard(ctx, cardData);
    else if (id === "ebo") drawYorubaCard(ctx, cardData);
    else if (id === "alada") drawHausaCard(ctx, cardData);
    else {
      reject(new Error("Unknown achievement id: " + id));
      return;
    }

    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to generate card blob"));
      },
      "image/png",
      1.0
    );
  });
}

export function downloadCard(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

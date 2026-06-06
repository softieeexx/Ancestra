"use client";

import Image from "next/image";
import { ConnectKitButton } from "connectkit";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useState, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Animation canvas
   Renders on a single <canvas> sitting above the background stack:
     • 12 birds  – dark silhouettes with natural flapping flight paths
     • teal crystal sparks – rise from the crystal spire (center-right)
     • warm embers         – drift up from the village (left foreground)
     • craft light streak  – occasional fast horizontal streak in the sky
───────────────────────────────────────────────────────────────────────────── */

function AnimationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const fit = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    fit();
    window.addEventListener("resize", fit);

    const W = () => canvas.width;
    const H = () => canvas.height;

    /* ── Birds ──────────────────────────────────────────────────────── */
    interface Bird {
      x: number; y: number; baseY: number;
      speed: number; size: number;
      wingPhase: number; wingSpeed: number;
      opacity: number; dir: 1 | -1;
      waveAmp: number; waveSeed: number;
    }

    const mkBird = (scatter = false): Bird => {
      const dir: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
      return {
        x:         scatter ? Math.random() * W() : (dir === 1 ? -70 : W() + 70),
        y:         0,
        baseY:     H() * (0.05 + Math.random() * 0.30),
        speed:     (0.20 + Math.random() * 0.58) * dir,
        size:      3 + Math.random() * 9.5,
        wingPhase: Math.random() * Math.PI * 2,
        wingSpeed: 0.030 + Math.random() * 0.044,
        opacity:   0.48 + Math.random() * 0.38,
        dir,
        waveAmp:   5 + Math.random() * 15,
        waveSeed:  Math.random() * Math.PI * 2,
      };
    };

    const birds: Bird[] = Array.from({ length: 12 }, () => mkBird(true));

    const drawBird = (b: Bird) => {
      const s   = b.size;
      const dip = Math.sin(b.wingPhase) * s * 0.68;

      ctx.save();
      ctx.translate(b.x, b.y);
      if (b.dir === -1) ctx.scale(-1, 1);
      ctx.globalAlpha = b.opacity;
      ctx.shadowBlur  = 2;
      ctx.shadowColor = "rgba(0,0,0,0.28)";
      ctx.strokeStyle = "rgba(16, 9, 3, 0.90)";
      ctx.lineWidth   = Math.max(1, s * 0.38);
      ctx.lineCap     = "round";

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-s * 0.62, dip, -s * 1.54, dip * 0.32);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(s * 0.62, dip, s * 1.54, dip * 0.32);
      ctx.stroke();

      ctx.restore();
    };

    /* ── Particles ──────────────────────────────────────────────────── */
    interface Particle {
      x: number; y: number; vx: number; vy: number;
      size: number; life: number; maxLife: number;
      r: number; g: number; b: number;
      gr: number; gg: number; gb: number;
    }

    const crystals: Particle[] = [];
    const embers:   Particle[] = [];

    // Crystal sparks rise from the teal spire (≈ 56–70 % x, 20–52 % y)
    const mkCrystal = (): Particle => ({
      x: W() * (0.54 + Math.random() * 0.17),
      y: H() * (0.20 + Math.random() * 0.32),
      vx: (Math.random() - 0.5) * 0.38,
      vy: -(0.26 + Math.random() * 0.50),
      size: 1.1 + Math.random() * 2.4,
      life: 0, maxLife: 105 + Math.random() * 165,
      r: 0, g: 215, b: 205, gr: 0, gg: 228, gb: 218,
    });

    // Embers drift up from the village (≈ 14–42 % x, 52–82 % y)
    const mkEmber = (): Particle => ({
      x: W() * (0.14 + Math.random() * 0.28),
      y: H() * (0.54 + Math.random() * 0.28),
      vx: (Math.random() - 0.5) * 0.44,
      vy: -(0.20 + Math.random() * 0.40),
      size: 0.9 + Math.random() * 1.9,
      life: 0, maxLife: 88 + Math.random() * 145,
      r: 255, g: 165, b: 48, gr: 255, gg: 135, gb: 25,
    });

    // Pre-scatter initial particles so the scene isn't empty on load
    for (let i = 0; i < 16; i++) { const p = mkCrystal(); p.life = Math.random() * p.maxLife; crystals.push(p); }
    for (let i = 0; i < 10; i++) { const p = mkEmber();   p.life = Math.random() * p.maxLife; embers.push(p); }

    const drawParticle = (p: Particle) => {
      const t  = p.life / p.maxLife;
      const fa = (t < 0.15 ? t / 0.15 : t > 0.78 ? 1 - (t - 0.78) / 0.22 : 1) * 0.76;
      ctx.save();
      ctx.globalAlpha = fa;
      ctx.shadowBlur  = 7;
      ctx.shadowColor = `rgba(${p.gr},${p.gg},${p.gb},0.85)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},1)`;
      ctx.fill();
      ctx.restore();
    };

    /* ── Craft streak ───────────────────────────────────────────────── */
    interface Streak { x: number; y: number; speed: number; len: number; alpha: number; active: boolean; }
    const streak: Streak = { x: -300, y: 0, speed: 0, len: 0, alpha: 0, active: false };

    /* ── Main loop ──────────────────────────────────────────────────── */
    let frame = 0;
    let raf:   number;

    const loop = () => {
      ctx.clearRect(0, 0, W(), H());
      frame++;

      // Spawn new particles
      if (frame % 9  === 0 && crystals.length < 24) crystals.push(mkCrystal());
      if (frame % 14 === 0 && embers.length   < 14) embers.push(mkEmber());

      // Trigger streak (~every 12 s at 60 fps)
      if (frame % 720 === 0 && !streak.active && Math.random() > 0.2) {
        streak.x      = -280;
        streak.y      = H() * (0.04 + Math.random() * 0.18);
        streak.speed  = 5.5 + Math.random() * 9;
        streak.len    = 140 + Math.random() * 130;
        streak.alpha  = 0.40 + Math.random() * 0.38;
        streak.active = true;
      }

      // Draw streak
      if (streak.active) {
        streak.x += streak.speed;
        const g = ctx.createLinearGradient(streak.x - streak.len, streak.y, streak.x + 24, streak.y);
        g.addColorStop(0,    "rgba(195,218,255,0)");
        g.addColorStop(0.72, `rgba(195,218,255,${streak.alpha})`);
        g.addColorStop(1,    "rgba(195,218,255,0)");
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(streak.x - streak.len, streak.y);
        ctx.lineTo(streak.x + 24, streak.y);
        ctx.strokeStyle = g;
        ctx.lineWidth   = 1.3;
        ctx.stroke();
        // Bright head
        ctx.beginPath();
        ctx.arc(streak.x, streak.y, 2, 0, Math.PI * 2);
        ctx.fillStyle   = `rgba(210,230,255,${streak.alpha})`;
        ctx.shadowBlur  = 12;
        ctx.shadowColor = "rgba(180,210,255,0.9)";
        ctx.fill();
        ctx.restore();
        if (streak.x > W() + 280) streak.active = false;
      }

      // Crystal particles
      for (let i = crystals.length - 1; i >= 0; i--) {
        const p = crystals[i];
        p.life++;
        p.x += p.vx + Math.sin(p.life * 0.054) * 0.18;
        p.y += p.vy;
        if (p.life >= p.maxLife) { crystals.splice(i, 1); continue; }
        drawParticle(p);
      }

      // Ember particles
      for (let i = embers.length - 1; i >= 0; i--) {
        const p = embers[i];
        p.life++;
        p.x += p.vx + Math.sin(p.life * 0.042) * 0.26;
        p.y += p.vy;
        if (p.life >= p.maxLife) { embers.splice(i, 1); continue; }
        drawParticle(p);
      }

      // Birds (drawn last so they render above particles)
      for (const b of birds) {
        b.wingPhase += b.wingSpeed;
        b.waveSeed  += 0.0058;
        b.x         += b.speed;
        b.y          = b.baseY + Math.sin(b.waveSeed) * b.waveAmp;

        if (b.dir ===  1 && b.x > W() + 80) { b.x = -80; b.baseY = H() * (0.05 + Math.random() * 0.30); }
        if (b.dir === -1 && b.x < -80)       { b.x = W() + 80; b.baseY = H() * (0.05 + Math.random() * 0.30); }

        drawBird(b);
      }

      raf = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 5, width: "100%", height: "100%" }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Small reusable UI pieces
───────────────────────────────────────────────────────────────────────────── */

function LogoIcon() {
  return (
    <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 relative" style={{ background: "#1a6b3a" }}>
      <Image src="/logo.jpeg" alt="Ancestra" fill className="object-cover" priority />
    </div>
  );
}

function DiamondIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="10" y="1.5" width="12" height="12" rx="0.8" transform="rotate(45 10 1.5)" stroke="#c9a84c" strokeWidth="1.3" />
      <rect x="10" y="5.2" width="5.6" height="5.6" rx="0.4" transform="rotate(45 10 5.2)" stroke="#c9a84c" strokeWidth="0.85" />
    </svg>
  );
}

function ConnectWalletButton() {
  const router = useRouter();
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, address }) => (
        <button
          onClick={() => { isConnected ? router.push("/swap") : show?.(); }}
          className="connect-btn font-rajdhani font-semibold uppercase"
          style={{
            border: "1px solid rgba(201,168,76,0.7)",
            color: "#c9a84c",
            background: "rgba(0,0,0,0.22)",
            padding: "14px 52px",
            fontSize: "0.8rem",
            letterSpacing: "0.28em",
            cursor: "pointer",
            minWidth: "220px",
          }}
        >
          {isConnected ? `${address?.slice(0, 6)}…${address?.slice(-4)}` : "Connect Wallet"}
        </button>
      )}
    </ConnectKitButton.Custom>
  );
}

function EnterButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/swap")}
      className="font-rajdhani font-semibold uppercase transition-all duration-200"
      style={{
        border: "1px solid rgba(201,168,76,0.3)",
        color: "rgba(201,168,76,0.55)",
        background: "transparent",
        padding: "10px 44px",
        fontSize: "0.68rem",
        letterSpacing: "0.34em",
        cursor: "pointer",
        minWidth: "180px",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "rgba(201,168,76,0.7)";
        e.currentTarget.style.color = "#c9a84c";
        e.currentTarget.style.background = "rgba(201,168,76,0.06)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)";
        e.currentTarget.style.color = "rgba(201,168,76,0.55)";
        e.currentTarget.style.background = "transparent";
      }}
    >
      Enter App
    </button>
  );
}

const FEATURES = [
  { title: "RITUAL-CENTRIC",   desc: "All pools are RITUAL pairs" },
  { title: "ANCESTRAL DESIGN", desc: "Rooted in culture, built for the future" },
  { title: "COMMUNITY DRIVEN", desc: "By the people, for the people" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────────────────── */

export default function HomePage() {
  // Subtle mouse parallax on the background image
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const handleMouse = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setParallax({
      x: ((e.clientX - r.left) / r.width  - 0.5) * -10,
      y: ((e.clientY - r.top)  / r.height - 0.5) * -6,
    });
  }, []);

  return (
    <div
      className="hero-grain relative w-full min-h-screen flex flex-col overflow-x-hidden"
      style={{ background: "#090810" }}
      onMouseMove={handleMouse}
    >

      {/* ── 0: Background image ─────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <Image
          src="/landing-bg.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
          style={{
            transform: `translate(${parallax.x}px, ${parallax.y}px) scale(1.06)`,
            transition: "transform 0.55s ease-out",
            willChange: "transform",
          }}
        />
      </div>

      {/* ── 1: Crystal spire ambient glow (pulsing) ─────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none crystal-pulse-overlay"
        style={{
          zIndex: 1,
          background:
            "radial-gradient(ellipse 26% 54% at 63% 30%, rgba(0,200,192,0.18) 0%, rgba(0,165,158,0.08) 42%, transparent 70%)",
        }}
      />

      {/* ── 2: Atmospheric warm glow (complements the amber sky) ─────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "radial-gradient(ellipse 55% 38% at 78% 12%, rgba(255,180,60,0.07) 0%, transparent 65%)",
        }}
      />

      {/* ── 3: Center dark overlay (text readability) ───────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background:
            "radial-gradient(ellipse 80% 70% at 50% 48%, rgba(9,8,16,0.72) 0%, rgba(9,8,16,0.52) 55%, rgba(9,8,16,0.18) 85%, transparent 100%)",
        }}
      />

      {/* ── 4: Top vignette ─────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 2, background: "linear-gradient(180deg, rgba(9,8,16,0.55) 0%, transparent 20%)" }}
      />

      {/* ── 5: Bottom vignette ──────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 2, background: "linear-gradient(0deg, rgba(9,8,16,0.92) 0%, transparent 28%)" }}
      />

      {/* ── 6: Mist drift (at mountain base, right side) ────────────── */}
      <div
        className="absolute pointer-events-none mist-layer"
        style={{
          zIndex: 3,
          bottom: "28%",
          left:   "28%",
          right:  "0",
          height: "20%",
          background: "linear-gradient(90deg, transparent, rgba(210,225,235,0.04) 40%, rgba(210,225,235,0.06) 65%, transparent)",
        }}
      />

      {/* ── 7: Animation canvas ─────────────────────────────────────── */}
      <AnimationCanvas />

      {/* ── 8: UI ───────────────────────────────────────────────────── */}
      <div className="relative flex-1 flex flex-col" style={{ zIndex: 6 }}>

        {/* Navbar */}
        <nav
          className="flex items-center justify-between px-6 md:px-8 lg:px-12 py-5 flex-shrink-0"
          style={{ animation: "hero-fade-down 0.9s ease-out both" }}
        >
          <div className="flex items-center gap-3">
            <LogoIcon />
            <span className="font-cinzel text-white font-semibold tracking-[0.22em]" style={{ fontSize: "0.95rem" }}>
              ANCESTRA
            </span>
          </div>
        </nav>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-6">
          <div className="flex flex-col items-center text-center w-full" style={{ maxWidth: "560px" }}>

            <h1
              className="font-black text-white select-none"
              style={{
                fontFamily: '"Geom", "Cinzel", sans-serif',
                fontSize: "clamp(2.6rem, 12vw, 10rem)",
                lineHeight: 0.88,
                letterSpacing: "0.08em",
                marginBottom: "1.6rem",
                textShadow: "0 0 60px rgba(0,0,0,1), 0 4px 32px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.9)",
                animation: "hero-fade-up 1.1s 0.20s ease-out both",
              }}
            >
              ANCESTRA
            </h1>

            <p
              className="font-rajdhani font-bold mb-5 tracking-[0.22em] md:tracking-[0.48em]"
              style={{
                color: "#e0bb6a",
                fontSize: "0.78rem",
                textShadow: "0 1px 12px rgba(0,0,0,0.9)",
                animation: "hero-fade-up 1.1s 0.44s ease-out both",
              }}
            >
              ANCESTRAL.&nbsp;&nbsp;RITUAL-CENTRIC.
            </p>

            <p
              className="mb-9 leading-relaxed max-w-sm"
              style={{
                color: "#e8e8e8",
                fontSize: "1.08rem",
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                textShadow: "0 1px 16px rgba(0,0,0,0.95)",
                animation: "hero-fade-up 1.1s 0.65s ease-out both",
              }}
            >
              Trade RITUAL against the world through ancestral liquidity.
            </p>

            <div style={{ animation: "hero-fade-up 1.1s 0.86s ease-out both" }}>
              <ConnectWalletButton />
            </div>

            <div
              className="mt-3"
              style={{ animation: "hero-fade-up 1.1s 0.98s ease-out both" }}
            >
              <EnterButton />
            </div>

            <div
              className="flex items-center gap-3 mt-6"
              style={{ animation: "hero-fade-up 1.1s 1.05s ease-out both" }}
            >
              <span className="dot-pulse w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#3ddc84" }} />
              <span
                className="font-rajdhani font-medium tracking-[0.3em]"
                style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.7rem" }}
              >
                BUILT ON RITUAL TESTNET
              </span>
            </div>

          </div>
        </main>

        {/* Feature bar */}
        <div className="flex-shrink-0">
          <div style={{ height: "1px", background: "linear-gradient(90deg, rgba(201,168,76,0.65) 0%, rgba(201,168,76,0.4) 50%, rgba(201,168,76,0.1) 100%)" }} />
          <div
            className="grid grid-cols-1 md:grid-cols-3"
            style={{ background: "rgba(9,8,16,0.92)", backdropFilter: "blur(18px)" }}
          >
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`flex items-start gap-3.5 px-8 py-6 ${i < FEATURES.length - 1 ? "border-b md:border-b-0 md:border-r" : ""}`}
                style={{
                  borderColor: "rgba(201,168,76,0.15)",
                  animation: `hero-fade-up 0.9s ${1.20 + i * 0.12}s ease-out both`,
                }}
              >
                <div className="flex-shrink-0 mt-0.5"><DiamondIcon /></div>
                <div>
                  <p
                    className="font-rajdhani font-bold mb-1"
                    style={{ color: "rgba(255,255,255,0.88)", fontSize: "0.72rem", letterSpacing: "0.2em" }}
                  >
                    {f.title}
                  </p>
                  <p style={{ color: "rgba(204,204,204,0.45)", fontSize: "0.72rem", fontFamily: "Inter, sans-serif", fontWeight: 300, lineHeight: 1.5 }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

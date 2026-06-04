"use client";

import Link from "next/link";
import { ConnectKitButton } from "connectkit";
import { useRouter } from "next/navigation";

/* ── Reusable pieces ────────────────────────────────────── */

function DiamondIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="10" y="1.5" width="12" height="12" rx="0.8" transform="rotate(45 10 1.5)" stroke="#c9a84c" strokeWidth="1.3" />
      <rect x="10" y="5.2" width="5.6" height="5.6" rx="0.4" transform="rotate(45 10 5.2)" stroke="#c9a84c" strokeWidth="0.85" />
    </svg>
  );
}

function KenteLogoIcon() {
  return (
    <div
      className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{ background: "#1d7a3e" }}
    >
      <svg viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
        <rect x="13" y="1" width="8" height="8" rx="0.5" transform="rotate(45 13 1)" fill="white" opacity="0.9"/>
        <rect x="13" y="4.5" width="4.5" height="4.5" rx="0.3" transform="rotate(45 13 4.5)" fill="#1d7a3e"/>
        <rect x="4"  y="9" width="8" height="8" rx="0.5" transform="rotate(45 4 9)"  fill="white" opacity="0.9"/>
        <rect x="22" y="9" width="8" height="8" rx="0.5" transform="rotate(45 22 9)" fill="white" opacity="0.9"/>
        <rect x="4"  y="12.5" width="4.5" height="4.5" rx="0.3" transform="rotate(45 4 12.5)"  fill="#1d7a3e"/>
        <rect x="22" y="12.5" width="4.5" height="4.5" rx="0.3" transform="rotate(45 22 12.5)" fill="#1d7a3e"/>
        <rect x="13" y="17" width="8" height="8" rx="0.5" transform="rotate(45 13 17)" fill="white" opacity="0.9"/>
        <rect x="13" y="20.5" width="4.5" height="4.5" rx="0.3" transform="rotate(45 13 20.5)" fill="#1d7a3e"/>
        <rect x="8" y="9" width="10" height="10" rx="0.5" transform="rotate(45 8 9)" fill="white" opacity="0.85"/>
        <rect x="8" y="12.5" width="3" height="3" rx="0.2" transform="rotate(45 8 12.5)" fill="#1d7a3e"/>
        <rect x="18" y="9" width="10" height="10" rx="0.5" transform="rotate(45 18 9)" fill="white" opacity="0.85"/>
        <rect x="18" y="12.5" width="3" height="3" rx="0.2" transform="rotate(45 18 12.5)" fill="#1d7a3e"/>
      </svg>
    </div>
  );
}

function ConnectWalletButton() {
  const router = useRouter();
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, address }) => (
        <button
          onClick={() => { isConnected ? router.push("/swap") : show?.(); }}
          className="connect-btn font-rajdhani font-bold uppercase"
          style={{
            display: "inline-block",
            border: "1px solid rgba(201,168,76,0.65)",
            color: "#c9a84c",
            background: "rgba(0,0,0,0.22)",
            padding: "16px 56px",
            fontSize: "0.78rem",
            letterSpacing: "0.32em",
            cursor: "pointer",
            minWidth: "230px",
            textAlign: "center",
          }}
        >
          {isConnected ? `${address?.slice(0, 6)}…${address?.slice(-4)}` : "Connect Wallet"}
        </button>
      )}
    </ConnectKitButton.Custom>
  );
}

const FEATURES = [
  { title: "RITUAL-CENTRIC",   desc: "All pools are RITUAL pairs" },
  { title: "ANCESTRAL DESIGN", desc: "Rooted in culture, built for the future" },
  { title: "COMMUNITY DRIVEN", desc: "By the people, for the people" },
];

/* ── Page ───────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="hero-grain relative w-full h-screen overflow-hidden" style={{ background: "#0a0a0e" }}>

      {/* 1 — Atmospheric CSS background */}
      <div className="absolute inset-0" style={{ zIndex: 0, background: `
        radial-gradient(ellipse 30% 60% at 70% 43%, rgba(0,215,185,0.20) 0%, rgba(0,175,155,0.09) 38%, transparent 66%),
        radial-gradient(ellipse 18% 30% at 91% 50%, rgba(0,200,175,0.24) 0%, rgba(0,160,145,0.10) 45%, transparent 70%),
        radial-gradient(ellipse 62% 50% at 68% 30%, rgba(158,78,10,0.56) 0%, rgba(112,52,8,0.28) 42%, transparent 72%),
        radial-gradient(ellipse 28% 22% at 74% 14%, rgba(200,96,12,0.46) 0%, transparent 56%),
        radial-gradient(ellipse 40% 58% at 88% 52%, rgba(88,42,7,0.50) 0%, transparent 66%),
        radial-gradient(ellipse 55% 42% at 18% 10%, rgba(10,5,25,0.74) 0%, transparent 62%),
        radial-gradient(ellipse 90% 28% at 55% 56%, rgba(16,9,3,0.60) 0%, transparent 62%),
        linear-gradient(0deg, rgba(4,3,1,0.97) 0%, rgba(5,4,2,0.78) 16%, transparent 36%),
        linear-gradient(140deg, #020109 0%, #07050e 12%, #0e0a0a 30%, #0d0806 48%, #0a0604 65%, #070502 82%, #060402 100%)
      `}} />

      {/* 2 — SVG scene: spires, mountains, village */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
        <svg
          viewBox="0 0 1920 860"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMax slice"
          style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "80%" }}
        >
          <defs>
            <radialGradient id="teal1" cx="68%" cy="42%" r="18%">
              <stop offset="0%"   stopColor="rgba(0,210,185,0.28)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
            <radialGradient id="teal2" cx="90%" cy="50%" r="12%">
              <stop offset="0%"   stopColor="rgba(0,195,170,0.32)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>

          {/* Far mountains */}
          <polygon
            points="580,540 640,430 700,490 760,380 820,460 880,340 940,420 1000,300 1060,390 1120,280 1180,370 1240,260 1300,360 1360,280 1420,380 1480,300 1540,400 1600,320 1660,440 1720,360 1780,480 1840,400 1920,520 1920,860 580,860"
            fill="rgba(55,28,8,0.55)"
          />

          {/* Crystal spire — central tower */}
          <polygon points="940,860 940,280 952,260 960,100 968,260 980,860" fill="rgba(18,10,4,0.85)" />
          <polygon points="920,420 980,420 972,440 928,440" fill="rgba(14,8,3,0.9)" />
          <polygon points="925,350 975,350 970,368 930,368" fill="rgba(14,8,3,0.9)" />
          <polygon points="930,290 970,290 966,306 934,306" fill="rgba(14,8,3,0.9)" />

          {/* Secondary spires */}
          <polygon points="870,860 870,380 878,360 884,240 890,360 898,860" fill="rgba(16,9,3,0.80)" />
          <polygon points="1010,860 1010,420 1018,395 1024,290 1030,395 1038,860" fill="rgba(16,9,3,0.80)" />
          <polygon points="800,860 800,480 807,460 812,360 817,460 824,860" fill="rgba(14,8,3,0.72)" />
          <polygon points="1080,860 1080,500 1087,480 1092,380 1097,480 1104,860" fill="rgba(14,8,3,0.72)" />
          <polygon points="1160,860 1160,530 1165,510 1170,430 1175,510 1180,860" fill="rgba(12,7,2,0.65)" />
          <polygon points="730,860 730,550 736,530 740,450 744,530 750,860" fill="rgba(12,7,2,0.62)" />

          {/* Mid-ground hills */}
          <path d="M0,860 L0,600 Q100,550 200,580 Q350,520 500,560 Q650,500 750,540 Q850,580 860,860 Z" fill="rgba(22,12,4,0.78)" />
          <path d="M1060,860 Q1100,600 1200,580 Q1350,560 1500,590 Q1650,560 1750,600 Q1850,580 1920,620 L1920,860 Z" fill="rgba(22,12,4,0.78)" />

          {/* Teal glow overlays */}
          <ellipse cx="960" cy="370" rx="80" ry="200" fill="url(#teal1)" opacity="0.9" />
          <ellipse cx="1740" cy="440" rx="60" ry="120" fill="url(#teal2)" opacity="0.8" />

          {/* Fog layers */}
          <path d="M0,680 Q200,640 400,660 Q600,640 800,660 Q1000,640 1200,660 Q1400,640 1600,658 Q1750,640 1920,660 L1920,730 Q1700,710 1500,724 Q1300,710 1100,724 Q900,710 700,724 Q500,710 300,724 Q150,710 0,730 Z" fill="rgba(8,5,2,0.48)" />
          <path d="M0,720 Q300,695 600,710 Q900,695 1200,710 Q1500,695 1920,710 L1920,760 Q1600,745 1200,758 Q800,745 400,758 Q200,745 0,760 Z" fill="rgba(6,4,1,0.55)" />

          {/* Acacia trees */}
          <g fill="rgba(8,5,2,0.88)">
            <rect x="68" y="630" width="8" height="120" />
            <ellipse cx="72" cy="620" rx="42" ry="22" />
            <rect x="248" y="650" width="7" height="100" />
            <ellipse cx="251" cy="640" rx="36" ry="18" />
            <rect x="1640" y="645" width="8" height="105" />
            <ellipse cx="1644" cy="634" rx="40" ry="20" />
            <rect x="1800" y="655" width="7" height="95" />
            <ellipse cx="1803" cy="645" rx="34" ry="17" />
          </g>

          {/* Round huts */}
          <g fill="rgba(10,6,2,0.82)">
            <ellipse cx="160" cy="790" rx="68" ry="28" /><polygon points="92,790 228,790 160,730" />
            <ellipse cx="320" cy="800" rx="56" ry="24" /><polygon points="264,800 376,800 320,746" />
            <ellipse cx="460" cy="795" rx="62" ry="26" /><polygon points="398,795 522,795 460,737" />
            <ellipse cx="1460" cy="800" rx="58" ry="24" /><polygon points="1402,800 1518,800 1460,746" />
            <ellipse cx="1600" cy="795" rx="64" ry="26" /><polygon points="1536,795 1664,795 1600,737" />
            <ellipse cx="1750" cy="802" rx="52" ry="22" /><polygon points="1698,802 1802,802 1750,750" />
          </g>

          {/* Walking silhouettes */}
          <g fill="rgba(6,3,1,0.85)">
            <ellipse cx="610" cy="770" rx="7" ry="9" />
            <rect x="605" y="778" width="10" height="30" rx="2" />
            <line x1="605" y1="795" x2="598" y2="818" stroke="rgba(6,3,1,0.85)" strokeWidth="4" strokeLinecap="round" />
            <line x1="615" y1="795" x2="620" y2="818" stroke="rgba(6,3,1,0.85)" strokeWidth="4" strokeLinecap="round" />

            <ellipse cx="680" cy="765" rx="8" ry="10" />
            <rect x="674" y="774" width="12" height="34" rx="2" />
            <line x1="674" y1="794" x2="666" y2="820" stroke="rgba(6,3,1,0.85)" strokeWidth="5" strokeLinecap="round" />
            <line x1="686" y1="794" x2="692" y2="820" stroke="rgba(6,3,1,0.85)" strokeWidth="5" strokeLinecap="round" />

            <ellipse cx="755" cy="772" rx="7" ry="8" />
            <rect x="749" y="779" width="10" height="28" rx="2" />
            <line x1="749" y1="796" x2="743" y2="816" stroke="rgba(6,3,1,0.85)" strokeWidth="4" strokeLinecap="round" />
            <line x1="759" y1="796" x2="764" y2="816" stroke="rgba(6,3,1,0.85)" strokeWidth="4" strokeLinecap="round" />

            <ellipse cx="830" cy="768" rx="7" ry="9" />
            <rect x="824" y="777" width="10" height="30" rx="2" />
            <rect x="820" y="757" width="18" height="8" rx="1" />
            <line x1="824" y1="795" x2="818" y2="818" stroke="rgba(6,3,1,0.85)" strokeWidth="4" strokeLinecap="round" />
            <line x1="834" y1="795" x2="839" y2="818" stroke="rgba(6,3,1,0.85)" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* Ground base */}
          <rect x="0" y="818" width="1920" height="42" fill="rgba(4,3,1,0.96)" />
        </svg>
      </div>

      {/* 3 — Left readability gradient */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2, background: "linear-gradient(105deg, rgba(8,5,14,0.97) 0%, rgba(8,5,14,0.90) 22%, rgba(8,5,14,0.62) 44%, rgba(8,5,14,0.18) 64%, transparent 82%)" }} />

      {/* 4 — Top vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2, background: "linear-gradient(180deg, rgba(6,4,12,0.72) 0%, transparent 18%)" }} />

      {/* 5 — UI */}
      <div className="relative flex flex-col h-full" style={{ zIndex: 4 }}>

        {/* Navbar */}
        <nav className="flex items-center justify-between px-12 py-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <KenteLogoIcon />
            <span className="font-rajdhani font-bold uppercase text-white" style={{ fontSize: "1.05rem", letterSpacing: "0.28em" }}>
              Ancestra
            </span>
          </div>

          <Link
            href="/admin"
            className="flex items-center gap-2 px-5 py-2 rounded-full font-rajdhani font-semibold uppercase transition-colors hover:bg-white/5"
            style={{ border: "1px solid rgba(201,168,76,0.45)", color: "#c9a84c", fontSize: "0.72rem", letterSpacing: "0.18em" }}
          >
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden>
              <rect x="0.6" y="0.6" width="4.2" height="4.2" rx="0.5" stroke="currentColor" strokeWidth="1" />
              <rect x="7.2" y="0.6" width="4.2" height="4.2" rx="0.5" stroke="currentColor" strokeWidth="1" />
              <rect x="0.6" y="7.2" width="4.2" height="4.2" rx="0.5" stroke="currentColor" strokeWidth="1" />
              <rect x="7.2" y="7.2" width="4.2" height="4.2" rx="0.5" stroke="currentColor" strokeWidth="1" />
            </svg>
            Docs
          </Link>
        </nav>

        {/* Hero */}
        <main className="flex-1 flex items-center px-16 pb-8">
          <div style={{ maxWidth: "520px" }}>
            <h1
              className="text-white select-none"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 700,
                fontSize: "clamp(4rem, 11.8vw, 10rem)",
                lineHeight: 0.88,
                letterSpacing: "0.01em",
                marginBottom: "24px",
                textShadow: "0 2px 80px rgba(0,0,0,0.95), 0 0 120px rgba(0,0,0,0.7)",
              }}
            >
              ANCESTRA
            </h1>

            <p
              className="font-rajdhani font-semibold uppercase mb-5"
              style={{ color: "#c9a84c", fontSize: "0.72rem", letterSpacing: "0.46em" }}
            >
              Ancestral.&nbsp;&nbsp;Ritual-Centric.
            </p>

            <p
              className="mb-9 leading-relaxed"
              style={{ color: "#cccccc", fontSize: "1.05rem", maxWidth: "375px", fontFamily: "Inter, sans-serif", fontWeight: 300 }}
            >
              Trade RITUAL against the world<br />through ancestral liquidity.
            </p>

            <ConnectWalletButton />

            <div className="flex items-center gap-2.5 mt-5">
              <span className="dot-pulse w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#3ddc84" }} />
              <span
                className="font-rajdhani font-medium uppercase"
                style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.69rem", letterSpacing: "0.32em" }}
              >
                Built on Ritual Testnet
              </span>
            </div>
          </div>
        </main>

        {/* Feature bar */}
        <div className="flex-shrink-0">
          <div style={{ height: "1px", background: "linear-gradient(90deg, rgba(201,168,76,0.65) 0%, rgba(201,168,76,0.38) 48%, rgba(201,168,76,0.08) 100%)" }} />
          <div className="grid grid-cols-3" style={{ background: "rgba(8,6,12,0.94)", backdropFilter: "blur(18px)" }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="flex items-start gap-3.5 px-8 py-5"
                style={{ borderRight: i < 2 ? "1px solid rgba(201,168,76,0.13)" : "none" }}
              >
                <div className="flex-shrink-0 mt-0.5"><DiamondIcon /></div>
                <div>
                  <p className="font-rajdhani font-bold mb-1" style={{ color: "rgba(255,255,255,0.88)", fontSize: "0.71rem", letterSpacing: "0.22em" }}>
                    {f.title}
                  </p>
                  <p style={{ color: "rgba(204,204,204,0.45)", fontSize: "0.71rem", fontFamily: "Inter, sans-serif", fontWeight: 300, lineHeight: 1.55 }}>
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

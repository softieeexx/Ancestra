export const COLORS = {
  sky: {
    top: "#1a0533",
    mid: "#c0693c",
    bottom: "#d4a853",
  },
  sun: {
    core: "#ffe066",
    glow: "rgba(255, 224, 102, 0)",
  },
  mountain: {
    far: "rgba(74, 44, 27, 0.3)",
    mid: "rgba(58, 31, 16, 0.5)",
    near: "rgba(42, 21, 8, 0.7)",
  },
  ground: {
    horizon: "#5c3a1e",
    bottom: "#0D0A03",
  },
  hut: {
    wall: "#8B6914",
    wallShadow: "#5C4510",
    roof: "#3A2B0A",
    roofHighlight: "#4a2c1b",
    roofDark: "#2a1508",
    doorway: "#0D0A03",
    interiorGlow: "rgba(212, 168, 83, 0.15)",
    patternLine: "rgba(212, 168, 83, 0.15)",
  },
  tree: {
    trunk: "#5C4510",
    acaciaLeaf: "#3a5a1e",
    acaciaLeafLight: "#4a7a2e",
    palmTrunk: "#6B4E1E",
    palmFrond: "#2d5a1e",
  },
  tech: {
    hologramBg: "rgba(74, 168, 255, 0.08)",
    hologramBorder: "rgba(212, 168, 83, 0.2)",
    hologramText: "rgba(212, 168, 83, 0.5)",
    hologramGrid: "rgba(212, 168, 83, 0.04)",
    markerGlow: "#D4A853",
    markerStone: "#3A2B0A",
    hexPattern: "rgba(212, 168, 83, 0.06)",
  },
  character: {
    body: "#1A1507",
    skin: "#5C3A1E",
  },
  grass: "#3a5a1e",
  cloud: "rgba(255, 255, 255, 0.2)",
} as const;

export const VIRTUAL_WIDTH = 1920;
export const VIRTUAL_HEIGHT = 1080;

export function vx(x: number, canvasW: number): number {
  return (x / VIRTUAL_WIDTH) * canvasW;
}

export function vy(y: number, canvasH: number): number {
  return (y / VIRTUAL_HEIGHT) * canvasH;
}

export function vscale(scale: number, canvasW: number): number {
  return scale * (canvasW / VIRTUAL_WIDTH);
}

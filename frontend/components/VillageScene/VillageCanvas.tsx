"use client";

import { useRef } from "react";
import { Scene } from "./animation/Scene";
import { useCanvasAnimation } from "./animation/useCanvasAnimation";
import { createBackgroundRenderers } from "./animation/entities/Backgrounds";
import { Cloud, Bird, Grass, RitualMarker } from "./animation/entities/Nature";
import { Tree } from "./animation/entities/Trees";
import { Hut } from "./animation/entities/Huts";
import { Villager } from "./animation/entities/Villagers";
import { HolographicDisplay, MarketStall } from "./animation/entities/Tech";

interface VillageCanvasProps {
  dimmed: boolean;
  isMobile: boolean;
}

export default function VillageCanvas({ dimmed, isMobile }: VillageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);

  useCanvasAnimation(canvasRef, sceneRef, dimmed, (scene) => {
    // Background layers
    for (const renderer of createBackgroundRenderers()) {
      scene.addBackgroundRenderer(renderer);
    }

    // Clouds
    scene.addEntity(new Cloud({ x: 200, y: 80, speed: 0.3, scale: 1.2 }));
    if (!isMobile) {
      scene.addEntity(new Cloud({ x: 600, y: 120, speed: 0.2, scale: 0.8 }));
      scene.addEntity(new Cloud({ x: 900, y: 60, speed: 0.15, scale: 1 }));
    }
    scene.addEntity(new Cloud({ x: 1400, y: 100, speed: 0.25, scale: 0.9 }));

    // Birds
    scene.addEntity(
      new Bird({
        x: 300,
        y: 150,
        centerX: 300,
        centerY: 150,
        radiusA: 80,
        radiusB: 40,
        speed: 0.5,
        scale: 1,
      })
    );
    if (!isMobile) {
      scene.addEntity(
        new Bird({
          x: 500,
          y: 120,
          centerX: 500,
          centerY: 120,
          radiusA: 100,
          radiusB: 50,
          speed: 0.4,
          scale: 0.8,
          phase: 1.5,
        })
      );
      scene.addEntity(
        new Bird({
          x: 250,
          y: 180,
          centerX: 250,
          centerY: 180,
          radiusA: 60,
          radiusB: 30,
          speed: 0.6,
          scale: 0.7,
          phase: 3,
        })
      );
    }

    // Back trees (acacias)
    scene.addEntity(new Tree({ x: 150, y: 580, treeType: "acacia", scale: 1.2 }));
    scene.addEntity(new Tree({ x: 350, y: 590, treeType: "acacia", scale: 1 }));
    if (!isMobile) {
      scene.addEntity(new Tree({ x: 550, y: 570, treeType: "acacia", scale: 0.9 }));
      scene.addEntity(new Tree({ x: 1300, y: 580, treeType: "acacia", scale: 1.1 }));
      scene.addEntity(new Tree({ x: 1500, y: 590, treeType: "acacia", scale: 0.8 }));
    }
    scene.addEntity(new Tree({ x: 1700, y: 580, treeType: "acacia", scale: 1 }));

    // Huts (main village)
    scene.addEntity(new Hut({ x: 400, y: 560, scale: 1.2 }));
    scene.addEntity(new Hut({ x: 550, y: 570, scale: 1 }));
    scene.addEntity(
      new Hut({ x: 700, y: 555, scale: 1.3, hasHexPattern: true })
    );
    if (!isMobile) {
      scene.addEntity(
        new Hut({ x: 880, y: 575, scale: 1, hasHexPattern: true })
      );
      scene.addEntity(new Hut({ x: 1050, y: 565, scale: 1.1 }));
    }
    scene.addEntity(new Hut({ x: 1400, y: 570, scale: 1 }));

    // Market stalls
    scene.addEntity(new MarketStall({ x: 900, y: 590, scale: 1.2 }));
    if (!isMobile) {
      scene.addEntity(new MarketStall({ x: 1050, y: 595, scale: 1 }));
    }

    // Holographic displays
    scene.addEntity(new HolographicDisplay({ x: 910, y: 470, scale: 1 }));
    if (!isMobile) {
      scene.addEntity(
        new HolographicDisplay({ x: 1060, y: 480, scale: 0.9 })
      );
    }

    // Ritual markers
    scene.addEntity(new RitualMarker({ x: 380, y: 560, scale: 1 }));
    if (!isMobile) {
      scene.addEntity(new RitualMarker({ x: 750, y: 540, scale: 1.1 }));
    }
    scene.addEntity(new RitualMarker({ x: 1450, y: 560, scale: 1 }));

    // Front trees (palms)
    scene.addEntity(new Tree({ x: 200, y: 600, treeType: "palm", scale: 0.9 }));
    if (!isMobile) {
      scene.addEntity(new Tree({ x: 500, y: 610, treeType: "palm", scale: 0.8 }));
      scene.addEntity(new Tree({ x: 1200, y: 600, treeType: "palm", scale: 1 }));
    }
    scene.addEntity(new Tree({ x: 1600, y: 610, treeType: "palm", scale: 0.9 }));

    // Villagers
    scene.addEntity(
      new Villager({
        x: 600,
        y: 580,
        speed: 0.4,
        scale: 1,
        waypoints: [
          { x: 600, y: 580 },
          { x: 700, y: 570 },
          { x: 800, y: 575 },
          { x: 850, y: 585 },
          { x: 700, y: 590 },
        ],
      })
    );
    if (!isMobile) {
      scene.addEntity(
        new Villager({
          x: 1000,
          y: 590,
          speed: 0.5,
          scale: 0.9,
          waypoints: [
            { x: 1000, y: 590 },
            { x: 920, y: 580 },
            { x: 850, y: 570 },
            { x: 920, y: 585 },
            { x: 1000, y: 595 },
          ],
        })
      );
      scene.addEntity(
        new Villager({
          x: 1300,
          y: 580,
          speed: 0.3,
          scale: 0.95,
          waypoints: [
            { x: 1300, y: 580 },
            { x: 1250, y: 575 },
            { x: 1150, y: 580 },
            { x: 1100, y: 590 },
            { x: 1250, y: 590 },
          ],
        })
      );
    }
    scene.addEntity(
      new Villager({
        x: 300,
        y: 590,
        speed: 0.35,
        scale: 1,
        waypoints: [
          { x: 300, y: 590 },
          { x: 350, y: 580 },
          { x: 400, y: 575 },
          { x: 350, y: 585 },
          { x: 300, y: 595 },
        ],
      })
    );

    // Grass clusters (bottom edge)
    for (let i = 0; i < (isMobile ? 8 : 16); i++) {
      scene.addEntity(
        new Grass({
          x: 100 + i * (isMobile ? 200 : 110),
          y: 620 + Math.random() * 30,
          scale: 0.8 + Math.random() * 0.4,
        })
      );
    }
  });

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

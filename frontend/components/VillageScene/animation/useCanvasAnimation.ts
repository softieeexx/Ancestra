import { useEffect, useRef, RefObject, MutableRefObject } from "react";
import { Scene } from "./Scene";

export function useCanvasAnimation(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  sceneRef: MutableRefObject<Scene | null>,
  dimmed: boolean,
  onInitScene: (scene: Scene) => void
) {
  // Use a ref so the animation loop always reads the latest dimmed value
  // without needing to restart the RAF loop when it changes.
  const dimmedRef = useRef(dimmed);
  dimmedRef.current = dimmed;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!sceneRef.current) {
      const scene = new Scene(ctx);
      onInitScene(scene);
      sceneRef.current = scene;
    }
    const scene = sceneRef.current;

    let animationId: number;
    let lastTime = performance.now();

    const shouldUseHighDPI = () => {
      if (window.innerWidth < 768) return false;
      if (
        navigator.hardwareConcurrency !== undefined &&
        navigator.hardwareConcurrency <= 4
      )
        return false;
      return true;
    };

    const resizeCanvas = () => {
      const dpr = shouldUseHighDPI() ? window.devicePixelRatio || 1 : 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);
        scene.setSize(w, h);
      }
    };

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const time = now / 1000;

      resizeCanvas();

      scene.update(dt, time);
      scene.draw(dimmedRef.current);

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      scene.destroy();
      sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

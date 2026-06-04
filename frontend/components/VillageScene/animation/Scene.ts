import { Entity } from "./Entity";

export interface BackgroundRenderer {
  draw(ctx: CanvasRenderingContext2D, time: number, w: number, h: number): void;
}

export class Scene {
  private entities: Entity[] = [];
  private backgroundRenderers: BackgroundRenderer[] = [];
  private ctx: CanvasRenderingContext2D;
  private canvasW = 0;
  private canvasH = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  setSize(w: number, h: number): void {
    this.canvasW = w;
    this.canvasH = h;
    for (const e of this.entities) {
      e.resize?.(w, h);
    }
  }

  addBackgroundRenderer(renderer: BackgroundRenderer): void {
    this.backgroundRenderers.push(renderer);
  }

  addEntity(entity: Entity): void {
    entity.resize?.(this.canvasW, this.canvasH);
    this.entities.push(entity);
  }

  private removeDeadEntities(): void {
    this.entities = this.entities.filter((e) => e.isAlive());
  }

  update(dt: number, time: number): void {
    for (const entity of this.entities) {
      entity.update(dt, time);
    }
    this.removeDeadEntities();
  }

  draw(dimmed: boolean): void {
    const ctx = this.ctx;
    const w = this.canvasW;
    const h = this.canvasH;

    // Draw background layers
    for (const renderer of this.backgroundRenderers) {
      renderer.draw(ctx, performance.now() / 1000, w, h);
    }

    // Sort entities by painter's algorithm (z then y)
    const sorted = [...this.entities].sort((a, b) => {
      const za = a.z;
      const zb = b.z;
      return za !== zb ? za - zb : a.y - b.y;
    });

    for (const entity of sorted) {
      entity.draw(ctx);
    }

    // Dim overlay for connected state
    if (dimmed) {
      ctx.fillStyle = "rgba(13, 10, 3, 0.6)";
      ctx.fillRect(0, 0, w, h);
    }
  }

  destroy(): void {
    this.entities = [];
    this.backgroundRenderers = [];
  }
}

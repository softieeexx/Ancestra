export interface EntityConfig {
  x: number;
  y: number;
  z?: number;
  scale?: number;
  speed?: number;
}

export abstract class Entity {
  x: number;
  y: number;
  z: number;
  scale: number;
  speed: number;
  protected alive = true;

  constructor(config: EntityConfig) {
    this.x = config.x;
    this.y = config.y;
    this.z = config.z ?? 0;
    this.scale = config.scale ?? 1;
    this.speed = config.speed ?? 1;
  }

  abstract update(dt: number, time: number): void;
  abstract draw(ctx: CanvasRenderingContext2D): void;
  abstract resize?(canvasW: number, canvasH: number): void;

  isAlive(): boolean {
    return this.alive;
  }

  kill(): void {
    this.alive = false;
  }
}

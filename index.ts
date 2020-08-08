console.log("Hello, world");

interface PositionComponent {
  x: number;
  y: number;
}

interface VelocityComponent {
  x: number;
  y: number;
}

interface Entity {
  position?: PositionComponent;
  velocity?: VelocityComponent;
}

const WORLD_WIDTH = 500;
const WORLD_HEIGHT = 500;

function MovementSystem(world: World, delta: number) {
  for (const entity of world.entities) {
    if (entity.position && entity.velocity) {
      entity.position.x += entity.velocity.x * delta;
      entity.position.y += entity.velocity.y * delta;
    }
  }
}

function BounceSystem(world: World) {
  for (const entity of world.entities) {
    if (entity.position && entity.velocity) {
      if (entity.position.x > WORLD_WIDTH) {
        entity.position.x = WORLD_WIDTH;
        entity.velocity.x *= -1;
      } else if (entity.position.x < 0) {
        entity.velocity.x *= -1;
        entity.position.x = 0;
      }

      if (entity.position.y > WORLD_HEIGHT) {
        entity.velocity.y *= -1;
        entity.position.y = WORLD_HEIGHT;
      } else if (entity.position.y < 0) {
        entity.velocity.y *= -1;
        entity.position.y = 0;
      }
    }
  }
}

function ConsoleRenderSystem(world: World) {
  for (const entity of world.entities) {
    console.log(JSON.stringify(entity));
  }
}

const canvas = document.getElementById("canvasRender") as HTMLCanvasElement;
const canvasCtx = canvas.getContext("2d");
const crossSize = 2;
function CanvasRenderSystem(world: World) {
  if (!canvasCtx) return;
  for (const entity of world.entities) {
    if (entity.position) {
      canvasCtx.moveTo(
        entity.position.x - crossSize,
        entity.position.y - crossSize
      );
      canvasCtx.lineTo(
        entity.position.x + crossSize,
        entity.position.y + crossSize
      );
      canvasCtx.moveTo(
        entity.position.x + crossSize,
        entity.position.y - crossSize
      );
      canvasCtx.lineTo(
        entity.position.x - crossSize,
        entity.position.y + crossSize
      );
      canvasCtx.stroke();
    }
  }
}

class World {
  constructor(public entities: Entity[], public currentTime: number = 0) {}

  tick(delta: number) {
    MovementSystem(this, delta);
    BounceSystem(this);
    ConsoleRenderSystem(this);
    CanvasRenderSystem(this);

    this.currentTime += delta;
  }
}

const entities: Entity[] = [];
const maxVelocity = 1;
for (let i = 0; i < 10; i++) {
  entities.push({
    position: {
      x: (Math.random() * WORLD_WIDTH) | 0,
      y: (Math.random() * WORLD_HEIGHT) | 0,
    },
    velocity: {
      x: Math.random() * maxVelocity - maxVelocity / 2,
      y: Math.random() * maxVelocity - maxVelocity / 2,
    },
  });
}

const world = new World(entities);
let t0 = performance.now();
setInterval(() => {
  const delta = performance.now() - t0;
  t0 += delta;
  console.log("tick");
  world.tick(delta);
}, 10);

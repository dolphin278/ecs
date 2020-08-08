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

function MovementSystem(world: World) {
  for (const entity of world.entities) {
    if (entity.position && entity.velocity) {
      entity.position.x += entity.velocity.x;
      entity.position.y += entity.velocity.y;
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
      canvasCtx.moveTo(entity.position.x - crossSize, entity.position.y - crossSize);
      canvasCtx.lineTo(entity.position.x + crossSize, entity.position.y + crossSize);
      canvasCtx.moveTo(entity.position.x + crossSize, entity.position.y - crossSize);
      canvasCtx.lineTo(entity.position.x - crossSize, entity.position.y + crossSize);
      canvasCtx.stroke();
    }
  }
}

class World {
  constructor(public entities: Entity[]) {}

  tick() {
    MovementSystem(this);
    ConsoleRenderSystem(this);
    CanvasRenderSystem(this);
  }
}

const entities: Entity[] = [];
const maxVelocity = 10
for (let i = 0; i < 10; i++) {
  entities.push({
    position: {
      x: (Math.random() * 500) | 0,
      y: (Math.random() * 500) | 0,
    },
    velocity: {
      x: (Math.random() * maxVelocity) - (maxVelocity / 2),
      y: (Math.random() * maxVelocity) - (maxVelocity / 2),
    },
  });
}

const world = new World(entities);

setInterval(() => {
  console.log("tick");
  world.tick();
}, 100);

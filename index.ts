console.log("Hello, world");

interface PositionComponent {
  x: number;
  y: number;
}

interface VelocityComponent {
  x: number;
  y: number;
}

interface AccelerationComponent {
  x: number;
  y: number;
}

interface ForceComponent {
  x: number;
  y: number;
}

interface MassComponent {
  value: number;
}

interface Entity {
  position?: PositionComponent;
  velocity?: VelocityComponent;
  acceleration?: AccelerationComponent;
  force?: ForceComponent;
  mass?: MassComponent;
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
        entity.velocity.x *= -0.1;
      } else if (entity.position.x < 0) {
        entity.velocity.x *= -0.1;
        entity.position.x = 0;
      }

      if (entity.position.y > WORLD_HEIGHT) {
        entity.velocity.y *= -0.1;
        entity.position.y = WORLD_HEIGHT;
      } else if (entity.position.y < 0) {
        entity.velocity.y *= -0.1;
        entity.position.y = 0;
      }
    }
  }
}

function AccelerationSystem(world: World, delta: number) {
  for (const entity of world.entities) {
    if (entity.velocity && entity.acceleration) {
      entity.velocity.x += entity.acceleration.x * delta;
      entity.velocity.y += entity.acceleration.y * delta;
    }
  }
}

function ApplyForceSystem(world: World) {
  for (const entity of world.entities) {
    if (entity.mass && entity.acceleration && entity.force) {
      if (entity.mass.value === 0) continue;
      entity.acceleration.x = entity.force.x / entity.mass.value;
      entity.acceleration.y = entity.force.y / entity.mass.value;
    }
  }
}

function ForceResetSystem(world: World) {
  for (const entity of world.entities) {
    if (entity.force) {
      entity.force.x = 0;
      entity.force.y = 0;
    }
  }
}

const GRAVITY_CONST = 1e-7;
function GravityForceSystem(world: World) {
  for (let i = 0; i < world.entities.length - 1; i++) {
    const e1 = world.entities[i];
    if (!e1.mass || !e1.position || !e1.force) continue;

    for (let j = i + 1; j < world.entities.length; j++) {
      const e2 = world.entities[j];
      if (!e2.mass || !e2.position || !e2.force) continue;

      const dx = e2.position.x - e1.position.x;
      const dy = e2.position.y - e1.position.y;

      const r2 = dx ** 2 + dy ** 2;
      if (r2 === 0) continue;
      const r = r2 ** 0.5;

      const force = (GRAVITY_CONST * e1.mass.value * e2.mass.value) / r2;

      const fx = force * (dx / r);
      const fy = force * (dy / r);
      e1.force.x += fx;
      e1.force.y += fy;

      e2.force.x -= fx;
      e2.force.y -= fy;
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

function CanvasRenderSystem(world: World) {
  if (!canvasCtx) return;
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  for (const entity of world.entities) {
    const crossSize = entity.mass ? entity.mass.value ** (1 / 3) : 2;
    canvasCtx.beginPath();
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
    AccelerationSystem(this, delta);
    ForceResetSystem(this);
    GravityForceSystem(this);
    ApplyForceSystem(this);
    ConsoleRenderSystem(this);
    CanvasRenderSystem(this);

    this.currentTime += delta;
  }
}

const entities: Entity[] = [];
const maxVelocity = 0.05;
for (let i = 0; i < 40; i++) {
  entities.push({
    position: {
      x: (Math.random() * WORLD_WIDTH) | 0,
      y: (Math.random() * WORLD_HEIGHT) | 0,
    },
    velocity: {
      x: Math.random() * maxVelocity - maxVelocity / 2,
      y: Math.random() * maxVelocity - maxVelocity / 2,
      // x: 0,
      // y: 0,
    },
    acceleration: {
      x: 0,
      y: 0,
    },
    force: {
      x: 0,
      y: 0,
    },
    mass: {
      value: 1000,
    },
  });
}

entities.push({
  position: {
    x: (WORLD_WIDTH / 2) | 0,
    y: (WORLD_HEIGHT / 2) | 0,
  },
  acceleration: {
    x: 0,
    y: 0,
  },
  force: {
    x: 0,
    y: 0,
  },
  mass: {
    value: 10000,
  },
});

const world = new World(entities);
let t0 = performance.now();

const render = (currentTime: number) => {
  const delta = currentTime - t0;
  t0 += delta;
  console.log("tick");
  world.tick(delta);
  requestAnimationFrame(render);
};

requestAnimationFrame(render);

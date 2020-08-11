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

type CanvasRenderComponent =
  | {
      kind: "rect";
      strokeStyle: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      kind: "image";
    };

interface Entity {
  position?: PositionComponent;
  velocity?: VelocityComponent;
  acceleration?: AccelerationComponent;
  force?: ForceComponent;
  mass?: MassComponent;
  canvasRender?: CanvasRenderComponent;
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

function PhysicsRender(world: World) {
  for (const entity of world.entities) {
    if (entity.position) {
      entity.canvasRender = {
        kind: "rect",
        strokeStyle: "red",
        x: entity.position.x,
        y: entity.position.y,
        width: 10,
        height: 10,
      };
      if (entity.mass) {
        const size = entity.mass.value ** (1 / 3);
        entity.canvasRender.width = 2 * size;
        entity.canvasRender.height = 2 * size;
      }
    }
  }
}

function CanvasRenderSystem(world: World) {
  if (!canvasCtx) return;
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  for (const entity of world.entities) {
    const crossSize = entity.mass ? entity.mass.value ** (1 / 3) : 2;
    canvasCtx.beginPath();
    canvasCtx.strokeStyle = "black";

    if (entity.canvasRender) {
      const renderComponent = entity.canvasRender;
      canvasCtx.beginPath();

      switch (renderComponent.kind) {
        case "rect":
          canvasCtx.strokeStyle = renderComponent.strokeStyle;
          canvasCtx.strokeRect(
            renderComponent.x,
            renderComponent.y,
            renderComponent.width,
            renderComponent.height
          );
      }
      canvasCtx.closePath();
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
    PhysicsRender(this);
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
    canvasRender: {
      kind: "rect",
      strokeStyle: "red",
      x: 10,
      y: 10,
      width: 10,
      height: 10,
    },
  });
}

// Star
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
  canvasRender: {
    kind: "rect",
    strokeStyle: "orange",
    x: 10,
    y: 10,
    width: 50,
    height: 50,
  },
});

//
// entities.push({
//   position: {
//     x: 100,
//     y: 100,
//   },
//   mass: {
//     value: 10000
//   }
// });

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

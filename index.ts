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

interface JointComponent {
  entity1: Entity;
  entity2: Entity;
  k: number;
  originalDistance: number;
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
      kind: "line";
      strokeStyle: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    };

interface Entity {
  position?: PositionComponent;
  velocity?: VelocityComponent;
  acceleration?: AccelerationComponent;
  force?: ForceComponent;
  mass?: MassComponent;
  canvasRender?: CanvasRenderComponent;
  joint?: JointComponent;
}

const WORLD_WIDTH = 1000;
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
        // entity.position.x = 0;
        // entity.velocity.x *= 0.1;
        entity.position.x = WORLD_WIDTH;
        entity.velocity.x *= -0;
      } else if (entity.position.x < 0) {
        entity.velocity.x *= -0;
        entity.position.x = 0;
        // entity.position.x = WORLD_WIDTH;
        // entity.velocity.x *= 0.1;
      }

      if (entity.position.y > WORLD_HEIGHT) {
        entity.velocity.y *= 0;
        entity.position.y = WORLD_HEIGHT;
        // entity.velocity.y *= 0.1;
        // entity.position.y = 0;
      } else if (entity.position.y < 0) {
        entity.velocity.y *= 0;
        entity.position.y = 0;
        // entity.velocity.y *= 0.1;
        // entity.position.y = WORLD_HEIGHT;
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

const GRAVITY_CONST = 6.67e-5;
function GravityForceSystem(world: World) {
  for (let i = 0; i < world.entities.length - 1; i++) {
    const e1 = world.entities[i];
    if (!e1.mass || !e1.position || !e1.force) continue;

    for (let j = i + 1; j < world.entities.length; j++) {
      const e2 = world.entities[j];
      if (!e2.mass || !e2.position || !e2.force) continue;

      const dx = e2.position.x - e1.position.x;
      const dy = e2.position.y - e1.position.y;

      const r2 = dx * dx + dy * dy;
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

function JointSystem(world: World) {
  for (const entity of world.entities) {
    if (entity.joint) {
      const entity1 = entity.joint.entity1;
      if (!entity1.position || !entity1.force) continue;
      const entity2 = entity.joint.entity2;
      if (!entity2.position || !entity2.force) continue;
      const dx = entity2.position.x - entity1.position.x;
      const dy = entity2.position.y - entity1.position.y;

      const r2 = dx * dx + dy * dy;
      const originalDistance2 =
        entity.joint.originalDistance * entity.joint.originalDistance;
      if (r2 === originalDistance2) continue;

      const r = Math.sqrt(r2);
      const f = -(r - originalDistance2) * entity.joint.k;

      const fx = (dx / r) * f;
      const fy = (dy / r) * f;

      entity1.force.x += fx;
      entity1.force.y += fy;

      entity2.force.x -= fx;
      entity2.force.y -= fy;
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

        entity.canvasRender.x -= size;
        entity.canvasRender.y -= size;
      }
    }
    if (entity.joint) {
      const joint = entity.joint;
      const position1 = joint.entity1.position;
      if (!position1) continue;
      const position2 = joint.entity2.position;
      if (!position2) continue;
      entity.canvasRender = {
        kind: "line",
        strokeStyle: "blue",
        x1: position1.x,
        y1: position1.y,
        x2: position2.x,
        y2: position2.y,
      };
    }
  }
}

function CanvasRenderSystem(world: World) {
  if (!canvasCtx) return;
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  for (const entity of world.entities) {
    canvasCtx.beginPath();
    canvasCtx.strokeStyle = "black";

    if (entity.canvasRender) {
      const renderComponent = entity.canvasRender;

      if (renderComponent.kind === "rect") {
        canvasCtx.beginPath();
        canvasCtx.strokeStyle = renderComponent.strokeStyle;
        canvasCtx.strokeRect(
          renderComponent.x,
          renderComponent.y,
          renderComponent.width,
          renderComponent.height
        );
      }

      if (renderComponent.kind === "line") {
        canvasCtx.beginPath();
        canvasCtx.strokeStyle = renderComponent.strokeStyle;
        canvasCtx.moveTo(renderComponent.x1, renderComponent.y1);
        canvasCtx.lineTo(renderComponent.x2, renderComponent.y2);
        canvasCtx.stroke();
        canvasCtx.closePath();
      }
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
    // GravityForceSystem(this);
    JointSystem(this);
    ApplyForceSystem(this);
    ConsoleRenderSystem(this);
    PhysicsRender(this);
    CanvasRenderSystem(this);
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
      value: 10,
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
for (let i = 0; i < 2; i++) {
  entities.push({
    position: {
      x: (Math.random() * WORLD_WIDTH) | 0,
      y: (Math.random() * WORLD_HEIGHT) | 0,
    },
    acceleration: {
      x: 0,
      y: 0,
    },
    velocity: {
      x: 0,
      y: 0,
    },
    force: {
      x: 0,
      y: 0,
    },
    mass: {
      value: 100000,
    },
  });
}
entities.push({
  position: {
    x: (Math.random() * WORLD_WIDTH) | 0,
    y: (Math.random() * WORLD_HEIGHT) | 0,
  },
  acceleration: {
    x: 0,
    y: 0,
  },
  // velocity: {
  //   x: 0,
  //   y: 0,
  // },
  force: {
    x: 0,
    y: 0,
  },
  mass: {
    value: 100000,
  },
});

entities.push({
  joint: {
    entity1: entities[entities.length - 2],
    entity2: entities[entities.length - 1],
    k: 1e-4,
    originalDistance: 100,
  },
});

entities.push({
  joint: {
    entity1: entities[entities.length - 4],
    entity2: entities[entities.length - 3],
    k: 1e-4,
    originalDistance: 100,
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

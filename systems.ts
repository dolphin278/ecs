import { World } from "./index";
export const WORLD_WIDTH = 1000;
export const WORLD_HEIGHT = 500;
import {
  Entity,
  PositionComponent,
  VelocityComponent,
  AccelerationComponent,
  MassComponent,
  ForceComponent,
  JointComponent,
  CanvasRenderComponent,
  UserControlledComponent,
} from "./components";

// TODO: Add proper types
export function singleEntitySystem(
  components: Array<keyof Entity>,
  fn: (...args: any[]) => void
) {
  return function (world: World, delta: number) {
    entityCycle: for (const entity of world.entities) {
      const args = [];
      for (const component of components) {
        const componentData = Reflect.get(entity, component);
        if (!componentData) continue entityCycle;
        args.push(componentData);
      }

      args.push(delta);
      Reflect.apply(fn, null, args);
    }
  };
}

export const MovementSystem = singleEntitySystem(
  ["position", "velocity"],
  (position: PositionComponent, velocity: VelocityComponent, delta: number) => {
    position.x += velocity.x * delta;
    position.y += velocity.y * delta;
  }
);

export const BounceSystem = singleEntitySystem(
  ["position", "velocity"],
  (position: PositionComponent, velocity: VelocityComponent) => {
    if (position.x > WORLD_WIDTH) {
      // position.x = 0;
      velocity.x *= -1;
      position.x = WORLD_WIDTH;
      velocity.x *= -0.2;
    } else if (position.x < 0) {
      // velocity.x *= -0;
      position.x = 0;
      // position.x = WORLD_WIDTH;
      velocity.x *= -0.2;
      // velocity.x *= 0.1;
    }

    if (position.y > WORLD_HEIGHT) {
      // velocity.y *= 0;
      position.y = WORLD_HEIGHT;
      // velocity.y *= 0.1;
      velocity.y *= -0.2;
      // position.y = 0;
    } else if (position.y < 0) {
      // velocity.y *= 0;
      position.y = 0;
      velocity.y *= -0.2;
      // position.y = WORLD_HEIGHT;
      // velocity.y *= 0.1;
    }
  }
);

export const AccelerationSystem = singleEntitySystem(
  ["acceleration", "velocity"],
  (
    acceleration: AccelerationComponent,
    velocity: VelocityComponent,
    delta: number
  ) => {
    velocity.x += acceleration.x * delta;
    velocity.y += acceleration.y * delta;
  }
);
export const ApplyForceSystem = singleEntitySystem(
  ["mass", "acceleration", "force"],
  (
    mass: MassComponent,
    acceleration: AccelerationComponent,
    force: ForceComponent
  ) => {
    if (mass.value === 0) return;
    acceleration.x = force.x / mass.value;
    acceleration.y = force.y / mass.value;
  }
);

export const ForceResetSystem = singleEntitySystem(
  ["force"],
  (force: ForceComponent) => {
    force.x = 0;
    force.y = 0;
  }
);

const GRAVITY_CONST = 6.67e-5;
export function GravityForceSystem(world: World) {
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

export const JointSystem = singleEntitySystem(
  ["joint"],
  ({ entity1, entity2, originalDistance, k }: JointComponent) => {
    if (!entity1.position || !entity1.force) return;
    if (!entity2.position || !entity2.force) return;
    const dx = entity2.position.x - entity1.position.x;
    const dy = entity2.position.y - entity1.position.y;

    const r2 = dx * dx + dy * dy;
    const originalDistance2 = originalDistance * originalDistance;
    if (r2 === originalDistance2) return;

    const r = Math.sqrt(r2);
    const f = -(r - originalDistance2) * k;

    const fx = (dx / r) * f;
    const fy = (dy / r) * f;

    entity1.force.x += fx;
    entity1.force.y += fy;

    entity2.force.x -= fx;
    entity2.force.y -= fy;
  }
);

function ConsoleRenderSystem(world: World) {
  for (const entity of world.entities) {
    console.log(JSON.stringify(entity));
  }
}

export const PhysicsRenderSystem = (world: World) => {
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
      if (entity.userControl) entity.canvasRender.strokeStyle = "green";

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
};

const canvas = document.getElementById("canvasRender") as HTMLCanvasElement;
const canvasCtx = canvas.getContext("2d");

export function CanvasCleanSystem() {
  if (!canvasCtx) return;
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
}

export const CanvasRenderSystem = singleEntitySystem(
  ["canvasRender"],
  (canvasRender: CanvasRenderComponent) => {
    if (!canvasCtx) return;

    switch (canvasRender.kind) {
      case "rect":
        canvasCtx.beginPath();
        canvasCtx.strokeStyle = canvasRender.strokeStyle;
        canvasCtx.strokeRect(
          canvasRender.x,
          canvasRender.y,
          canvasRender.width,
          canvasRender.height
        );
        canvasCtx.closePath();
        break;
      case "line":
        canvasCtx.beginPath();
        canvasCtx.strokeStyle = canvasRender.strokeStyle;
        canvasCtx.moveTo(canvasRender.x1, canvasRender.y1);
        canvasCtx.lineTo(canvasRender.x2, canvasRender.y2);
        canvasCtx.stroke();
        canvasCtx.closePath();
        break;
    }
  }
);

const keyState = {
  up: false,
  down: false,
  left: false,
  right: false,
};
document.addEventListener("keydown", (event) => {
  switch (event.keyCode) {
    case 37:
      keyState.left = true;
      break;
    case 38:
      keyState.up = true;
      break;
    case 39:
      keyState.right = true;
      break;
    case 40:
      keyState.down = true;
      break;
  }
});
document.addEventListener("keyup", (event) => {
  switch (event.keyCode) {
    case 37:
      keyState.left = false;
      break;
    case 38:
      keyState.up = false;
      break;
    case 39:
      keyState.right = false;
      break;
    case 40:
      keyState.down = false;
      break;
  }
});

export const UserControlSystem = singleEntitySystem(
  ["userControl", "velocity"],
  (_userControl: UserControlledComponent, velocity: VelocityComponent) => {
    const vx = 0.02;
    const vy = 0.02;

    if (keyState.right) velocity.x += vx;
    if (keyState.left) velocity.x -= vx;
    if (keyState.up) velocity.y -= vy;
    if (keyState.down) velocity.y += vy;
  }
);

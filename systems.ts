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
  components: Array<keyof Entity | keyof World["components"]>,
  fn: (...args: any[]) => void
) {
  return function (world: World, delta: number) {
    entityCycle: for (const entity of world.entities) {
      const args = [];
      for (const component of components) {
        let componentData;
        if (Reflect.has(world.components, component)) {
          // @ts-ignore
          componentData = world.components[component].get(entity);
        } else componentData = Reflect.get(entity, component);

        if (!componentData) continue entityCycle;
        args.push(componentData);
      }

      args.push(delta);
      Reflect.apply(fn, null, args);
    }
  };
}

export const MovementSystem = singleEntitySystem(
  ["positionComponent", "velocityComponent"],
  (position: PositionComponent, velocity: VelocityComponent, delta: number) => {
    position.x += velocity.x * delta;
    position.y += velocity.y * delta;
  }
);

export const BounceSystem = singleEntitySystem(
  ["positionComponent", "velocityComponent"],
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
  ["accelerationComponent", "velocityComponent"],
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
  ["massComponent", "accelerationComponent", "forceComponent"],
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
  ["forceComponent"],
  (force: ForceComponent) => {
    force.x = 0;
    force.y = 0;
  }
);

const GRAVITY_CONST = 6.67e-11;
// export function GravityForceSystem(world: World) {
//   for (let i = 0; i < world.entities.length - 1; i++) {
//     const e1 = world.entities[i];
//     const e1Position = world.components.positionComponent.get(e1);
//     if (e1Position === void 0) continue;
//     const e1Force = world.components.forceComponent.get(e1);
//     if (e1Force === void 0) continue;
//     const e1Mass = world.components.massComponent.get(e1);
//     if (e1Mass === void 0) continue;

//     for (let j = i + 1; j < world.entities.length; j++) {
//       const e2 = world.entities[j];

//       const e2Position = world.components.positionComponent.get(e2);
//       if (e2Position === void 0) continue;
//       const e2Force = world.components.forceComponent.get(e2);
//       if (e2Force === void 0) continue;
//       const e2Mass = world.components.massComponent.get(e2);
//       if (e2Mass === void 0) continue;

//       const dx = e2Position.x - e1Position.x;
//       const dy = e2Position.y - e1Position.y;

//       const r2 = dx * dx + dy * dy;
//       if (r2 === 0) continue;
//       const r = Math.sqrt(r2);

//       const force = (GRAVITY_CONST * e1Mass.value * e2Mass.value) / r2;

//       const fdr = force / r;
//       const fx = fdr * dx;
//       const fy = fdr * dy;

//       e1Force.x += fx;
//       e1Force.y += fy;

//       e2Force.x -= fx;
//       e2Force.y -= fy;
//     }
//   }
// }

const entities: Array<{mass: MassComponent, position: PositionComponent, force: ForceComponent}> = []
export function GravityForceSystem(world: World) {
  
  while (entities.length !== 0) entities.pop()
  for (const {0: e, 1: mass} of world.components.massComponent) {
    const force = world.components.forceComponent.get(e);
    if (force === void 0) continue;
    const position = world.components.positionComponent.get(e);
    if (position === void 0) continue;
    entities.push({force, mass, position});
  }

  for (let i = 0; i < entities.length - 1; i++) {
    const {mass: e1Mass, position: e1Position, force: e1Force} = entities[i];
    for (let j = i + 1; j < entities.length; j++) {
      const {mass: e2Mass, position: e2Position, force: e2Force} = entities[j];

      const dx = e2Position.x - e1Position.x;
      const dy = e2Position.y - e1Position.y;

      const r2 = dx * dx + dy * dy;
      if (r2 === 0) continue;
      const r = Math.sqrt(r2);

      const force = (GRAVITY_CONST * e1Mass.value * e2Mass.value) / r2;

      const fdr = force / r;
      const fx = fdr * dx;
      const fy = fdr * dy;

      e1Force.x += fx;
      e1Force.y += fy;

      e2Force.x -= fx;
      e2Force.y -= fy;
    }
  }
}

export const JointSystem = (world: World) => {
  for (const entity of world.entities) {
    const joint = world.components.jointComponent.get(entity);
    if (joint) {
      const { entity1, entity2, originalDistance, k } = joint;
      const entity1Position = world.components.positionComponent.get(entity1);
      const entity1Force = world.components.forceComponent.get(entity1);
      if (!entity1Position || !entity1Force) return;
      const entity2Position = world.components.positionComponent.get(entity2);
      const entity2Force = world.components.forceComponent.get(entity2);
      if (!entity2Position || !entity2Force) return;
      const dx = entity2Position.x - entity1Position.x;
      const dy = entity2Position.y - entity1Position.y;

      const r2 = dx * dx + dy * dy;
      const originalDistance2 = originalDistance * originalDistance;
      if (r2 === 0 || r2 === originalDistance2) return;

      const r = Math.sqrt(r2);
      const f = (r - originalDistance) * k;

      const fx = (dx / r) * f;
      const fy = (dy / r) * f;

      entity1Force.x += fx;
      entity1Force.y += fy;

      entity2Force.x -= fx;
      entity2Force.y -= fy;
    }
  }
};

export function ConsoleRenderSystem(world: World) {
  for (const entity of world.entities) {
    console.log(JSON.stringify(entity));
  }
}

export const PhysicsRenderSystem = (world: World) => {
  for (const entity of world.entities) {
    const position = world.components.positionComponent.get(entity);
    if (position) {
      const canvasRender: CanvasRenderComponent = {
        kind: "rect",
        strokeStyle: "red",
        x: position.x,
        y: position.y,
        width: 10,
        height: 10,
      };
      const userControl = world.components.userControlComponent.get(entity);
      if (userControl) canvasRender.strokeStyle = "green";

      const mass = world.components.massComponent.get(entity);
      if (mass) {
        const size = mass.value ** (1 / 3);
        canvasRender.width = 2 * size;
        canvasRender.height = 2 * size;

        canvasRender.x -= size;
        canvasRender.y -= size;
      }
      world.components.canvasRenderComponent.set(entity, canvasRender);
    }
    const joint = world.components.jointComponent.get(entity);
    if (joint) {
      const position1 = world.components.positionComponent.get(joint.entity1);
      if (!position1) continue;
      const position2 = world.components.positionComponent.get(joint.entity2);
      if (!position2) continue;
      world.components.canvasRenderComponent.set(entity, {
        kind: "line",
        strokeStyle: "blue",
        x1: position1.x,
        y1: position1.y,
        x2: position2.x,
        y2: position2.y,
      });
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
  ["canvasRenderComponent"],
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
  ["userControlComponent", "velocityComponent"],
  (_userControl: UserControlledComponent, velocity: VelocityComponent) => {
    const vx = 0.02;
    const vy = 0.02;

    if (keyState.right) velocity.x += vx;
    if (keyState.left) velocity.x -= vx;
    if (keyState.up) velocity.y -= vy;
    if (keyState.down) velocity.y += vy;
  }
);

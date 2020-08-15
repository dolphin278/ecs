import { World } from "./index";
export const WORLD_WIDTH = 1000;
export const WORLD_HEIGHT = 500;
export function MovementSystem(world: World, delta: number) {
  for (const entity of world.entities) {
    if (entity.position && entity.velocity) {
      entity.position.x += entity.velocity.x * delta;
      entity.position.y += entity.velocity.y * delta;
    }
  }
}
export function BounceSystem(world: World) {
  for (const entity of world.entities) {
    if (entity.position && entity.velocity) {
      if (entity.position.x > WORLD_WIDTH) {
        // entity.position.x = 0;
        entity.velocity.x *= -1;
        entity.position.x = WORLD_WIDTH;
        entity.velocity.x *= -0.2;
      }
      else if (entity.position.x < 0) {
        // entity.velocity.x *= -0;
        entity.position.x = 0;
        // entity.position.x = WORLD_WIDTH;
        entity.velocity.x *= -0.2;
        // entity.velocity.x *= 0.1;
      }

      if (entity.position.y > WORLD_HEIGHT) {
        // entity.velocity.y *= 0;
        entity.position.y = WORLD_HEIGHT;
        // entity.velocity.y *= 0.1;
        entity.velocity.y *= -0.2;
        // entity.position.y = 0;
      }
      else if (entity.position.y < 0) {
        // entity.velocity.y *= 0;
        entity.position.y = 0;
        entity.velocity.y *= -0.2;
        // entity.position.y = WORLD_HEIGHT;
        // entity.velocity.y *= 0.1;
      }
    }
  }
}
export function AccelerationSystem(world: World, delta: number) {
  for (const entity of world.entities) {
    if (entity.velocity && entity.acceleration) {
      entity.velocity.x += entity.acceleration.x * delta;
      entity.velocity.y += entity.acceleration.y * delta;
    }
  }
}
export function ApplyForceSystem(world: World) {
  for (const entity of world.entities) {
    if (entity.mass && entity.acceleration && entity.force) {
      if (entity.mass.value === 0)
        continue;
      entity.acceleration.x = entity.force.x / entity.mass.value;
      entity.acceleration.y = entity.force.y / entity.mass.value;
    }
  }
}
export function ForceResetSystem(world: World) {
  for (const entity of world.entities) {
    if (entity.force) {
      entity.force.x = 0;
      entity.force.y = 0;
    }
  }
}
const GRAVITY_CONST = 6.67e-5;
export function GravityForceSystem(world: World) {
  for (let i = 0; i < world.entities.length - 1; i++) {
    const e1 = world.entities[i];
    if (!e1.mass || !e1.position || !e1.force)
      continue;

    for (let j = i + 1; j < world.entities.length; j++) {
      const e2 = world.entities[j];
      if (!e2.mass || !e2.position || !e2.force)
        continue;

      const dx = e2.position.x - e1.position.x;
      const dy = e2.position.y - e1.position.y;

      const r2 = dx * dx + dy * dy;
      if (r2 === 0)
        continue;
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
export function JointSystem(world: World) {
  for (const entity of world.entities) {
    if (entity.joint) {
      const entity1 = entity.joint.entity1;
      if (!entity1.position || !entity1.force)
        continue;
      const entity2 = entity.joint.entity2;
      if (!entity2.position || !entity2.force)
        continue;
      const dx = entity2.position.x - entity1.position.x;
      const dy = entity2.position.y - entity1.position.y;

      const r2 = dx * dx + dy * dy;
      const originalDistance2 = entity.joint.originalDistance * entity.joint.originalDistance;
      if (r2 === originalDistance2)
        continue;

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
export function PhysicsRender(world: World) {
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
      if (entity.userControl)
        entity.canvasRender.strokeStyle = "green";

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
      if (!position1)
        continue;
      const position2 = joint.entity2.position;
      if (!position2)
        continue;
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
export function CanvasRenderSystem(world: World) {
  if (!canvasCtx)
    return;
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
export function UserControlSystem(world: World) {
  const vx = 0.02;
  const vy = 0.02;
  for (const entity of world.entities) {
    if (entity.userControl && entity.velocity) {
      if (keyState.right)
        entity.velocity.x += vx;
      if (keyState.left)
        entity.velocity.x -= vx;
      if (keyState.up)
        entity.velocity.y -= vy;
      if (keyState.down)
        entity.velocity.y += vy;
    }
  }
}

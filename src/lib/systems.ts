import type { System } from "./index";
import type { BaseComponents } from "./components";
import * as World from "./world";
import * as Utils from "./utils";

export const Movement: System<Pick<
  BaseComponents,
  "position" | "velocity"
>> = function Movement(world, delta) {
  World.entitiesWithComponents(
    ["position", "velocity"] as const,
    world
  ).forEach(([_, position, velocity]) =>
    Utils.Vector2.addVecMultiplyByScalar(position, velocity, delta)
  );
};

export const Bounce = (
  WORLD_WIDTH: number,
  WORLD_HEIGHT: number
): System<Pick<BaseComponents, "position" | "velocity">> =>
  function Bounce(world, delta) {
    World.entitiesWithComponents(
      ["position", "velocity"] as const,
      world
    ).forEach(([_, position, velocity]) => {
      if (position.x > WORLD_WIDTH) {
        position.x = WORLD_WIDTH;
        velocity.x *= -0.2;
      } else if (position.x < 0) {
        position.x = 0;
        velocity.x *= -0.2;
      }

      if (position.y > WORLD_HEIGHT) {
        position.y = WORLD_HEIGHT;
        velocity.y *= -0.2;
      } else if (position.y < 0) {
        position.y = 0;
        velocity.y *= -0.2;
      }
    });
  };

export const Acceleration: System<Pick<
  BaseComponents,
  "velocity" | "acceleration"
>> = function Acceleration(world, delta) {
  World.entitiesWithComponents(
    ["acceleration", "velocity"],
    world
  ).forEach(([_, acceleration, velocity]) =>
    Utils.Vector2.addVecMultiplyByScalar(velocity, acceleration, delta)
  );
};

export const ApplyForce: System<Pick<
  BaseComponents,
  "acceleration" | "mass" | "force"
>> = function ApplyForce(world, delta) {
  World.entitiesWithComponents(
    ["mass", "force", "acceleration"] as const,
    world
  ).forEach(([_, mass, force, acceleration]) =>
    Utils.Vector2.addVecMultiplyByScalar(acceleration, force, 1 / mass.value)
  );
};

export const ForceReset: System<Pick<
  BaseComponents,
  "force"
>> = function ForceReset(world) {
  for (const force of world.components.force.values())
    Utils.Vector2.setToZero(force);
};

export const Gravity: System<Pick<
  BaseComponents,
  "mass" | "force" | "position"
>> = function Gravity(world) {
  const GRAVITY_CONST = 6.67e-11;
  const d = Utils.Vector2.make(0.0, 0.0);
  const entities = World.entitiesWithComponents(
    ["mass", "force", "position"] as const,
    world
  );
  for (var i = 0; i < entities.length - 1; i++) {
    var [_, mass1, force1, position1] = entities[i];
    for (var j = i + 1; j < entities.length; j++) {
      var [_, mass2, force2, position2] = entities[j];
      Utils.Vector2.diff(position2, position1, d);
      if (Utils.Vector2.isZero(d)) continue;
      var dModule = Utils.Vector2.module(d);
      var forceModule =
        (GRAVITY_CONST * mass1.value * mass2.value) /
        Utils.Vector2.moduleSquare(d) /
        dModule;
      Utils.Vector2.addVecMultiplyByScalar(force1, d, forceModule);
      Utils.Vector2.addVecMultiplyByScalar(force2, d, -forceModule);
    }
  }
};

export const Spring: System<Pick<
  BaseComponents,
  "spring" | "force" | "position"
>> = function Spring(world) {
  var d = Utils.Vector2.make(0.0, 0.0);
  var force = world.components.force;
  var position = world.components.position;
  for (var [entity, spring] of world.components.spring) {
    if (
      !world.activeEntitites.has(spring.entity1) ||
      !world.activeEntitites.has(spring.entity2)
    ) {
      World.removeEntity(world, entity);
      continue;
    }

    var e1Force = force.get(spring.entity1);
    if (e1Force === void 0) continue;

    var e2Force = force.get(spring.entity2);
    if (e2Force === void 0) continue;

    var e1Position = position.get(spring.entity1);
    if (e1Position === void 0) continue;

    var e2Position = position.get(spring.entity2);
    if (e2Position === void 0) continue;

    Utils.Vector2.diff(e2Position, e1Position, d);

    if (Utils.Vector2.isZero(d)) continue;

    var distance = Utils.Vector2.module(d);
    var forceModule =
      (-(spring.originalDistance - distance) * spring.k) / distance;

    Utils.Vector2.addVecMultiplyByScalar(e1Force, d, forceModule);
    Utils.Vector2.addVecMultiplyByScalar(e2Force, d, -forceModule);
  }
};

export const DebugPhysicsRender: System<
  Pick<BaseComponents, "position" | "canvasRectangle"> &
    Partial<Pick<BaseComponents, "userControl" | "canvasSprite" | "mass">>
> = function PhysicsRender(world) {
  World.entitiesWithComponents(
    ["canvasRectangle", "position"] as const,
    world
  ).forEach(([entity, canvasRectangle, position]) => {
    canvasRectangle.x = position.x;
    canvasRectangle.y = position.y;

    if (world.components.userControl?.has(entity))
      canvasRectangle.strokeStyle = "green";

    var mass = world.components.mass?.get(entity)?.value;
    if (mass !== void 0) {
      const size = mass ** (1 / 3);
      canvasRectangle.width = canvasRectangle.height = 2 * size;
      canvasRectangle.x -= size;
      canvasRectangle.y -= size;
    }
  });

  World.entitiesWithComponents(
    ["canvasSprite", "position"] as const,
    world
  ).forEach(([entity, canvasPosition, position]) => {
    canvasPosition!.x = position.x;
    canvasPosition!.y = position.y;
  });
};

export const DebugSpringRender: System<Pick<
  BaseComponents,
  "position" | "spring" | "canvasLine"
>> = function DebugSpringRender(world) {
  World.entitiesWithComponents(
    ["spring", "canvasLine"] as const,
    world
  ).forEach(([_, spring, canvasLine]) => {
    var e1Position = world.components.position.get(spring.entity1);
    if (e1Position === void 0) return;
    var e2Position = world.components.position.get(spring.entity2);
    if (e2Position === void 0) return;
    canvasLine.x1 = e1Position.x;
    canvasLine.y1 = e1Position.y;
    canvasLine.x2 = e2Position.x;
    canvasLine.y2 = e2Position.y;
  });
};

export const CanvasRender: (
  canvas: HTMLCanvasElement
) => System<{
  canvasRectangle: BaseComponents["canvasRectangle"];
  canvasLine: BaseComponents["canvasLine"];
  canvasText: BaseComponents["canvasText"];
  canvasSprite: BaseComponents["canvasSprite"];
}> = (canvas) => {
  const canvasCtx = canvas.getContext("2d")!;
  return function CanvasRender(world, delta) {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    const thingsToRender = [
      ...[...world.components.canvasLine?.values()].map(
        (x) => ["canvasLine" as const, x] as const
      ),
      ...[...world.components.canvasRectangle?.values()].map(
        (x) => ["canvasRectangle" as const, x] as const
      ),
      ...[...world.components.canvasText?.values()].map(
        (x) => ["canvasText" as const, x] as const
      ),
      ...[...world.components.canvasSprite?.values()].map(
        (x) => ["canvasSprite" as const, x] as const
      ),
    ];

    // TODO: Replace sort by grouping by zIndex
    thingsToRender.sort((t1, t2) => t1[1].zIndex - t2[1].zIndex);

    for (const value of thingsToRender) {
      switch (value[0]) {
        case "canvasRectangle":
          canvasCtx.beginPath();
          canvasCtx.strokeStyle = value[1].strokeStyle;
          canvasCtx.strokeRect(
            value[1].x,
            value[1].y,
            value[1].width,
            value[1].height
          );
          break;
        case "canvasLine":
          canvasCtx.beginPath();
          canvasCtx.strokeStyle = value[1].strokeStyle;
          canvasCtx.moveTo(value[1].x1, value[1].y1);
          canvasCtx.lineTo(value[1].x2, value[1].y2);
          canvasCtx.stroke();
          break;
        case "canvasText":
          canvasCtx.beginPath();
          canvasCtx.strokeStyle = value[1].strokeStyle;
          canvasCtx.font = value[1].font;
          canvasCtx.strokeText(value[1].text, value[1].x, value[1].y);
          break;
        case "canvasSprite":
          if (value[1]?.image === void 0) continue;
          canvasCtx.drawImage(value[1].image, value[1].x, value[1].y);
          break;
      }
    }
  };
};

// TODO: Refactor
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

export const UserControl: System<Pick<
  BaseComponents,
  "userControl" | "velocity"
>> = function UserControl(world) {
  World.entitiesWithComponents(
    ["userControl", "velocity"] as const,
    world
  ).forEach(([_, userControl, velocity]) => {
    const vx = 0.02;
    const vy = 0.02;

    if (keyState.right) velocity.x += vx;
    if (keyState.left) velocity.x -= vx;
    if (keyState.up) velocity.y -= vy;
    if (keyState.down) velocity.y += vy;
  });
};

export const DisplayVelocity: System<Pick<
  BaseComponents,
  "velocity" | "position" | "canvasText"
>> = function DisplayVelocity(world) {
  World.entitiesWithComponents(
    ["canvasText", "velocity", "position"] as const,
    world
  ).forEach(([_, canvasText, velocity, position]) => {
    canvasText.x = position.x;
    canvasText.y = position.y;
    canvasText.text = `${velocity.x} ${velocity.y}`;
  });
};

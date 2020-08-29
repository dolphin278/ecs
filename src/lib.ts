export type Entity = number;

type ComponentHolder<Components> = {
  [K in keyof Components]: Map<Entity, Components[K]>;
};

export interface World<Components> {
  currentTime: number;
  lastAssignedId: number;
  activeEntitites: Set<Entity>;
  components: ComponentHolder<Components>;
}

export interface System<Components> {
  (world: Readonly<World<Components>>, delta: number): void;
}

export interface BaseComponents {
  position: Components.Position;
  velocity: Components.Velocity;
  acceleration: Components.Acceleration;
  force: Components.Force;
  mass: Components.Mass;
  spring: Components.Spring;
  userControl: Components.UserControlled;
  canvasRectangle: Components.CanvasRectangle;
  canvasLine: Components.CanvasLine;
  canvasText: Components.CanvasText;
  canvasSpritePosition: Components.CanvasSpritePosition;
  canvasSprite: Components.CanvasSprite;
}

export module World {
  export function createEntity<T>(world: World<T>): Entity {
    const id = ++world.lastAssignedId;
    world.activeEntitites.add(id);
    return id;
  }

  export function createEntityFromComponents<T, K extends keyof T>(
    world: World<T>,
    components: Pick<T, K>
  ) {
    const id = createEntity(world);
    for (const component of Object.keys(components) as Array<
      keyof typeof components
    >)
      world.components[component].set(id, components[component]);
    return id;
  }

  export function removeEntity<T>(
    { components, activeEntitites }: World<T>,
    entity: Entity
  ): void {
    for (const componentName of Object.keys(components) as Array<keyof T>)
      components[componentName].delete(entity);
    activeEntitites.delete(entity);
  }

  type PickComponents<Holder, Selection extends ReadonlyArray<keyof Holder>> = {
    [K in keyof Selection]: Selection[K] extends keyof Holder
      ? Holder[Selection[K]]
      : never;
  };

  export function entitiesWithComponents<T, K extends ReadonlyArray<keyof T>>(
    components: K,
    world: World<T>
  ): Array<[Entity, ...PickComponents<T, K>]> {
    const result: any[] = [];
    const row: any[] = [];
    const firstComponent = world.components[components[0]];
    if (firstComponent === void 0) return result;
    entityLoop: for (const [entity, firstComponentValue] of firstComponent) {
      row[0] = entity;
      row[1] = firstComponentValue;
      for (var i = 1; i < components.length; i++) {
        var data = world.components[components[i]].get(entity);
        if (data === void 0) continue entityLoop;
        row[i + 1] = data;
      }
      result.push(row.slice());
    }
    return result;
  }
}

export module Components {
  type Vector2 = Utils.Vector2.Vector2;

  export interface Position extends Vector2 {}
  export interface Velocity extends Vector2 {}
  export interface Acceleration extends Vector2 {}
  export interface Force extends Vector2 {}
  export interface Mass {
    value: number;
  }

  export interface Spring {
    entity1: Entity;
    entity2: Entity;
    k: number;
    originalDistance: number;
  }

  export interface UserControlled {}

  export interface CanvasRectangle {
    strokeStyle: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }

  export interface CanvasLine {
    strokeStyle: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }

  export interface CanvasText extends Vector2 {
    text: string;
    font: string;
    strokeStyle: string;
  }

  export interface CanvasSpritePosition extends Vector2 {}

  export interface CanvasSprite extends ImageBitmap {}
}

export module Systems {
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
      Partial<
        Pick<BaseComponents, "userControl" | "canvasSpritePosition" | "mass">
      >
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
      ["canvasSpritePosition", "position"] as const,
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
  ) => System<
    Partial<
      Pick<
        BaseComponents,
        | "canvasRectangle"
        | "canvasLine"
        | "canvasText"
        | "canvasSprite"
        | "canvasSpritePosition"
      >
    >
  > = (canvas) => {
    const canvasCtx = canvas.getContext("2d")!;
    return function CanvasRender(world, delta) {
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      if (world.components.canvasRectangle) {
        for (const _canvasRect of world.components.canvasRectangle.values()) {
          const canvasRect = _canvasRect!;
          canvasCtx.beginPath();
          canvasCtx.strokeStyle = canvasRect.strokeStyle;
          canvasCtx.strokeRect(
            canvasRect.x,
            canvasRect.y,
            canvasRect.width,
            canvasRect.height
          );
        }
      }

      if (world.components.canvasLine) {
        for (const _canvasLine of world.components.canvasLine.values()) {
          const canvasLine = _canvasLine!;
          canvasCtx.beginPath();
          canvasCtx.strokeStyle = canvasLine.strokeStyle;
          canvasCtx.moveTo(canvasLine.x1, canvasLine.y1);
          canvasCtx.lineTo(canvasLine.x2, canvasLine.y2);
          canvasCtx.stroke();
        }
      }

      if (world.components.canvasText) {
        for (const _canvasText of world.components.canvasText.values()) {
          const canvasText = _canvasText!;
          canvasCtx.beginPath();
          canvasCtx.strokeStyle = canvasText.strokeStyle;
          canvasCtx.font = canvasText.font;
          canvasCtx.strokeText(canvasText.text, canvasText.x, canvasText.y);
        }
      }

      if (
        world.components.canvasSprite &&
        world.components.canvasSpritePosition
      ) {
        World.entitiesWithComponents(
          ["canvasSprite", "canvasSpritePosition"] as const,
          world
        ).forEach(([_, sprite, position]) => {
          canvasCtx.drawImage(sprite!, position!.x, position!.y);
        });
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
}

export module Utils {
  export module Vector2 {
    export interface Vector2 {
      x: number;
      y: number;
    }

    export function make(x: number, y: number): Vector2 {
      return { x: +x, y: +y };
    }

    export function setToZero(out: Vector2) {
      out.x = 0.0;
      out.y = 0.0;
    }

    export function addVecMultiplyByScalar(
      out: Vector2,
      arg: Vector2,
      scalar: number
    ) {
      out.x += arg.x * scalar;
      out.y += arg.y * scalar;
    }

    export function addVec(out: Vector2, arg: Vector2) {
      out.x += arg.x;
      out.y += arg.y;
    }

    export function subVec(out: Vector2, arg: Vector2) {
      out.x -= arg.x;
      out.y -= arg.y;
    }

    export function diff(vec1: Vector2, vec2: Vector2, out: Vector2) {
      out.x = vec1.x - vec2.x;
      out.y = vec1.y - vec2.y;
    }

    export function moduleSquare(vec: Vector2) {
      return vec.x * vec.x + vec.y * vec.y;
    }

    export function isZero(vec: Vector2) {
      return vec.x === 0 && vec.y === 0;
    }

    export function module(vec: Vector2) {
      return Math.sqrt(moduleSquare(vec));
    }
  }
}

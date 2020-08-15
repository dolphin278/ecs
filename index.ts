console.log("Hello, world");

import {
  Entity,
  PositionComponent,
  VelocityComponent,
  AccelerationComponent,
  ForceComponent,
  MassComponent,
  CanvasRenderComponent,
  JointComponent,
  UserControlledComponent,
} from "./components";
import {
  UserControlSystem,
  MovementSystem,
  BounceSystem,
  AccelerationSystem,
  ForceResetSystem,
  GravityForceSystem,
  JointSystem,
  ApplyForceSystem,
  PhysicsRenderSystem,
  CanvasRenderSystem,
  CanvasCleanSystem,
} from "./systems";
import { init } from "./init";

// type ComponentsFromEntity<T> = {[K in keyof T]: Map<Entity, T[K]>}

export interface World {
  entities: Entity[];
  components: {
    positionComponent: Map<Entity, PositionComponent>;
    velocityComponent: Map<Entity, VelocityComponent>;
    accelerationComponent: Map<Entity, AccelerationComponent>;
    forceComponent: Map<Entity, ForceComponent>;
    massComponent: Map<Entity, MassComponent>;
    canvasRenderComponent: Map<Entity, CanvasRenderComponent>;
    jointComponent: Map<Entity, JointComponent>;
    userControlComponent: Map<Entity, UserControlledComponent>;
  };
  currentTime: number;
}

function tick(world: World, delta: number) {
  UserControlSystem(world, delta);
  MovementSystem(world, delta);
  BounceSystem(world, delta);
  AccelerationSystem(world, delta);
  ForceResetSystem(world, delta);
  GravityForceSystem(world);
  JointSystem(world);
  ApplyForceSystem(world, delta);
  // ConsoleRenderSystem(world);
  PhysicsRenderSystem(world);
  CanvasCleanSystem();
  CanvasRenderSystem(world, delta);
}

const world: World = {
  entities: [],
  currentTime: 0,
  components: {
    positionComponent: new Map(),
    velocityComponent: new Map(),
    accelerationComponent: new Map(),
    forceComponent: new Map(),
    massComponent: new Map(),
    canvasRenderComponent: new Map(),
    jointComponent: new Map(),
    userControlComponent: new Map()
  },
};

init(world);

let t0 = performance.now();

const render = (currentTime: number) => {
  const delta = currentTime - t0;
  t0 += delta;
  console.log("tick");
  tick(world, delta);
  requestAnimationFrame(render);
};

requestAnimationFrame(render);

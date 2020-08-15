console.log("Hello, world");

import { Entity } from "./components";
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

export class World {
  constructor(public entities: Entity[], public currentTime: number = 0) {}

  tick(delta: number) {
    UserControlSystem(this, delta);
    MovementSystem(this, delta);
    BounceSystem(this, delta);
    AccelerationSystem(this, delta);
    ForceResetSystem(this, delta);
    GravityForceSystem(this);
    JointSystem(this, delta);
    ApplyForceSystem(this, delta);
    // ConsoleRenderSystem(this);
    PhysicsRenderSystem(this);
    CanvasCleanSystem();
    CanvasRenderSystem(this, delta);
  }
}

export const entities = init([]);

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

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
  PhysicsRender,
  CanvasRenderSystem,
} from "./systems";
import { init } from "./init";

export class World {
  constructor(public entities: Entity[], public currentTime: number = 0) {}

  tick(delta: number) {
    UserControlSystem(this);
    MovementSystem(this, delta);
    BounceSystem(this);
    AccelerationSystem(this, delta);
    ForceResetSystem(this);
    GravityForceSystem(this);
    JointSystem(this);
    ApplyForceSystem(this);
    // ConsoleRenderSystem(this);
    PhysicsRender(this);
    CanvasRenderSystem(this);
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

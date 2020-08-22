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
  CanvasTextComponent,
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
  CanvasTextRenderSystem,
  DisplayVelocitySystem,
} from "./systems";
import { init } from "./init";

export function createEntity(world: World): Entity {
  const id = ++world.lastAssignedId;
  world.entities.push(id);
  return id;
}

export function removeEntity(world: World, entity: Entity) {
  for (const key of Object.keys(world.components))
    world.components[key as keyof World["components"]].delete(entity);
  const position = world.entities.indexOf(entity);
  if (position !== -1) world.entities.splice(position, 1);
}

export interface World {
  lastAssignedId: number;
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
    canvasTextComponent: Map<Entity, CanvasTextComponent>;
  };
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
  DisplayVelocitySystem(world, delta);
  
  CanvasCleanSystem();
  CanvasRenderSystem(world, delta);
  CanvasTextRenderSystem(world, delta);
}

const world: World = {
  lastAssignedId: 0,
  entities: [],
  components: {
    positionComponent: new Map(),
    velocityComponent: new Map(),
    accelerationComponent: new Map(),
    forceComponent: new Map(),
    massComponent: new Map(),
    canvasRenderComponent: new Map(),
    jointComponent: new Map(),
    userControlComponent: new Map(),
    canvasTextComponent: new Map()
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

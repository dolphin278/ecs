import { WORLD_WIDTH, WORLD_HEIGHT } from "./systems";
import { World, createEntity } from "./index";

export function init(world: World) {
  const {
    entities,
    components: {
      positionComponent,
      velocityComponent,
      accelerationComponent,
      forceComponent,
      massComponent,
      jointComponent,
      userControlComponent,
    },
  } = world;
  const maxVelocity = 0.05;
  for (let i = 0; i < 1000; i++) {
    const entity = createEntity(world);
    positionComponent.set(entity, {
      x: (Math.random() * WORLD_WIDTH) | 0,
      y: (Math.random() * WORLD_HEIGHT) | 0,
    });
    velocityComponent.set(entity, {
      x: Math.random() * maxVelocity - maxVelocity / 2,
      y: Math.random() * maxVelocity - maxVelocity / 2,
    });
    accelerationComponent.set(entity, {
      x: 0,
      y: 0,
    });
    forceComponent.set(entity, {
      x: 0,
      y: 0,
    });
    massComponent.set(entity, {
      value: 10,
    });
  }

  // Star
  const stars = []
  for (let i = 0; i < 3; i++) {
    const entity = createEntity(world);
    stars.push(entity)
    userControlComponent.set(entity, true);
    positionComponent.set(entity, {
      x: (Math.random() * WORLD_WIDTH) | 0,
      y: (Math.random() * WORLD_HEIGHT) | 0,
    });
    velocityComponent.set(entity, {
      x: 0,
      y: 0,
    });
    forceComponent.set(entity, {
      x: 0,
      y: 0,
    });
    accelerationComponent.set(entity, {
      x: 0,
      y: 0,
    });
    massComponent.set(entity, {
      value: 1000,
    });
  }

  {
    const entity = createEntity(world);
    jointComponent.set(entity, {
      entity1: stars[0],
      entity2: stars[1],
      k: 1e-3,
      originalDistance: 100,
    });
  }

  {
    const entity = createEntity(world);
    jointComponent.set(entity, {
      entity1: stars[1],
      entity2: stars[2],
      k: 1e-3,
      originalDistance: 100,
    });
  }

  {
    const entity = createEntity(world);
    jointComponent.set(entity, {
      entity1: stars[0],
      entity2: stars[2],
      k: 1e-3,
      originalDistance: 100,
    });
  }

  return entities;
}

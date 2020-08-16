import { WORLD_WIDTH, WORLD_HEIGHT } from "./systems";
import { World } from "./index";
import { Entity } from "./components";

export function init({
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
}: World) {
  const maxVelocity = 0.05;
  for (let i = 0; i < 1000; i++) {
    const position = {
      x: (Math.random() * WORLD_WIDTH) | 0,
      y: (Math.random() * WORLD_HEIGHT) | 0,
    };
    const velocity = {
      x: Math.random() * maxVelocity - maxVelocity / 2,
      y: Math.random() * maxVelocity - maxVelocity / 2,
    };
    const acceleration = {
      x: 0,
      y: 0,
    };
    const force = {
      x: 0,
      y: 0,
    };
    const entity: Entity = {};
    positionComponent.set(entity, position);
    velocityComponent.set(entity, velocity);
    accelerationComponent.set(entity, acceleration);
    forceComponent.set(entity, force);
    massComponent.set(entity, {
      value: 10,
    });
    entities.push(entity);
  }

  // Stars

  const stars = [];
  for (let i = 0; i < 2; i++) {
    const position = {
      x: (Math.random() * WORLD_WIDTH) | 0,
      y: (Math.random() * WORLD_HEIGHT) | 0,
    };
    const velocity = {
      x: 0,
      y: 0,
    };
    const acceleration = {
      x: 0,
      y: 0,
    };
    const force = {
      x: 0,
      y: 0,
    };
    const entity: Entity = {};
    entities.push(entity);
    stars.push(entity);
    userControlComponent.set(entity, true);
    positionComponent.set(entity, position);
    velocityComponent.set(entity, velocity);
    forceComponent.set(entity, force);
    accelerationComponent.set(entity, acceleration);
    massComponent.set(entity, {
      value: 1000,
    });
  }

  const fixedStar = {};
  {
    const position = {
      x: (Math.random() * WORLD_WIDTH) | 0,
      y: (Math.random() * WORLD_HEIGHT) | 0,
    };
    const acceleration = {
      x: 0,
      y: 0,
    };
    const force = {
      x: 0,
      y: 0,
    };
    const entity: Entity = fixedStar;
    userControlComponent.set(entity, userControlComponent);
    positionComponent.set(entity, position);
    accelerationComponent.set(entity, acceleration);
    forceComponent.set(entity, force);
    massComponent.set(entity, {
      value: 1000,
    });
    entities.push(entity);
  }

  {
    const entity = {};
    jointComponent.set(entity, {
      entity1: fixedStar,
      entity2: stars[0],
      k: 1e-2,
      originalDistance: 100,
    });
    entities.push(entity);
  }

  {
    const entity = {};
    jointComponent.set(entity, {
      entity1: stars[0],
      entity2: stars[1],
      k: 5e-2,
      originalDistance: 100,
    });
    entities.push(entity);
  }

  {
    const entity = {};
    jointComponent.set(entity, {
      entity1: fixedStar,
      entity2: stars[1],
      k: 5e-2,
      originalDistance: 100,
    });
    entities.push(entity);
  }

  return entities;
}

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
    userControlComponent
  },
}: World) {
  const maxVelocity = 0.05;
  for (let i = 0; i < 40; i++) {
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
    const entity: Entity = {
      // position,
      // velocity: velocity,
      // acceleration: acceleration,
      // force: force,
      // mass: {
      //   value: 10,
      // },
      // canvasRender: {
      //   kind: "rect",
      //   strokeStyle: "red",
      //   x: 10,
      //   y: 10,
      //   width: 10,
      //   height: 10,
      // },
    };
    positionComponent.set(entity, position);
    velocityComponent.set(entity, velocity);
    accelerationComponent.set(entity, acceleration);
    forceComponent.set(entity, force);
    massComponent.set(entity, {
      value: 10,
    });
    entities.push(entity);
  }

  // Star
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
    const entity: Entity = {
      // userControl: {},
      // position,
      // acceleration: acceleration,
      // velocity: velocity,
      // force: force,
      // mass: {
      //   value: 1000,
      // },
    };
    entities.push(entity);
    userControlComponent.set(entity, true)
    positionComponent.set(entity, position);
    velocityComponent.set(entity, velocity);
    forceComponent.set(entity, force);
    accelerationComponent.set(entity, acceleration);
    massComponent.set(entity, {
      value: 1000,
    });
  }

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
    const entity: Entity = {
      // userControl: {},
      // position,
      // acceleration: acceleration,
      // force: force,
      // mass: ,
    };
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
      entity1: entities[entities.length - 2],
      entity2: entities[entities.length - 1],
      k: 1e-4,
      originalDistance: 100,
    });
    entities.push(entity);
  }

  {
    const entity = {};
    jointComponent.set(entity, {
      entity1: entities[entities.length - 4],
      entity2: entities[entities.length - 3],
      k: 1e-4,
      originalDistance: 100,
    });
    entities.push(entity);
  }

  return entities;
}

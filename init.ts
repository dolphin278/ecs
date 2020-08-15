import { WORLD_WIDTH, WORLD_HEIGHT } from "./systems";
import { Entity } from "./components";
export function init(entities: Entity[]) {
  const maxVelocity = 0.05;
  for (let i = 0; i < 40; i++) {
    entities.push({
      position: {
        x: (Math.random() * WORLD_WIDTH) | 0,
        y: (Math.random() * WORLD_HEIGHT) | 0,
      },
      velocity: {
        x: Math.random() * maxVelocity - maxVelocity / 2,
        y: Math.random() * maxVelocity - maxVelocity / 2,
      },
      acceleration: {
        x: 0,
        y: 0,
      },
      force: {
        x: 0,
        y: 0,
      },
      mass: {
        value: 10,
      },
      canvasRender: {
        kind: "rect",
        strokeStyle: "red",
        x: 10,
        y: 10,
        width: 10,
        height: 10,
      },
    });
  }

  // Star
  for (let i = 0; i < 2; i++) {
    entities.push({
      userControl: {},
      position: {
        x: (Math.random() * WORLD_WIDTH) | 0,
        y: (Math.random() * WORLD_HEIGHT) | 0,
      },
      acceleration: {
        x: 0,
        y: 0,
      },
      velocity: {
        x: 0,
        y: 0,
      },
      force: {
        x: 0,
        y: 0,
      },
      mass: {
        value: 1000,
      },
    });
  }
  entities.push({
    userControl: {},
    position: {
      x: (Math.random() * WORLD_WIDTH) | 0,
      y: (Math.random() * WORLD_HEIGHT) | 0,
    },
    acceleration: {
      x: 0,
      y: 0,
    },
    // velocity: {
    //   x: 0,
    //   y: 0,
    // },
    force: {
      x: 0,
      y: 0,
    },
    mass: {
      value: 1000,
    },
  });

  entities.push({
    joint: {
      entity1: entities[entities.length - 2],
      entity2: entities[entities.length - 1],
      k: 1e-4,
      originalDistance: 100,
    },
  });

  entities.push({
    joint: {
      entity1: entities[entities.length - 4],
      entity2: entities[entities.length - 3],
      k: 1e-4,
      originalDistance: 100,
    },
  });
  return entities;
}

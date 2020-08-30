console.log("Hello, world");
import type { BaseComponents } from "../../lib/components";
import type { Entity, World } from "../../lib/index";
import * as Systems from "../../lib/systems";
import { createEntityFromComponents } from "../../lib/world";

export interface PlaygroundComponents extends BaseComponents {}
export interface PlaygroundWorld extends World<PlaygroundComponents> {}

export const WORLD_WIDTH = 1000;
export const WORLD_HEIGHT = 500;

export function init(world: PlaygroundWorld) {
  const canvasSprite = world.components.canvasSprite;
  const maxVelocity = 0.05;
  const dots: Entity[] = [];

  for (let i = 0; i < 1000; i++) {
    const x = (Math.random() * WORLD_WIDTH) | 0;
    const y = (Math.random() * WORLD_HEIGHT) | 0;

    const entity = createEntityFromComponents(world, {
      canvasSprite: { x, y, zIndex: 1 },
      canvasRectangle: {
        x,
        y,
        width: 10,
        height: 10,
        strokeStyle: "red",
        zIndex: 0,
      },
      position: { x, y },
      velocity: {
        x: Math.random() * maxVelocity - maxVelocity / 2,
        y: Math.random() * maxVelocity - maxVelocity / 2,
      },
      acceleration: { x: 0, y: 0 },
      force: { x: 0, y: 0 },
      mass: { value: 10 },
    });
    dots.push(entity);
  }

  const image = new Image();
  image.src = "src/demos/playground/icon.png";

  image.onload = async () => {
    const sprite = await createImageBitmap(image);
    for (const entity of dots) canvasSprite.get(entity)!.image = sprite;
  };

  // Star
  const stars = [];
  for (let i = 0; i < 3; i++) {
    const x = (Math.random() * WORLD_WIDTH) | 0;
    const y = (Math.random() * WORLD_HEIGHT) | 0;
    const font = "10px Times New Roman";

    const entity = createEntityFromComponents(world, {
      userControl: true,
      canvasRectangle: {
        x,
        y,
        width: 10,
        height: 10,
        strokeStyle: "red",
        zIndex: 0,
      },
      canvasText: { text: "", font, strokeStyle: "black", x, y, zIndex: 0 },
      position: { x, y },
      velocity: { x: 0, y: 0 },
      force: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      mass: { value: 1000 },
    });
    stars.push(entity);
  }

  createEntityFromComponents(world, {
    spring: {
      entity1: stars[0],
      entity2: stars[1],
      k: 1e-5,
      originalDistance: 100,
    },
    canvasLine: { x1: 0, y1: 0, x2: 0, y2: 0, strokeStyle: "blue", zIndex: 0 },
  });

  createEntityFromComponents(world, {
    spring: {
      entity1: stars[1],
      entity2: stars[2],
      k: 1e-5,
      originalDistance: 100,
    },
    canvasLine: { x1: 0, y1: 0, x2: 0, y2: 0, strokeStyle: "blue", zIndex: 0 },
  });

  createEntityFromComponents(world, {
    spring: {
      entity1: stars[0],
      entity2: stars[2],
      k: 1e-5,
      originalDistance: 100,
    },
    canvasLine: { x1: 0, y1: 0, x2: 0, y2: 0, strokeStyle: "blue", zIndex: 0 },
  });

  createEntityFromComponents(world, {
    canvasText: {
      text: "Hello, world!",
      font: "100px Times New Roman",
      strokeStyle: "black",
      x: 100,
      y: 100,
      zIndex: 0,
    },
  });
}

const CanvasRender = Systems.CanvasRender(
  document.getElementById("canvasRender")! as HTMLCanvasElement
);
const BounceSystem = Systems.Bounce(WORLD_WIDTH, WORLD_HEIGHT);
function tick(world: PlaygroundWorld, delta: number) {
  Systems.UserControl(world, delta);
  Systems.Movement(world, delta);
  BounceSystem(world, delta);
  Systems.Acceleration(world, delta);
  Systems.ForceReset(world, delta);
  Systems.Gravity(world, delta);
  Systems.Spring(world, delta);
  Systems.ApplyForce(world, delta);
  Systems.DebugPhysicsRender(world, delta);
  Systems.DebugSpringRender(world, delta);
  Systems.DisplayVelocity(world, delta);

  CanvasRender(world, delta);
}

const world: PlaygroundWorld = {
  lastAssignedId: 0,
  currentTime: 0,
  activeEntitites: new Set(),
  components: {
    position: new Map(),
    velocity: new Map(),
    acceleration: new Map(),
    force: new Map(),
    mass: new Map(),
    spring: new Map(),
    userControl: new Map(),
    canvasRectangle: new Map(),
    canvasLine: new Map(),
    canvasText: new Map(),
    canvasSprite: new Map(),
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

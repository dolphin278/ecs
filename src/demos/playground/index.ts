console.log("Hello, world");
import * as Core from "../../lib";

export interface PlaygroundComponents extends Core.BaseComponents {}
export interface PlaygroundWorld extends Core.World<PlaygroundComponents> {}

export const WORLD_WIDTH = 1000;
export const WORLD_HEIGHT = 500;

export function init(world: PlaygroundWorld) {
  const {
    components: {
      position,
      velocity,
      acceleration,
      force,
      mass,
      spring,
      userControl,
      canvasText,
      canvasRectangle,
      canvasLine,
      canvasSpritePosition,
      canvasSprite,
    },
  } = world;
  const maxVelocity = 0.05;
  const dots: Core.Entity[] = [];
  for (let i = 0; i < 1000; i++) {
    const entity = Core.World.createEntity(world);
    const x = (Math.random() * WORLD_WIDTH) | 0;
    const y = (Math.random() * WORLD_HEIGHT) | 0;
    dots.push(entity);
    canvasSpritePosition.set(entity, {
      x,
      y,
    });
    canvasRectangle.set(entity, {
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      strokeStyle: "red",
    });
    position.set(entity, {
      x,
      y,
    });
    velocity.set(entity, {
      x: Math.random() * maxVelocity - maxVelocity / 2,
      y: Math.random() * maxVelocity - maxVelocity / 2,
    });
    acceleration.set(entity, {
      x: 0,
      y: 0,
    });
    force.set(entity, {
      x: 0,
      y: 0,
    });
    mass.set(entity, {
      value: 10,
    });
  }

  const image = new Image();
  image.src = "src/demos/playground/icon.png";

  image.onload = async () => {
    const sprite = await createImageBitmap(image);
    for (const entity of dots) canvasSprite.set(entity, sprite);
  };

  // Star
  const stars = [];
  for (let i = 0; i < 3; i++) {
    const entity = Core.World.createEntity(world);
    stars.push(entity);
    userControl.set(entity, true);
    canvasRectangle.set(entity, {
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      strokeStyle: "red",
    });
    canvasText.set(entity, {
      text: "",
      font: "10px Times New Roman",
      strokeStyle: "black",
      x: 0,
      y: 0,
    });
    position.set(entity, {
      x: (Math.random() * WORLD_WIDTH) | 0,
      y: (Math.random() * WORLD_HEIGHT) | 0,
    });
    velocity.set(entity, {
      x: 0,
      y: 0,
    });
    force.set(entity, {
      x: 0,
      y: 0,
    });
    acceleration.set(entity, {
      x: 0,
      y: 0,
    });
    mass.set(entity, {
      value: 1000,
    });
  }

  {
    const entity = Core.World.createEntity(world);
    spring.set(entity, {
      entity1: stars[0],
      entity2: stars[1],
      k: 1e-5,
      originalDistance: 100,
    });
    canvasLine.set(entity, {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
      strokeStyle: "blue",
    });
  }

  {
    const entity = Core.World.createEntity(world);
    spring.set(entity, {
      entity1: stars[1],
      entity2: stars[2],
      k: 1e-5,
      originalDistance: 100,
    });
    canvasLine.set(entity, {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
      strokeStyle: "blue",
    });
  }

  {
    const entity = Core.World.createEntity(world);
    spring.set(entity, {
      entity1: stars[0],
      entity2: stars[2],
      k: 1e-5,
      originalDistance: 100,
    });
    canvasLine.set(entity, {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
      strokeStyle: "blue",
    });
  }

  {
    const entity = Core.World.createEntity(world);
    canvasText.set(entity, {
      text: "Hello, world",
      font: "100px Times New Roman",
      strokeStyle: "black",
      x: 100,
      y: 100,
    });
  }
}

const CanvasRender = Core.Systems.CanvasRender(
  document.getElementById("canvasRender")! as HTMLCanvasElement
);
const Bounce = Core.Systems.Bounce(WORLD_WIDTH, WORLD_HEIGHT);
function tick(world: PlaygroundWorld, delta: number) {
  Core.Systems.UserControl(world, delta);
  Core.Systems.Movement(world, delta);
  Bounce(world, delta);
  Core.Systems.Acceleration(world, delta);
  Core.Systems.ForceReset(world, delta);
  Core.Systems.Gravity(world, delta);
  Core.Systems.Spring(world, delta);
  Core.Systems.ApplyForce(world, delta);
  Core.Systems.DebugPhysicsRender(world, delta);
  Core.Systems.DebugSpringRender(world, delta);
  Core.Systems.DisplayVelocity(world, delta);

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
    canvasSpritePosition: new Map(),
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

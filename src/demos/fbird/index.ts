console.log("Fbird demo");

import type { BaseComponents } from "../../lib/components";
import type { Entity, System as LibSystem, World } from "../../lib/index";
import { AcceleratedMovement } from "../../lib/systems/AcceleratedMovement";
import { make as makeCanvasRender } from "../../lib/systems/CanvasRender";
import { DebugPhysicsRender } from "../../lib/systems/DebugPhysicsRender";
import { Movement } from "../../lib/systems/Movement";
import * as Vector2 from "../../lib/utils/Vector2";
import {
  createEntityFromComponents,
  entitiesWithComponents,
} from "../../lib/world";

export interface FBirdComponents
  extends Pick<
    BaseComponents,
    | "position"
    | "velocity"
    | "acceleration"
    | "canvasRectangle"
    | "userControl"
    | "canvasSprite"
    | "canvasText"
    | "canvasLine"
  > {
  body: boolean;
  bird: {
    lastTimeKeyPressed: number;
    upSprite?: ImageBitmap;
    downSprite?: ImageBitmap;
  };
  pipe: boolean;
  passage: boolean;
  tile: boolean;
  score: { value: number };
  obstacle: {
    upperPipe: Entity;
    bottomPipe: Entity;
    passageHeight: number;
  };
}

export interface FBirdWorld extends World<FBirdComponents> {}
type System = LibSystem<FBirdComponents>;

const WORLD_WIDTH = 1000;
const WORLD_HEIGHT = 500;

const SPACE_BETWEEN_PIPES = 150;
const PIPE_WIDTH = 80;
const PIPE_HEIGHT = 500;
const PIPES_COUNT = WORLD_WIDTH / (SPACE_BETWEEN_PIPES + PIPE_WIDTH);

const BACKGROUND_TILE_WIDTH = 300;
const BACKGROUND_TILES_COUNT = WORLD_WIDTH / BACKGROUND_TILE_WIDTH + 1;

export function init(world: FBirdWorld) {
  const birdX = WORLD_WIDTH / 2;
  const birdY = WORLD_HEIGHT / 2;

  const bird = createEntityFromComponents(world, {
    bird: { lastTimeKeyPressed: 0 },
    userControl: {},
    position: { x: birdX, y: birdY },
    canvasSprite: { x: birdX, y: birdY, zIndex: 9 },
    velocity: { x: 0, y: 0 },
    acceleration: { x: 0, y: 0.0005 },
    body: true,
  });

  const upperPipes: Entity[] = [];
  const bottomPipes: Entity[] = [];

  for (let i = 0; i < PIPES_COUNT; i++) {
    const x = 700 + i * (SPACE_BETWEEN_PIPES + PIPE_WIDTH);
    const vx = -0.115;

    const passageHeight = 200;
    const passageY = WORLD_HEIGHT / 2;

    const upperPipe = createEntityFromComponents(world, {
      pipe: true,
      position: Vector2.makeZero(),
      velocity: Vector2.makeZero(),
      canvasSprite: { x, y: 0, zIndex: 5 },
    });
    upperPipes.push(upperPipe);

    const bottomPipe = createEntityFromComponents(world, {
      pipe: true,
      position: Vector2.makeZero(),
      velocity: Vector2.makeZero(),
      canvasSprite: { x, y: 0, zIndex: 5 },
    });
    bottomPipes.push(bottomPipe);

    const obstacle = createEntityFromComponents(world, {
      position: {
        x,
        y: passageY + ((Math.random() * WORLD_HEIGHT) / 2 - WORLD_HEIGHT / 4),
      },
      velocity: { x: vx, y: 0 },
      obstacle: {
        upperPipe,
        bottomPipe,
        passageHeight,
      },
    });
  }

  const backgroundTiles: Entity[] = [];
  for (let i = 0; i < BACKGROUND_TILES_COUNT; i++) {
    const x = i * BACKGROUND_TILE_WIDTH;
    const vx = -0.055;
    const tile = createEntityFromComponents(world, {
      position: { x, y: 400 },
      velocity: { x: vx, y: 0 },
      canvasSprite: { x, y: 100, zIndex: 3 },
      tile: true,
    });
    backgroundTiles.push(tile);
  }

  {
    const image = new Image();
    image.src = "assets/background.png";

    image.onload = async () => {
      const sprite = await createImageBitmap(image);
      for (const entity of backgroundTiles)
        world.components.canvasSprite.get(entity)!.image = sprite;
    };
  }

  const scoreDisplay = createEntityFromComponents(world, {
    score: {
      value: 0,
    },
    canvasText: {
      font: "50px Times New Roman",
      strokeStyle: "red",
      x: 10,
      y: 100,
      text: "Score:",
      zIndex: 10,
    },
  });

  {
    const image = new Image();
    image.src = "assets/bird-wings-up.png";

    image.onload = async () => {
      const sprite = await createImageBitmap(image);
      world.components.canvasSprite.get(bird)!.image = sprite;
      world.components.bird.get(bird)!.downSprite = sprite;
    };
  }

  {
    const image = new Image();
    image.src = "assets/bird-wings-down.png";

    image.onload = async () => {
      const sprite = await createImageBitmap(image);
      world.components.bird.get(bird)!.upSprite = sprite;
    };
  }

  {
    const image = new Image();
    image.src = "assets/pipe-upper.png";

    image.onload = async () => {
      const sprite = await createImageBitmap(image);
      // TODO: Use queries instead of upperPipes array
      for (const entity of upperPipes)
        world.components.canvasSprite.get(entity)!.image = sprite;
    };
  }

  {
    const image = new Image();
    image.src = "assets/pipe-bottom.png";

    image.onload = async () => {
      const sprite = await createImageBitmap(image);
      // TODO: Use queries instead of bottomPipes array
      for (const entity of bottomPipes)
        world.components.canvasSprite.get(entity)!.image = sprite;
    };
  }
}

module Systems {
  export const Obstacle: System = function (world) {
    const obstacles = entitiesWithComponents(
      ["obstacle", "position", "velocity"] as const,
      world
    );

    for (const [entity, obstacle, position, velocity] of obstacles) {
      const upperPipeVelocity = world.components.velocity.get(
        obstacle.upperPipe
      );
      if (upperPipeVelocity) Vector2.assign(upperPipeVelocity, velocity);
      const bottomPipeVelocity = world.components.velocity.get(
        obstacle.bottomPipe
      );
      if (bottomPipeVelocity) Vector2.assign(bottomPipeVelocity, velocity);

      const upperPipePosition = world.components.position.get(
        obstacle.upperPipe
      );
      if (upperPipePosition) {
        upperPipePosition.x = position.x;
        upperPipePosition.y =
          position.y - PIPE_HEIGHT - obstacle.passageHeight / 2;
      }
      const bottomPipePosition = world.components.position.get(
        obstacle.bottomPipe
      );
      if (bottomPipePosition) {
        bottomPipePosition.x = position.x;
        bottomPipePosition.y = position.y + obstacle.passageHeight / 2;
      }
    }
  };

  const keyState = {
    up: false,
    down: false,
    left: false,
    right: false,
  };
  document.addEventListener("keydown", (event) => {
    switch (event.keyCode) {
      case 37:
        keyState.left = true;
        break;
      case 38:
        keyState.up = true;
        break;
      case 39:
        keyState.right = true;
        break;
      case 40:
        keyState.down = true;
        break;
    }
  });
  document.addEventListener("keyup", (event) => {
    switch (event.keyCode) {
      case 37:
        keyState.left = false;
        break;
      case 38:
        keyState.up = false;
        break;
      case 39:
        keyState.right = false;
        break;
      case 40:
        keyState.down = false;
        break;
    }
  });

  export const UserControl: System = function UserControl(world, delta) {
    entitiesWithComponents(
      ["userControl", "bird", "velocity"] as const,
      world
    ).forEach(([_, userControl, bird, velocity]) => {
      if (bird.lastTimeKeyPressed < world.currentTime + delta - 500) {
        const vy = 0.3;
        if (keyState.up) {
          velocity.y = -vy;
          bird.lastTimeKeyPressed = world.currentTime + delta;
        }
      }
    });
  };

  export const PipeCollision: System = function PipeCollision(world) {
    const birds = entitiesWithComponents(["bird", "position"] as const, world);
    const pipes = entitiesWithComponents(["pipe", "position"] as const, world);

    for (const [_, _pipe, pipePosition] of pipes) {
      for (const [birdEntity, _bird, birdPosition] of birds) {
        if (
          birdPosition.x > pipePosition.x &&
          birdPosition.x < pipePosition.x + PIPE_WIDTH &&
          birdPosition.y > pipePosition.y &&
          birdPosition.y < pipePosition.y + PIPE_HEIGHT
        ) {
          world.components.bird.delete(birdEntity);
          return;
        }
      }
    }
  };

  export const BorderCollision: System = function Bounce(world) {
    entitiesWithComponents(
      ["body", "position", "velocity"] as const,
      world
    ).forEach(([bodyEntity, _body, position, velocity]) => {
      if (position.y > WORLD_HEIGHT - 40) {
        position.y = WORLD_HEIGHT - 40;
        velocity.y *= -0.5;
        world.components.bird.delete(bodyEntity);
      }
      if (position.y < 0) {
        position.y = 0;
        velocity.y = 0;
        world.components.bird.delete(bodyEntity);
      }
    });
  };

  export const RespawnObstacles: System = function RespawnPipes(world) {
    entitiesWithComponents(["obstacle", "position"] as const, world).forEach(
      ([_, obstacle, position]) => {
        if (position.x < -PIPE_WIDTH) {
          position.y = obstacle.passageHeight *= 0.8;
          position.x +=
            (SPACE_BETWEEN_PIPES + PIPE_WIDTH) * PIPES_COUNT +
            SPACE_BETWEEN_PIPES;

          for (const score of world.components.score.values()) score.value += 1;
        }
      }
    );
  };

  export const RespawnBackgroundTiles: System = function RespawnBackgroundTiles(
    world
  ) {
    entitiesWithComponents(["tile", "position"] as const, world).forEach(
      ([_, _tile, position]) => {
        if (position.x < -BACKGROUND_TILE_WIDTH) {
          position.x += BACKGROUND_TILE_WIDTH * BACKGROUND_TILES_COUNT;
        }
      }
    );
  };

  export const GameOver: System = function (world) {
    const birdsCount = world.components.bird.size;

    if (birdsCount === 0) {
      const gameOverMessage = world.components.canvasText.get(10000);
      if (gameOverMessage === void 0) {
        world.components.canvasText.set(10000, {
          zIndex: 10,
          text: "Game Over",
          font: "100px Times New Roman",
          strokeStyle: "orange",
          x: 250,
          y: 250,
        });
      }
      entitiesWithComponents(["obstacle", "velocity"] as const, world).forEach(
        ([_, _pipe, velocity]) => {
          velocity.x = 0;
        }
      );

      entitiesWithComponents(["tile", "velocity"] as const, world).forEach(
        ([_, _tile, velocity]) => {
          velocity.x = 0;
        }
      );
    }
  };

  export const DisplayScore: System = function (world) {
    entitiesWithComponents(["score", "canvasText"] as const, world).forEach(
      ([_, score, canvasText]) => {
        canvasText.text = `Score: ${score.value}`;
      }
    );
  };

  export const Flap: System = function (world) {
    entitiesWithComponents(
      ["bird", "canvasSprite", "velocity"] as const,
      world
    ).forEach(([_, bird, sprite, velocity]) => {
      sprite.image = velocity.y > 0 ? bird.downSprite : bird.upSprite;
    });
  };
}

const CanvasRender = makeCanvasRender(
  document.getElementById("canvasRender")! as HTMLCanvasElement
);

function tick(world: FBirdWorld, delta: number) {
  Systems.UserControl(world, delta);

  Systems.Flap(world, delta);
  Systems.DisplayScore(world, delta);
  Systems.RespawnObstacles(world, delta);
  Systems.RespawnBackgroundTiles(world, delta);
  Systems.GameOver(world, delta);
  Systems.Obstacle(world, delta);

  Systems.BorderCollision(world, delta);
  Systems.PipeCollision(world, delta);

  AcceleratedMovement(world, delta);
  Movement(world, delta);
  DebugPhysicsRender(world, delta);

  CanvasRender(world, delta);
  world.currentTime += delta;
}

const world: FBirdWorld = {
  lastAssignedId: 0,
  currentTime: 0,
  activeEntitites: new Set(),
  components: {
    obstacle: new Map(),
    body: new Map(),
    score: new Map(),
    passage: new Map(),
    canvasText: new Map(),
    bird: new Map(),
    pipe: new Map(),
    tile: new Map(),
    position: new Map(),
    velocity: new Map(),
    acceleration: new Map(),
    userControl: new Map(),
    canvasRectangle: new Map(),
    canvasSprite: new Map(),
    canvasLine: new Map(),
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

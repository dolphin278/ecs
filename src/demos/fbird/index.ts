console.log("Fbird demo");

import * as Core from "../../lib";

export interface FBirdComponents
  extends Pick<
    Core.BaseComponents,
    | "position"
    | "velocity"
    | "acceleration"
    | "canvasRectangle"
    | "userControl"
    | "canvasSprite"
    | "canvasSpritePosition"
    | "canvasText"
  > {
  bird: {
    lastTimeKeyPressed: number;
  };
  pipe: boolean;
  tile: boolean;
  score: { value: number };
  gameState: "active" | "over";
}

export interface FBirdWorld extends Core.World<FBirdComponents> {}

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

  const gameState = Core.World.createEntityFromComponents(world, {
    gameState: "active",
  });

  const bird = Core.World.createEntityFromComponents(world, {
    bird: { lastTimeKeyPressed: 0 },
    userControl: {},
    position: { x: birdX, y: birdY },
    // canvasRectangle: {
    //   x: birdX,
    //   y: birdY,
    //   width: 10,
    //   height: 10,
    //   strokeStyle: "red",
    // },
    canvasSpritePosition: { x: birdX, y: birdY },
    velocity: { x: 0, y: 0 },
    acceleration: { x: 0, y: 0.0005 },
  });

  const upperPipes: Core.Entity[] = [];
  const bottomPipes: Core.Entity[] = [];

  for (let i = 0; i < PIPES_COUNT; i++) {
    const x = i * (SPACE_BETWEEN_PIPES + PIPE_WIDTH);
    const vx = -0.115;
    // const vx = 0;
    let y = -360;
    const upperPipe = Core.World.createEntityFromComponents(world, {
      pipe: true,
      position: { x, y },
      velocity: { x: vx, y: 0 },
      canvasSpritePosition: { x, y },
      // canvasRectangle: {
      //   strokeStyle: "blue",
      //   x,
      //   y,
      //   width: PIPE_WIDTH,
      //   height: 500,
      // },
    });
    upperPipes.push(upperPipe);

    y = 400;
    const bottomPipe = Core.World.createEntityFromComponents(world, {
      pipe: true,
      position: { x, y },
      velocity: { x: vx, y: 0 },
      canvasSpritePosition: { x, y },

      // canvasRectangle: {
      //   strokeStyle: "blue",
      //   x,
      //   y,
      //   width: PIPE_WIDTH,
      //   height: 500,
      // },
    });
    bottomPipes.push(bottomPipe);
  }

  const backgroundTiles: Core.Entity[] = [];
  for (let i = 0; i < BACKGROUND_TILES_COUNT; i++) {
    const x = i * BACKGROUND_TILE_WIDTH;
    const vx = -0.055;
    const tile = Core.World.createEntityFromComponents(world, {
      position: { x, y: 400 },
      velocity: { x: vx, y: 0 },
      canvasSpritePosition: { x, y: 100 },
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
        world.components.canvasSprite.set(entity, sprite);
    };
  }

  const scoreDisplay = Core.World.createEntityFromComponents(world, {
    score: {
      value: 0,
    },
    canvasText: {
      font: "50px Times New Roman",
      strokeStyle: "red",
      x: 10,
      y: 100,
      text: "Score:",
    },
  });

  {
    const image = new Image();
    image.src = "assets/bird-wings-up.png";

    image.onload = async () => {
      const sprite = await createImageBitmap(image);
      world.components.canvasSprite.set(bird, sprite);
    };
  }

  {
    const image = new Image();
    image.src = "assets/pipe-upper.png";

    image.onload = async () => {
      const sprite = await createImageBitmap(image);
      for (const entity of upperPipes)
        world.components.canvasSprite.set(entity, sprite);
    };
  }

  {
    const image = new Image();
    image.src = "assets/pipe-bottom.png";

    image.onload = async () => {
      const sprite = await createImageBitmap(image);
      for (const entity of bottomPipes)
        world.components.canvasSprite.set(entity, sprite);
    };
  }
}

module Systems {
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

  export const UserControl: Core.System<FBirdComponents> = function UserControl(
    world,
    delta
  ) {
    for (const [_, state] of world.components.gameState) {
      if (state === "over") return;
    }
    Core.World.entitiesWithComponents(
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

  const gameOver = () => {
    for (const entity of world.components.gameState.keys()) {
      world.components.gameState.set(entity, "over");
    }
  };

  export const PipeCollision: Core.System<FBirdComponents> = function PipeCollision(
    world
  ) {
    const birds = Core.World.entitiesWithComponents(
      ["bird", "position"] as const,
      world
    );
    const pipes = Core.World.entitiesWithComponents(
      ["pipe", "position"] as const,
      world
    );

    for (const [_, _pipe, pipePosition] of pipes) {
      for (const [_, _bird, birdPosition] of birds) {
        if (
          birdPosition.x > pipePosition.x &&
          birdPosition.x < pipePosition.x + PIPE_WIDTH &&
          birdPosition.y > pipePosition.y &&
          birdPosition.y < pipePosition.y + PIPE_HEIGHT
        ) {
          gameOver();
          return;
        }
      }
    }
  };

  export const Bounce: Core.System<FBirdComponents> = function Bounce(world) {
    Core.World.entitiesWithComponents(
      ["bird", "position", "velocity"] as const,
      world
    ).forEach(([_, _bird, position, velocity]) => {
      if (position.y > WORLD_HEIGHT - 40) {
        position.y = WORLD_HEIGHT - 40;
        velocity.y *= -0.5;
        gameOver();
      }
      if (position.y < 0) {
        position.y = 0;
        velocity.y = 0;
        gameOver();
      }
    });
  };

  export const RespawnPipes: Core.System<FBirdComponents> = function RespawnPipes(
    world
  ) {
    Core.World.entitiesWithComponents(
      ["pipe", "position"] as const,
      world
    ).forEach(([_, _pipe, position]) => {
      if (position.x < -PIPE_WIDTH) {
        position.x +=
          (SPACE_BETWEEN_PIPES + PIPE_WIDTH) * PIPES_COUNT +
          SPACE_BETWEEN_PIPES;
      }
    });
  };

  export const RespawnBackgroundTiles: Core.System<FBirdComponents> = function RespawnBackgroundTiles(
    world
  ) {
    Core.World.entitiesWithComponents(
      ["tile", "position"] as const,
      world
    ).forEach(([_, _tile, position]) => {
      if (position.x < -BACKGROUND_TILE_WIDTH) {
        position.x += BACKGROUND_TILE_WIDTH * BACKGROUND_TILES_COUNT;
      }
    });
  };

  export const GameOver: Core.System<FBirdComponents> = function (world) {
    for (const [entity, state] of world.components.gameState) {
      if (state === "over") {
        const gameOverMessage = world.components.canvasText.get(entity);
        if (gameOverMessage === void 0) {
          world.components.canvasText.set(entity, {
            text: "Game Over",
            font: "100px Times New Roman",
            strokeStyle: "orange",
            x: 250,
            y: 250,
          });
        }

        Core.World.entitiesWithComponents(
          ["pipe", "velocity"] as const,
          world
        ).forEach(([_, _pipe, velocity]) => {
          velocity.x = 0;
        });

        Core.World.entitiesWithComponents(
          ["tile", "velocity"] as const,
          world
        ).forEach(([_, _tile, velocity]) => {
          velocity.x = 0;
        });
      }
    }
  };

  export const DisplayScore: Core.System<FBirdComponents> = function (world) {
    const display = Core.World.entitiesWithComponents(
      ["score", "canvasText"] as const,
      world
    );
    for (const [_, score, canvasText] of display)
      canvasText.text = `Score: ${score.value}`;
  };
}

const CanvasRender = Core.Systems.CanvasRender(
  document.getElementById("canvasRender")! as HTMLCanvasElement
);
const Bounce = Core.Systems.Bounce(WORLD_WIDTH, WORLD_HEIGHT);
function tick(world: FBirdWorld, delta: number) {
  // Core.Systems.UserControl(world, delta);
  Systems.UserControl(world, delta);
  Core.Systems.Movement(world, delta);

  Systems.DisplayScore(world, delta);
  Systems.RespawnPipes(world, delta);
  Systems.RespawnBackgroundTiles(world, delta);
  Systems.GameOver(world, delta);

  Systems.Bounce(world, delta);
  Systems.PipeCollision(world, delta);
  // Bounce(world, delta);
  Core.Systems.Acceleration(world, delta);
  // Core.Systems.ForceReset(world, delta);
  // Core.Systems.Gravity(world, delta);
  // Core.Systems.Spring(world, delta);
  // Core.Systems.ApplyForce(world, delta);
  Core.Systems.DebugPhysicsRender(world, delta);
  // Core.Systems.DebugSpringRender(world, delta);
  // Core.Systems.DisplayVelocity(world, delta);

  CanvasRender(world, delta);
  world.currentTime += delta;
}

const world: FBirdWorld = {
  lastAssignedId: 0,
  currentTime: 0,
  activeEntitites: new Set(),
  components: {
    score: new Map(),
    canvasText: new Map(),
    gameState: new Map(),
    bird: new Map(),
    pipe: new Map(),
    tile: new Map(),
    position: new Map(),
    velocity: new Map(),
    acceleration: new Map(),
    // force: new Map(),
    // mass: new Map(),
    // spring: new Map(),
    userControl: new Map(),
    canvasRectangle: new Map(),
    // canvasLine: new Map(),
    // canvasText: new Map(),
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

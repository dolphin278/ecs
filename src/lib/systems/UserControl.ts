import type { UserControlled, Velocity } from "../components";
import type { System } from "../index";
import { entitiesWithComponents } from "../world";

interface Components {
  userControl: UserControlled;
  velocity: Velocity;
}

const query = (["userControl", "velocity"] as const);

// TODO: Refactor
export const make: (document: HTMLDocument) => System<Components> = (
  document: HTMLDocument
) => {
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

  return function UserControl(world) {
    entitiesWithComponents(query, world).forEach(
      ([_, _userControl, velocity]) => {
        const vx = 0.02;
        const vy = 0.02;

        if (keyState.right) velocity.x += vx;
        if (keyState.left) velocity.x -= vx;
        if (keyState.up) velocity.y -= vy;
        if (keyState.down) velocity.y += vy;
      }
    );
  };
};

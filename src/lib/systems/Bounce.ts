import type { Position, Velocity } from "../components";
import type { System } from "../index";
import { entitiesWithComponents } from "../world";

interface Components {
  velocity: Velocity;
  position: Position;
}

const query = ["position", "velocity"] as const;
export const make = (
  WORLD_WIDTH: number,
  WORLD_HEIGHT: number
): System<Components> =>
  function Bounce(world, _delta) {
    entitiesWithComponents(query, world).forEach(([_, position, velocity]) => {
      if (position.x > WORLD_WIDTH) {
        position.x = WORLD_WIDTH;
        velocity.x *= -0.2;
      } else if (position.x < 0) {
        position.x = 0;
        velocity.x *= -0.2;
      }

      if (position.y > WORLD_HEIGHT) {
        position.y = WORLD_HEIGHT;
        velocity.y *= -0.2;
      } else if (position.y < 0) {
        position.y = 0;
        velocity.y *= -0.2;
      }
    });
  };

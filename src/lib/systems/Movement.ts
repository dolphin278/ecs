import type { Position, Velocity } from "../components";
import type { System } from "../index";
import { entitiesWithComponents } from "../world";
import { addVecMultiplyByScalar } from "../utils/Vector2";

const query = ["position", "velocity"] as const;

interface Components {
  position: Position;
  velocity: Velocity;
}

export const Movement: System<Components> = function Movement(world, delta) {
  entitiesWithComponents(query, world).forEach(([_, position, velocity]) =>
    addVecMultiplyByScalar(position, velocity, delta)
  );
};

import type { Acceleration, Position, Velocity } from "../components";
import type { System } from "../index";
import { entitiesWithComponents } from "../world";
import { addVecMultiplyByScalar } from "../utils/Vector2";

interface Components {
  velocity: Velocity;
  acceleration: Acceleration;
}

const query = ["acceleration", "velocity"] as const;

export const AcceleratedMovement: System<Components> = function Acceleration(
  world,
  delta
) {
  entitiesWithComponents(query, world).forEach(([_, acceleration, velocity]) =>
    addVecMultiplyByScalar(velocity, acceleration, delta)
  );
};

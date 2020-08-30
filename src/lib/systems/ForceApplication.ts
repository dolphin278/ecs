import type { Acceleration, Mass, Force } from "../components";
import type { System } from "../index";
import { entitiesWithComponents } from "../world";
import { addVecMultiplyByScalar, setToZero } from "../utils/Vector2";

interface Components {
  acceleration: Acceleration;
  mass: Mass;
  force: Force;
}

const query = ["mass", "force", "acceleration"] as const;

export const ForceApplication: System<Components> = function ForceApplication(
  world,
  delta
) {
  entitiesWithComponents(
    query,
    world
  ).forEach(([_, mass, force, acceleration]) =>
    addVecMultiplyByScalar(acceleration, force, 1 / mass.value)
  );
};

export const ForceReset: System<Pick<
  Components,
  "force"
>> = function ForceReset(world) {
  for (const force of world.components.force.values()) setToZero(force);
};

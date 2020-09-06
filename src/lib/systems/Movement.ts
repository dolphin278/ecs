import type { EntityMovedEvent, Position, Velocity } from "../components";
import type { System } from "../index";
import { entitiesWithComponents } from "../world";
import { addVecMultiplyByScalar, isZero } from "../utils/Vector2";

const query = ["position", "velocity"] as const;

interface Components {
  position: Position;
  velocity: Velocity;
  entityMovedEvent: EntityMovedEvent;
}

export const Movement: System<Components> = function Movement(world, delta) {
  const { entityMovedEvent } = world.components;
  entityMovedEvent.clear();

  entitiesWithComponents(query, world).forEach(
    ([entity, position, velocity]) => {
      if (!isZero(velocity)) {
        entityMovedEvent.set(entity, true);
        addVecMultiplyByScalar(position, velocity, delta);
      }
    }
  );
};

import type { Force, Position, Spring as SpringComponent } from "../components";
import type { System } from "../index";
import {
  addVecMultiplyByScalar,
  diff,
  isZero,
  make,
  module,
} from "../utils/Vector2";
import { removeEntity } from "../world";

interface Components {
  spring: SpringComponent;
  force: Force;
  position: Position;
}

const d = make(0.0, 0.0);

export const Spring: System<Components> = function Spring(world) {
  var force = world.components.force;
  var position = world.components.position;
  for (var [entity, spring] of world.components.spring) {
    if (
      !world.activeEntitites.has(spring.entity1) ||
      !world.activeEntitites.has(spring.entity2)
    ) {
      removeEntity(world, entity);
      continue;
    }

    var e1Force = force.get(spring.entity1);
    if (e1Force === void 0) continue;

    var e2Force = force.get(spring.entity2);
    if (e2Force === void 0) continue;

    var e1Position = position.get(spring.entity1);
    if (e1Position === void 0) continue;

    var e2Position = position.get(spring.entity2);
    if (e2Position === void 0) continue;

    diff(e2Position, e1Position, d);

    if (isZero(d)) continue;

    var distance = module(d);
    var forceModule =
      (-(spring.originalDistance - distance) * spring.k) / distance;

    addVecMultiplyByScalar(e1Force, d, forceModule);
    addVecMultiplyByScalar(e2Force, d, -forceModule);
  }
};

import type { Force, Mass, Position } from "../components";
import type { System } from "../index";
import {
  addVecMultiplyByScalar,
  diff,
  isZero,
  make,
  module,
  moduleSquare,
} from "../utils/Vector2";
import { entitiesWithComponents } from "../world";

interface Components {
  mass: Mass;
  force: Force;
  position: Position;
}

const GRAVITY_CONST = 6.67e-11;

const query = (["mass", "force", "position"] as const);

const d = make(0.0, 0.0);
export const Gravitation: System<Components> = function Gravitation(world) {
  const entities = entitiesWithComponents(
    query,
    world
  );
  for (var i = 0; i < entities.length - 1; i++) {
    var [_, mass1, force1, position1] = entities[i];
    for (var j = i + 1; j < entities.length; j++) {
      var [_, mass2, force2, position2] = entities[j];
      diff(position2, position1, d);
      if (isZero(d)) continue;
      var dModule = module(d);
      var forceModule =
        (GRAVITY_CONST * mass1.value * mass2.value) / moduleSquare(d) / dModule;
      addVecMultiplyByScalar(force1, d, forceModule);
      addVecMultiplyByScalar(force2, d, -forceModule);
    }
  }
};

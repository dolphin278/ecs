import type { CanvasLine, Position, Spring } from "../components";
import type { System } from "../index";
import { entitiesWithComponents } from "../world";

interface Components {
  spring: Spring;
  position: Position;
  canvasLine: CanvasLine;
}

const query = ["spring", "canvasLine"] as const;
export const DebugSpringRender: System<Components> = function DebugSpringRender(
  world
) {
  entitiesWithComponents(query, world).forEach(([_, spring, canvasLine]) => {
    var e1Position = world.components.position.get(spring.entity1);
    if (e1Position === void 0) return;
    var e2Position = world.components.position.get(spring.entity2);
    if (e2Position === void 0) return;
    canvasLine.x1 = e1Position.x;
    canvasLine.y1 = e1Position.y;
    canvasLine.x2 = e2Position.x;
    canvasLine.y2 = e2Position.y;
  });
};

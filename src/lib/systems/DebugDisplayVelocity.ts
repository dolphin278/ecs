import type { CanvasText, Position, Velocity } from "../components";
import type { System } from "../index";
import { assign } from "../utils/Vector2";
import { entitiesWithComponents } from "../world";

interface Components {
  velocity: Velocity;
  position: Position;
  canvasText: CanvasText;
}

const query = ["canvasText", "velocity", "position"] as const;

export const DebugDisplayVelocity: System<Components> = function DebugDisplayVelocity(
  world
) {
  entitiesWithComponents(query, world).forEach(
    ([_, canvasText, velocity, position]) => {
      assign(canvasText, position);
      canvasText.text = `${velocity.x} ${velocity.y}`;
    }
  );
};

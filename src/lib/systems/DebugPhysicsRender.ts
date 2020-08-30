import type {
  CanvasRectangle,
  CanvasSprite,
  Mass,
  Position,
  UserControlled,
} from "../components";
import type { System } from "../index";
import { entitiesWithComponents } from "../world";

interface Components {
  position: Position;
  canvasRectangle: CanvasRectangle;
  userControl?: UserControlled;
  canvasSprite?: CanvasSprite;
  mass?: Mass;
}

const query = ["canvasRectangle", "position"] as const;

export const DebugPhysicsRender: System<Components> = function PhysicsRender(
  world
) {
  entitiesWithComponents(query, world).forEach(
    ([entity, canvasRectangle, position]) => {
      canvasRectangle.x = position.x;
      canvasRectangle.y = position.y;

      if (world.components.userControl?.has(entity))
        canvasRectangle.strokeStyle = "green";

      var mass = world.components.mass?.get(entity)?.value;
      if (mass !== void 0) {
        const size = mass ** (1 / 3);
        canvasRectangle.width = canvasRectangle.height = 2 * size;
        canvasRectangle.x -= size;
        canvasRectangle.y -= size;
      }
    }
  );

  // TODO: Aligning sprite positions and physicas positions does not belongs here
  entitiesWithComponents(
    ["canvasSprite", "position"] as const,
    world
  ).forEach(([_, canvasSprite, position]) => {
    canvasSprite!.x = position.x;
    canvasSprite!.y = position.y;
  });
};

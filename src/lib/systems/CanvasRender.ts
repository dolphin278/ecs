import type {
  CanvasLine,
  CanvasRectangle,
  CanvasSprite,
  CanvasText,
  Position,
} from "../components";
import type { System } from "../index";

interface Components {
  position: Position;
  canvasRectangle: CanvasRectangle;
  canvasLine: CanvasLine;
  canvasSprite: CanvasSprite;
  canvasText: CanvasText;
}

export const make: (
  canvas: HTMLCanvasElement
) => System<Components> = function CanvasRender(canvas) {
  const canvasCtx = canvas.getContext("2d")!;
  if (!canvasCtx) throw new Error("Can not get canvas");
  return function CanvasRender(world) {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    const thingsToRender = [
      ...[...world.components.canvasLine?.values()].map(
        (x) => ["canvasLine" as const, x] as const
      ),
      ...[...world.components.canvasRectangle?.values()].map(
        (x) => ["canvasRectangle" as const, x] as const
      ),
      ...[...world.components.canvasText?.values()].map(
        (x) => ["canvasText" as const, x] as const
      ),
      ...[...world.components.canvasSprite?.values()].map(
        (x) => ["canvasSprite" as const, x] as const
      ),
    ];

    // TODO: Replace sort by grouping by zIndex
    thingsToRender.sort((t1, t2) => t1[1].zIndex - t2[1].zIndex);

    for (const value of thingsToRender) {
      switch (value[0]) {
        case "canvasRectangle":
          canvasCtx.beginPath();
          canvasCtx.strokeStyle = value[1].strokeStyle;
          canvasCtx.strokeRect(
            value[1].x,
            value[1].y,
            value[1].width,
            value[1].height
          );
          break;
        case "canvasLine":
          canvasCtx.beginPath();
          canvasCtx.strokeStyle = value[1].strokeStyle;
          canvasCtx.moveTo(value[1].x1, value[1].y1);
          canvasCtx.lineTo(value[1].x2, value[1].y2);
          canvasCtx.stroke();
          break;
        case "canvasText":
          canvasCtx.beginPath();
          canvasCtx.strokeStyle = value[1].strokeStyle;
          canvasCtx.font = value[1].font;
          canvasCtx.strokeText(value[1].text, value[1].x, value[1].y);
          break;
        case "canvasSprite":
          if (value[1]?.image === void 0) continue;
          canvasCtx.drawImage(value[1].image, value[1].x, value[1].y);
          break;
      }
    }
  };
};

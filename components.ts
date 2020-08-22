export interface PositionComponent {
  x: number;
  y: number;
}
export interface VelocityComponent {
  x: number;
  y: number;
}
export interface AccelerationComponent {
  x: number;
  y: number;
}
export interface ForceComponent {
  x: number;
  y: number;
}
export interface MassComponent {
  value: number;
}
export interface JointComponent {
  entity1: Entity;
  entity2: Entity;
  k: number;
  originalDistance: number;
}
export interface UserControlledComponent {}

export type CanvasRenderComponent =
  | {
      kind: "rect";
      strokeStyle: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      kind: "line";
      strokeStyle: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    };
export interface Entity {}

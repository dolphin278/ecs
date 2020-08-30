import { Entity } from "./index";
import { Vector2 } from "./utils";

type Vector2 = Vector2.Vector2;

export interface Position extends Vector2 {}
export interface Velocity extends Vector2 {}
export interface Acceleration extends Vector2 {}
export interface Force extends Vector2 {}
export interface Mass {
  value: number;
}

export interface Spring {
  entity1: Entity;
  entity2: Entity;
  k: number;
  originalDistance: number;
}

export interface UserControlled {}

export interface CanvasRectangle {
  strokeStyle: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export interface CanvasLine {
  strokeStyle: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  zIndex: number;
}

export interface CanvasText extends Vector2 {
  text: string;
  font: string;
  strokeStyle: string;
  zIndex: number;
}

export interface CanvasSprite extends Vector2 {
  image?: ImageBitmap;
  zIndex: number;
}

export interface BaseComponents {
  position: Position;
  velocity: Velocity;
  acceleration: Acceleration;
  force: Force;
  mass: Mass;
  spring: Spring;
  userControl: UserControlled;
  canvasRectangle: CanvasRectangle;
  canvasLine: CanvasLine;
  canvasText: CanvasText;
  canvasSprite: CanvasSprite;
}

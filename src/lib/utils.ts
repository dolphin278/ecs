export module Function {
  export function partial<
    T extends Array<unknown>,
    U extends Array<unknown>,
    R
  >(fn: (...args: [...T, ...U]) => R, ...partialArgs: T) {
    return function (...restArgs: U) {
      return fn(...partialArgs, ...restArgs);
    };
  }
}

export module Vector2 {
  export interface Vector2 {
    x: number;
    y: number;
  }

  export function make(x: number, y: number): Vector2 {
    return { x: +x, y: +y };
  }

  export function makeZero(): Vector2 {
    return make(0.0, 0.0);
  }

  export function setToZero(out: Vector2) {
    out.x = 0.0;
    out.y = 0.0;
  }

  export function assign(out: Vector2, arg: Readonly<Vector2>) {
    out.x = arg.x;
    out.y = arg.y;
  }

  export function addVecMultiplyByScalar(
    out: Vector2,
    arg: Vector2,
    scalar: number
  ) {
    out.x += arg.x * scalar;
    out.y += arg.y * scalar;
  }

  export function addVec(out: Vector2, arg: Readonly<Vector2>) {
    out.x += arg.x;
    out.y += arg.y;
  }

  export function subVec(out: Vector2, arg: Readonly<Vector2>) {
    out.x -= arg.x;
    out.y -= arg.y;
  }

  export function diff(
    vec1: Readonly<Vector2>,
    vec2: Readonly<Vector2>,
    out: Vector2
  ) {
    out.x = vec1.x - vec2.x;
    out.y = vec1.y - vec2.y;
  }

  export function moduleSquare(vec: Vector2) {
    return vec.x * vec.x + vec.y * vec.y;
  }

  export function isZero(vec: Vector2) {
    return vec.x === 0 && vec.y === 0;
  }

  export function module(vec: Vector2) {
    return Math.sqrt(moduleSquare(vec));
  }
}

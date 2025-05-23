export type Tool = "brush" | "line" | "ellipse" | "rectangle" | "polygon";

export type ShapeBase = {
  id: string;
  type: Tool;
  stroke?: string;
  strokeWidth?: number;
};

export type BrushShape = ShapeBase & {
  type: "brush";
  points: [x: number, y: number][];
};

export type LineShape = ShapeBase & {
  type: "line";
  startPoint: [x: number, y: number];
  endPoint: [x: number, y: number];
};

export type EllipseShape = ShapeBase & {
  type: "ellipse";
  x: number;
  y: number;
  width: number;
  height: number;
};

export type RectangleShape = ShapeBase & {
  type: "rectangle";
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PolygonShape = ShapeBase & {
  type: "polygon";
  x: number;
  y: number;
  sides: number;
  radius: number;
};

export type Shape =
  | BrushShape
  | LineShape
  | EllipseShape
  | RectangleShape
  | PolygonShape;

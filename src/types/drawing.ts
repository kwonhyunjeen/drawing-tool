export type ShapeType = "brush" | "line" | "ellipse" | "rectangle" | "polygon";

export type ShapeDrawingStatus = "opened" | "closed" | "invalid";

export type ShapeBaseModel = {
  id: string;
  type: ShapeType;
  stroke?: string;
  strokeWidth?: number;
};

export type BrushShapeModel = ShapeBaseModel & {
  type: "brush";
  points: (readonly [x: number, y: number])[];
};

export type LineShapeModel = ShapeBaseModel & {
  type: "line";
  startPoint: readonly [x: number, y: number];
  endPoint: readonly [x: number, y: number];
};

export type EllipseShapeModel = ShapeBaseModel & {
  type: "ellipse";
  x: number;
  y: number;
  width: number;
  height: number;
};

export type RectangleShapeModel = ShapeBaseModel & {
  type: "rectangle";
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PolygonShapeModel = ShapeBaseModel & {
  type: "polygon";
  points: (readonly [x: number, y: number])[];
};

export type ShapeModel = BrushShapeModel | LineShapeModel | EllipseShapeModel | RectangleShapeModel | PolygonShapeModel;

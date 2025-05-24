import { Brush } from "./Brush";
import { Line } from "./Line";
import { Ellipse } from "./Ellipse";
import { Rectangle } from "./Rectangle";
import { Polygon } from "./Polygon";
import type { ShapeModel } from "../../types/drawing";

export type ShapeProps = {
  shape: ShapeModel;
};

export const Shape: React.FC<ShapeProps> = (props) => {
  const { shape } = props;

  if (shape.type === "brush") {
    return <Brush key={shape.id} shape={shape} />;
  }
  if (shape.type === "line") {
    return <Line key={shape.id} shape={shape} />;
  }
  if (shape.type === "ellipse") {
    return <Ellipse key={shape.id} shape={shape} />;
  }
  if (shape.type === "rectangle") {
    return <Rectangle key={shape.id} shape={shape} />;
  }
  if (shape.type === "polygon") {
    return <Polygon key={shape.id} shape={shape} />;
  }

  console.error("Unknown shape type:", shape);
  // eslint-disable-next-line unicorn/no-null
  return null;
};

Shape.displayName = "Shape";

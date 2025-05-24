import { Rect as KonvaRect } from "react-konva";
import type { RectangleShapeModel } from "../../types/drawing";

export type RectangleProps = {
  shape: RectangleShapeModel;
};

export const Rectangle: React.FC<RectangleProps> = (props) => {
  const { shape } = props;
  const { x, y, width, height, stroke, strokeWidth } = shape;

  return <KonvaRect x={x} y={y} width={width} height={height} stroke={stroke} strokeWidth={strokeWidth} />;
};

Rectangle.displayName = "Rectangle";

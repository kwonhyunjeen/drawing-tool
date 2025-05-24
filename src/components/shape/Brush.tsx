import { Line as KonvaLine } from "react-konva";
import type { BrushShapeModel } from "../../types/drawing";

export type BrushProps = {
  shape: BrushShapeModel;
};

export const Brush: React.FC<BrushProps> = (props) => {
  const { shape } = props;
  const { points, stroke, strokeWidth } = shape;

  return (
    <KonvaLine
      points={points.flat()}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
};

Brush.displayName = "Brush";

import { Line as KonvaLine } from "react-konva";
import type { LineShapeModel } from "../../types/drawing";

export type LineProps = {
  shape: LineShapeModel;
};

export const Line: React.FC<LineProps> = (props) => {
  const { shape } = props;
  const { startPoint, endPoint, stroke, strokeWidth } = shape;

  return (
    <KonvaLine
      points={[...startPoint, ...endPoint]}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
};

Line.displayName = "Line";

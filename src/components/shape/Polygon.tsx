import { Group as KonvaGroup, Line as KonvaLine } from "react-konva";
import type { PolygonShapeModel } from "../../types/drawing";

export type PolygonProps = {
  shape: PolygonShapeModel;
};

export const Polygon: React.FC<PolygonProps> = (props) => {
  const { shape } = props;
  const { lines, stroke, strokeWidth } = shape;

  return (
    <KonvaGroup>
      {lines.map((line, index) => (
        <KonvaLine
          key={index}
          points={[...line]}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      ))}
    </KonvaGroup>
  );
};

Polygon.displayName = "Polygon";

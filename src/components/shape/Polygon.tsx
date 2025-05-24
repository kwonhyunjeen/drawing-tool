import { Shape as KonvaCustomShape } from "react-konva";
import type { PolygonShapeModel } from "../../types/drawing";

export type PolygonProps = {
  shape: PolygonShapeModel;
  draft?: boolean;
};

export const Polygon: React.FC<PolygonProps> = (props) => {
  const { shape, draft = false } = props;
  const { points, stroke, strokeWidth } = shape;
  const [movePoint, ...linePoints] = points;

  return (
    <KonvaCustomShape
      sceneFunc={(context, fill) => {
        context.beginPath();
        context.moveTo(movePoint[0], movePoint[1]);
        linePoints.map((point) => {
          context.lineTo(point[0], point[1]);
        });
        if (!draft) {
          context.closePath();
        }
        context.fillStrokeShape(fill);
      }}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
};

Polygon.displayName = "Polygon";

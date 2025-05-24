import { Ellipse as KonvaEllipse } from "react-konva";
import type { EllipseShapeModel } from "../../types/drawing";

export type EllipseProps = {
  shape: EllipseShapeModel;
};

export const Ellipse: React.FC<EllipseProps> = (props) => {
  const { shape } = props;
  const { x, y, width, height, stroke, strokeWidth } = shape;
  const radiusX = width / 2;
  const radiusY = height / 2;

  return (
    <KonvaEllipse
      x={x}
      y={y}
      radiusX={Math.abs(radiusX)}
      radiusY={Math.abs(radiusY)}
      offsetX={-radiusX}
      offsetY={-radiusY}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
};

Ellipse.displayName = "Ellipse";

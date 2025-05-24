import type { Vector2d } from "konva/lib/types";
import type { EllipseShapeModel, ShapeDrawingStatus } from "../types/drawing";

/**
 * 드로잉을 시작하기 위한 EllipseShape 객체 생성
 */
export const createEllipseShape = (id: string, point: Vector2d, color: string, thick: number): EllipseShapeModel => ({
  id,
  type: "ellipse",
  x: point.x,
  y: point.y,
  width: 0,
  height: 0,
  stroke: color,
  strokeWidth: thick,
});

/**
 * 드로잉 중 마우스 위치에 따라 EllipseShape 객체 가공
 */
export const drawEllipseShape = (shape: EllipseShapeModel, point: Vector2d): EllipseShapeModel => ({
  ...shape,
  width: point.x - shape.x,
  height: point.y - shape.y,
});

/**
 * 상호작용이 끝났을 때 EllipseShape 객체와 도형 완성 상태 반환
 * @todo 마우스 이동 거리가 너무 짧으면 도형을 버리도록 구현 (invalid)
 */
export const closeEllipseShape = (shape: EllipseShapeModel): [shape: EllipseShapeModel, status: ShapeDrawingStatus] => {
  return [shape, "closed"];
};

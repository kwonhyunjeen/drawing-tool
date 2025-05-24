import type { Vector2d } from "konva/lib/types";
import type { LineShapeModel, ShapeDrawingStatus } from "../types/drawing";

/**
 * 드로잉을 시작하기 위한 LineShape 객체 생성
 */
export const createLineShape = (id: string, point: Vector2d, color: string, thick: number): LineShapeModel => ({
  id,
  type: "line",
  startPoint: [point.x, point.y],
  endPoint: [point.x, point.y],
  stroke: color,
  strokeWidth: thick,
});

/**
 * 드로잉 중 마우스 위치에 따라 LineShape 객체 가공
 */
export const drawLineShape = (shape: LineShapeModel, point: Vector2d): LineShapeModel => ({
  ...shape,
  endPoint: [point.x, point.y],
});

/**
 * 상호작용이 끝났을 때 LineShape 객체와 도형 완성 상태 반환
 * @todo 마우스 이동 거리가 너무 짧으면 도형을 버리도록 구현 (invalid)
 */
export const closeLineShape = (shape: LineShapeModel): [shape: LineShapeModel, status: ShapeDrawingStatus] => {
  return [shape, "closed"];
};

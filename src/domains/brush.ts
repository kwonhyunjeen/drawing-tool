import type { Vector2d } from "konva/lib/types";
import type { BrushShapeModel, ShapeDrawingStatus } from "../types/drawing";

/**
 * 드로잉을 시작하기 위한 BrushShape 객체 생성
 */
export const createBrushShape = (
  id: string,
  point: Vector2d,
  color: string,
  thick: number,
): BrushShapeModel => ({
  id,
  type: "brush",
  points: [[point.x, point.y]],
  stroke: color,
  strokeWidth: thick,
});

/**
 * 드로잉 중 마우스 위치에 따라 BrushShape 객체 가공
 */
export const drawBrushShape = (
  shape: BrushShapeModel,
  point: Vector2d,
): BrushShapeModel => ({
  ...shape,
  points: [...shape.points, [point.x, point.y]],
});

/**
 * 상호작용이 끝났을 때 BrushShape 객체와 도형 완성 상태 반환
 */
export const closeBrushShape = (
  shape: BrushShapeModel,
): [shape: BrushShapeModel, status: ShapeDrawingStatus] => {
  return [shape, "closed"];
};

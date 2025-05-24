import type { Vector2d } from "konva/lib/types";
import type { PolygonShapeModel, ShapeDrawingStatus } from "../types/drawing";

/**
 * 점과 점이 만났다고 판단하기 위한 오차 범위
 */
const CLOSE_DISTANCE_THRESHOLD = 8; // px

/**
 * 드로잉을 시작하기 위한 PolygonShape 객체 생성
 */
export const createPolygonShape = (id: string, point: Vector2d, color: string, thick: number): PolygonShapeModel => ({
  id,
  type: "polygon",
  points: [
    [point.x, point.y],
    [point.x, point.y],
  ],
  stroke: color,
  strokeWidth: thick,
});

/**
 * 드로잉 중 마우스 위치에 따라 PolygonShape 객체 가공
 */
export const drawPolygonShape = (shape: PolygonShapeModel, point: Vector2d): PolygonShapeModel => ({
  ...shape,
  points: [...shape.points.slice(0, -1), [point.x, point.y] as const],
});

/**
 * 상호작용이 끝났을 때 PolygonShape 객체와 도형 완성 상태 반환
 */
export const closePolygonShape = (shape: PolygonShapeModel): [shape: PolygonShapeModel, status: ShapeDrawingStatus] => {
  const startPoint = shape.points.at(0);
  const endPoint = shape.points.at(-1);
  if (!startPoint || !endPoint) {
    throw new Error("No start or end point");
  }
  const [startX, startY] = startPoint;
  const [endX, endY] = endPoint;

  // 다각형이 성립되려면 최소 3개의 점이 필요
  const hasEnoughPoints = shape.points.length >= 3;

  // 시작 점과 끝 점이 가까우면 다각형을 닫으려는(완성하려는) 것으로 판단
  const isCloseToStart =
    Math.abs(startX - endX) <= CLOSE_DISTANCE_THRESHOLD && Math.abs(startY - endY) <= CLOSE_DISTANCE_THRESHOLD;

  // 다각형이 완성되지 않은 경우, 다음 선을 그리기 위한 새로운 점을 추가하고 종료
  if (!hasEnoughPoints || !isCloseToStart) {
    return [
      {
        ...shape,
        points: [...shape.points, [endX, endY] as const],
      },
      "opened",
    ];
  }

  // 다각형이 완성된 경우, 끝 점은 시작 점과 동일하므로 제거
  return [
    {
      ...shape,
      points: shape.points.slice(0, -1),
    },
    "closed",
  ];
};

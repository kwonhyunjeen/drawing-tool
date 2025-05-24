import Konva from "konva";
import { useEffect, useState } from "react";
import { Layer, Stage } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import {
  BrushIcon,
  EllipseIcon,
  LineIcon,
  PolygonIcon,
  RectangleIcon,
} from "./components/ui/Icon";
import { Button } from "./components/ui/Button";
import { NumberField } from "./components/ui/NumberField";
import { ColorPicker } from "./components/ui/ColorPicker";
import { Shape } from "./components/shape/Shape";
import type {
  Tool,
  ShapeModel,
  BrushShapeModel,
  LineShapeModel,
  EllipseShapeModel,
  RectangleShapeModel,
  PolygonShapeModel,
} from "./types/drawing";

const CLOSE_DISTANCE_THRESHOLD = 8; // px

function App() {
  const [tool, setTool] = useState<Tool>("brush");
  const [thick, setThick] = useState(5);
  const [color, setColor] = useState("#000000");

  const [shapes, setShapes] = useState<ShapeModel[]>(() => {
    try {
      const saved = sessionStorage.getItem("shapes");
      if (!saved) return [];
      const parsed = JSON.parse(saved) as ShapeModel[];
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (error) {
      console.error("Failed to parse saved shapes.", error);
      return [];
    }
  });
  const [draftShape, setDraftShape] = useState<ShapeModel>();

  useEffect(() => {
    try {
      const serialized = JSON.stringify(shapes);
      sessionStorage.setItem("shapes", serialized);
    } catch (error) {
      console.error("Failed to save shapes.", error);
    }
  }, [shapes]);

  const handleMouseDown = (event: Konva.KonvaEventObject<MouseEvent>) => {
    const id = uuidv4();
    const stage = event.target.getStage();
    const point = stage?.getPointerPosition();

    console.log("MouseDown", id, point);
    if (!point) return;

    if (tool === "brush") {
      const newShape: BrushShapeModel = {
        id,
        type: "brush",
        points: [[point.x, point.y]],
        stroke: color,
        strokeWidth: thick,
      };
      setDraftShape(newShape);
    }
    if (tool === "line") {
      const newShape: LineShapeModel = {
        id,
        type: "line",
        startPoint: [point.x, point.y],
        endPoint: [point.x, point.y],
        stroke: color,
        strokeWidth: thick,
      };
      setDraftShape(newShape);
    }
    if (tool === "ellipse") {
      const newShape: EllipseShapeModel = {
        id,
        type: "ellipse",
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        stroke: color,
        strokeWidth: thick,
      };
      setDraftShape(newShape);
    }
    if (tool === "rectangle") {
      const newShape: RectangleShapeModel = {
        id,
        type: "rectangle",
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        stroke: color,
        strokeWidth: thick,
      };
      setDraftShape(newShape);
    }
    if (tool === "polygon") {
      setDraftShape((currentShape) => {
        // 이미 다각형을 그리고 있을 경우, 새로 생성하지 않음
        if (currentShape?.type === "polygon") {
          return currentShape;
        }
        const newShape: PolygonShapeModel = {
          id,
          type: "polygon",
          points: [
            [point.x, point.y],
            [point.x, point.y],
          ],
          stroke: color,
          strokeWidth: thick,
        };
        return newShape;
      });
    }
  };

  const handleMouseMove = (event: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = event.target.getStage();
    const point = stage?.getPointerPosition();

    // console.log("MouseMove", point);
    if (!point) return;

    setDraftShape((currentShape) => {
      if (currentShape?.type === "brush") {
        return {
          ...currentShape,
          points: [...currentShape.points, [point.x, point.y]],
        } satisfies BrushShapeModel;
      }
      if (currentShape?.type === "line") {
        return {
          ...currentShape,
          endPoint: [point.x, point.y],
        } satisfies LineShapeModel;
      }
      if (currentShape?.type === "ellipse") {
        return {
          ...currentShape,
          width: point.x - currentShape.x,
          height: point.y - currentShape.y,
        } satisfies EllipseShapeModel;
      }
      if (currentShape?.type === "rectangle") {
        return {
          ...currentShape,
          width: point.x - currentShape.x,
          height: point.y - currentShape.y,
        } satisfies RectangleShapeModel;
      }
      if (currentShape?.type === "polygon") {
        return {
          ...currentShape,
          points: [
            ...currentShape.points.slice(0, -1),
            [point.x, point.y] as const,
          ],
        } satisfies PolygonShapeModel;
      }
      return currentShape;
    });
  };

  const handleMouseUp = () => {
    let processingShape = draftShape;

    if (!processingShape) {
      console.log("MouseUp", shapes);
      return;
    }

    if (processingShape.type === "polygon") {
      const startPoint = processingShape.points.at(0);
      const endPoint = processingShape.points.at(-1);
      if (!startPoint || !endPoint) {
        throw new Error("No start or end point");
      }
      const [startX, startY] = startPoint;
      const [endX, endY] = endPoint;

      // 다각형이 완성되려면 최소 3개의 점이 필요
      const hasEnoughPoints = processingShape.points.length >= 3;
      // 시작 점과 끝 점이 가까워야 다각형이 완성된 것으로 판단
      const isCloseToStart =
        Math.abs(startX - endX) <= CLOSE_DISTANCE_THRESHOLD &&
        Math.abs(startY - endY) <= CLOSE_DISTANCE_THRESHOLD;

      // 다각형이 완성되지 않은 경우, draft에 새로운 점을 추가하고 종료
      if (!hasEnoughPoints || !isCloseToStart) {
        return setDraftShape({
          ...processingShape,
          points: [...processingShape.points, [endX, endY] as const],
        } satisfies PolygonShapeModel);
      }

      // 다각형이 완성된 경우, 끝 점은 시작 점과 동일하므로 제거
      processingShape = {
        ...processingShape,
        points: processingShape.points.slice(0, -1),
      } satisfies PolygonShapeModel;
    }

    const newShapes = [...shapes, processingShape];
    console.log("MouseUp", newShapes);
    setDraftShape(undefined);
    return setShapes(newShapes);
  };

  return (
    <div className="app">
      {/* drawing menu */}
      <div className="toolbar">
        <div className="toolbar-tools">
          <Button
            className="toolbar-button"
            pressed={tool === "brush"}
            onClick={() => setTool("brush")}
            aria-label="Brush"
            title="Brush"
          >
            <BrushIcon />
          </Button>
          <Button
            className="toolbar-button"
            pressed={tool === "line"}
            onClick={() => setTool("line")}
            aria-label="Line"
            title="Line"
          >
            <LineIcon />
          </Button>
          <Button
            className="toolbar-button"
            pressed={tool === "ellipse"}
            onClick={() => setTool("ellipse")}
            aria-label="Ellipse"
            title="Ellipse"
          >
            <EllipseIcon />
          </Button>
          <Button
            className="toolbar-button"
            pressed={tool === "rectangle"}
            onClick={() => setTool("rectangle")}
            aria-label="Rectangle"
            title="Rectangle"
          >
            <RectangleIcon />
          </Button>
          <Button
            className="toolbar-button"
            pressed={tool === "polygon"}
            onClick={() => setTool("polygon")}
            aria-label="Polygon"
            title="Polygon"
          >
            <PolygonIcon />
          </Button>
        </div>
        <div className="toolbar-separator" />
        <div className="toolbar-controls">
          <NumberField
            className="toolbar-field"
            value={thick}
            onChange={(event) => setThick(Number(event.target.value))}
            min={5}
            max={50}
            aria-label="Stroke thickness"
            title="Stroke thickness (5-50px)"
          />
          <ColorPicker
            className="toolbar-color-picker"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            aria-label="Stroke color"
            title="Stroke color"
          />
        </div>
      </div>
      {/* drawing canvas */}
      <div>
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Layer>
            {shapes.map((shape) => (
              <Shape key={shape.id} shape={shape} />
            ))}
            {draftShape && (
              <Shape key={draftShape.id} shape={draftShape} draft={true} />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

export default App;

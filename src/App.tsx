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
      const newLine = [point.x, point.y, point.x, point.y] as const;
      setDraftShape((currentShape) => {
        if (currentShape?.type === "polygon") {
          const firstLine = currentShape.lines.at(0);
          const lastLine = currentShape.lines.at(-1);
          if (!firstLine || !lastLine) {
            throw new Error("No first or last line");
          }
          const [firstStartX, firstStartY] = firstLine;
          const [, , lastEndX, lastEndY] = lastLine;
          if (
            Math.abs(firstStartX - lastEndX) <= CLOSE_DISTANCE_THRESHOLD &&
            Math.abs(firstStartY - lastEndY) <= CLOSE_DISTANCE_THRESHOLD
          ) {
            return currentShape;
          }
          return {
            ...currentShape,
            lines: [...currentShape.lines, newLine],
          } satisfies PolygonShapeModel;
        }
        const newShape: PolygonShapeModel = {
          id,
          type: "polygon",
          lines: [newLine],
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
        const lastLine = currentShape.lines.at(-1);
        if (!lastLine) {
          throw new Error("No last line");
        }
        const newLines = [
          ...currentShape.lines.slice(0, -1),
          [lastLine[0], lastLine[1], point.x, point.y] as const,
        ];
        return {
          ...currentShape,
          lines: newLines,
        } satisfies PolygonShapeModel;
      }
      return currentShape;
    });
  };

  const handleMouseUp = () => {
    if (!draftShape) {
      console.log("MouseUp", shapes);
      return;
    }

    let saveShape = draftShape;

    if (saveShape.type === "polygon") {
      if (saveShape.lines.length < 3) {
        return;
      }
      const firstLine = saveShape.lines.at(0);
      const lastLine = saveShape.lines.at(-1);
      if (!firstLine || !lastLine) {
        throw new Error("No first or last line");
      }
      const [firstStartX, firstStartY] = firstLine;
      const [lastStartX, lastStartY, lastEndX, lastEndY] = lastLine;
      if (
        Math.abs(firstStartX - lastEndX) > CLOSE_DISTANCE_THRESHOLD ||
        Math.abs(firstStartY - lastEndY) > CLOSE_DISTANCE_THRESHOLD
      ) {
        return;
      }
      saveShape = {
        ...saveShape,
        lines: [
          ...saveShape.lines.slice(0, -1),
          [lastStartX, lastStartY, firstStartX, firstStartY] as const,
        ],
      } satisfies PolygonShapeModel;
    }

    const newShapes = [...shapes, saveShape];
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
            {draftShape && <Shape key={draftShape.id} shape={draftShape} />}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

export default App;

import { Ellipse, Group, Layer, Line, Rect, Stage } from "react-konva";
import Konva from "konva";
import { useEffect, useState } from "react";
import type {
  Tool,
  Shape,
  BrushShape,
  LineShape,
  EllipseShape,
  RectangleShape,
  PolygonShape,
} from "./types/drawing";
import { v4 as uuidv4 } from "uuid";
import { Button } from "./components/Button";
import { nonNullable } from "./utils/nonNullable";

const CLOSE_DISTANCE_THRESHOLD = 8; // px

function App() {
  const [tool, setTool] = useState<Tool>("brush");
  const [shapes, setShapes] = useState<Shape[]>(() => {
    try {
      const saved = sessionStorage.getItem("shapes");
      if (!saved) return [];
      const parsed = JSON.parse(saved) as Shape[];
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (error) {
      console.error("Failed to parse saved shapes.", error);
      return [];
    }
  });
  const [draftShape, setDraftShape] = useState<Shape>();

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
      const newShape: BrushShape = {
        id,
        type: "brush",
        points: [[point.x, point.y]],
        stroke: "#dd0000",
        strokeWidth: 5,
      };
      setDraftShape(newShape);
    }
    if (tool === "line") {
      const newShape: LineShape = {
        id,
        type: "line",
        startPoint: [point.x, point.y],
        endPoint: [point.x, point.y],
        stroke: "#dddd00",
        strokeWidth: 5,
      };
      setDraftShape(newShape);
    }
    if (tool === "ellipse") {
      const newShape: EllipseShape = {
        id,
        type: "ellipse",
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        stroke: "#00dd00",
        strokeWidth: 5,
      };
      setDraftShape(newShape);
    }
    if (tool === "rectangle") {
      const newShape: RectangleShape = {
        id,
        type: "rectangle",
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        stroke: "#0000dd",
        strokeWidth: 5,
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
          } satisfies PolygonShape;
        }
        const newShape: PolygonShape = {
          id,
          type: "polygon",
          lines: [newLine],
          stroke: "#dd00dd",
          strokeWidth: 5,
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
        } satisfies BrushShape;
      }
      if (currentShape?.type === "line") {
        return {
          ...currentShape,
          endPoint: [point.x, point.y],
        } satisfies LineShape;
      }
      if (currentShape?.type === "ellipse") {
        return {
          ...currentShape,
          width: point.x - currentShape.x,
          height: point.y - currentShape.y,
        } satisfies EllipseShape;
      }
      if (currentShape?.type === "rectangle") {
        return {
          ...currentShape,
          width: point.x - currentShape.x,
          height: point.y - currentShape.y,
        } satisfies RectangleShape;
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
        } satisfies PolygonShape;
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
      } satisfies PolygonShape;
    }

    const newShapes = [...shapes, saveShape];
    console.log("MouseUp", newShapes);
    setDraftShape(undefined);
    return setShapes(newShapes);
  };

  return (
    <>
      {/* drawing toolbar */}
      <div className="toolbar">
        <Button pressed={tool === "brush"} onClick={() => setTool("brush")}>
          Brush
        </Button>
        <Button pressed={tool === "line"} onClick={() => setTool("line")}>
          Line
        </Button>
        <Button pressed={tool === "ellipse"} onClick={() => setTool("ellipse")}>
          Ellipse
        </Button>
        <Button
          pressed={tool === "rectangle"}
          onClick={() => setTool("rectangle")}
        >
          Rectangle
        </Button>
        <Button pressed={tool === "polygon"} onClick={() => setTool("polygon")}>
          Polygon
        </Button>
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
            {[...shapes, draftShape]
              .filter((shape) => nonNullable(shape))
              .map((shape) => {
                if (shape.type === "brush") {
                  return (
                    <Line
                      key={shape.id}
                      points={shape.points.flat()}
                      stroke={shape.stroke}
                      strokeWidth={shape.strokeWidth}
                    />
                  );
                }
                if (shape.type === "line") {
                  return (
                    <Line
                      key={shape.id}
                      points={[...shape.startPoint, ...shape.endPoint]}
                      stroke={shape.stroke}
                      strokeWidth={shape.strokeWidth}
                    />
                  );
                }
                if (shape.type === "ellipse") {
                  const radiusX = shape.width / 2;
                  const radiusY = shape.height / 2;
                  return (
                    <Ellipse
                      key={shape.id}
                      x={shape.x}
                      y={shape.y}
                      radiusX={Math.abs(radiusX)}
                      radiusY={Math.abs(radiusY)}
                      offsetX={-radiusX}
                      offsetY={-radiusY}
                      stroke={shape.stroke}
                      strokeWidth={shape.strokeWidth}
                    />
                  );
                }
                if (shape.type === "rectangle") {
                  return (
                    <Rect
                      key={shape.id}
                      x={shape.x}
                      y={shape.y}
                      width={shape.width}
                      height={shape.height}
                      stroke={shape.stroke}
                      strokeWidth={shape.strokeWidth}
                    />
                  );
                }
                if (shape.type === "polygon") {
                  return (
                    <Group key={shape.id}>
                      {shape.lines.map((line, index) => (
                        <Line
                          key={`${shape.id}-${index}`}
                          points={[...line]}
                          stroke={shape.stroke}
                          strokeWidth={shape.strokeWidth}
                        />
                      ))}
                    </Group>
                  );
                }
              })}
          </Layer>
        </Stage>
      </div>
    </>
  );
}

export default App;

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
  UndoIcon,
  RedoIcon,
} from "./components/ui/Icon";
import { Button } from "./components/ui/Button";
import { NumberField } from "./components/ui/NumberField";
import { ColorPicker } from "./components/ui/ColorPicker";
import {
  closeBrushShape,
  createBrushShape,
  drawBrushShape,
} from "./domains/brush";
import { closeLineShape, createLineShape, drawLineShape } from "./domains/line";
import {
  closeEllipseShape,
  createEllipseShape,
  drawEllipseShape,
} from "./domains/ellipse";
import {
  closeRectangleShape,
  createRectangleShape,
  drawRectangleShape,
} from "./domains/rectangle";
import {
  createPolygonShape,
  drawPolygonShape,
  closePolygonShape,
} from "./domains/polygon";
import type {
  ShapeDrawingStatus,
  ShapeModel,
  ShapeType,
} from "./types/drawing";
import { Brush } from "./components/shape/Brush";
import { Line } from "./components/shape/Line";
import { Ellipse } from "./components/shape/Ellipse";
import { Rectangle } from "./components/shape/Rectangle";
import { Polygon } from "./components/shape/Polygon";

function App() {
  const [tool, setTool] = useState<ShapeType>("brush");
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

  const [history, setHistory] = useState<{
    previous: ShapeModel[];
    next: ShapeModel[];
  }>({
    previous: [],
    next: [],
  });

  useEffect(() => {
    try {
      const serialized = JSON.stringify(shapes);
      sessionStorage.setItem("shapes", serialized);
    } catch (error) {
      console.error("Failed to save shapes.", error);
    }
  }, [shapes]);

  const handleMouseDown = (event: Konva.KonvaEventObject<MouseEvent>) => {
    // 이미 도형을 그리고 있다면 새로 그리지 않도록 무시
    if (draftShape) return;

    const id = uuidv4();
    const point = event.target.getStage()?.getPointerPosition();
    if (!point) return;

    // 도형 객체 생성
    if (tool === "brush") {
      setDraftShape(createBrushShape(id, point, color, thick));
    } else if (tool === "line") {
      setDraftShape(createLineShape(id, point, color, thick));
    } else if (tool === "ellipse") {
      setDraftShape(createEllipseShape(id, point, color, thick));
    } else if (tool === "rectangle") {
      setDraftShape(createRectangleShape(id, point, color, thick));
    } else if (tool === "polygon") {
      setDraftShape(createPolygonShape(id, point, color, thick));
    }
  };

  const handleMouseMove = (event: Konva.KonvaEventObject<MouseEvent>) => {
    const point = event.target.getStage()?.getPointerPosition();
    if (!point) return;

    // 마우스 위치에 따라 도형 객체 가공
    setDraftShape((currentShape) => {
      if (currentShape?.type === "brush") {
        return drawBrushShape(currentShape, point);
      } else if (currentShape?.type === "line") {
        return drawLineShape(currentShape, point);
      } else if (currentShape?.type === "ellipse") {
        return drawEllipseShape(currentShape, point);
      } else if (currentShape?.type === "rectangle") {
        return drawRectangleShape(currentShape, point);
      } else if (currentShape?.type === "polygon") {
        return drawPolygonShape(currentShape, point);
      }
      return currentShape;
    });
  };

  const handleMouseUp = () => {
    // 그릴 도형이 없다면 무시
    if (!draftShape) return;

    let processingShape = draftShape;
    let status: ShapeDrawingStatus = "invalid";

    // 도형 완성
    if (processingShape.type === "brush") {
      [processingShape, status] = closeBrushShape(processingShape);
    } else if (processingShape.type === "line") {
      [processingShape, status] = closeLineShape(processingShape);
    } else if (processingShape.type === "ellipse") {
      [processingShape, status] = closeEllipseShape(processingShape);
    } else if (processingShape.type === "rectangle") {
      [processingShape, status] = closeRectangleShape(processingShape);
    } else if (processingShape.type === "polygon") {
      [processingShape, status] = closePolygonShape(processingShape);
    }

    // 도형이 유효하지 않은 경우(이동 거리가 너무 짧은 경우 등), draft를 비우고 무시
    if (status === "invalid") return setDraftShape(undefined);

    // 도형이 미완성된 경우(열린 도형인 경우), draft만 업데이트
    if (status === "opened") return setDraftShape(processingShape);

    // 도형이 완성된 경우(닫힌 도형인 경우), draft를 비우고 저장
    setDraftShape(undefined);
    setShapes([...shapes, processingShape]);
    setHistory({
      previous: [...history.previous, processingShape].slice(-40),
      next: [],
    });
  };

  const undo = () => {
    const target = history.previous.at(-1);
    if (!target) return history;
    setHistory({
      previous: history.previous.slice(0, -1),
      next: [...history.next, target],
    });
    setShapes(
      shapes.filter((shape) => shape.id !== history.previous.at(-1)?.id),
    );
  };

  const redo = () => {
    const target = history.next.at(-1);
    if (!target) return history;
    setHistory({
      previous: [...history.previous, target],
      next: history.next.slice(0, -1),
    });
    setShapes([...shapes, history.next.at(-1) as ShapeModel]);
  };

  return (
    <div className="app">
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
        <div className="toolbar-separator" />
        <div className="toolbar-actions">
          <Button
            className="toolbar-button"
            onClick={() => undo()}
            disabled={history.previous.length === 0}
            aria-label="Undo"
            title="Undo"
          >
            <UndoIcon />
          </Button>
          <Button
            className="toolbar-button"
            onClick={() => redo()}
            disabled={history.next.length === 0}
            aria-label="Redo"
            title="Redo"
          >
            <RedoIcon />
          </Button>
        </div>
      </div>
      <div>
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Layer>
            {shapes.map((shape) => {
              if (shape.type === "brush") {
                return <Brush key={shape.id} shape={shape} />;
              }
              if (shape.type === "line") {
                return <Line key={shape.id} shape={shape} />;
              }
              if (shape.type === "ellipse") {
                return <Ellipse key={shape.id} shape={shape} />;
              }
              if (shape.type === "rectangle") {
                return <Rectangle key={shape.id} shape={shape} />;
              }
              if (shape.type === "polygon") {
                return <Polygon key={shape.id} shape={shape} draft={false} />;
              }
            })}
            {draftShape &&
              (() => {
                if (draftShape.type === "brush") {
                  return <Brush key={draftShape.id} shape={draftShape} />;
                }
                if (draftShape.type === "line") {
                  return <Line key={draftShape.id} shape={draftShape} />;
                }
                if (draftShape.type === "ellipse") {
                  return <Ellipse key={draftShape.id} shape={draftShape} />;
                }
                if (draftShape.type === "rectangle") {
                  return <Rectangle key={draftShape.id} shape={draftShape} />;
                }
                if (draftShape.type === "polygon") {
                  return (
                    <Polygon
                      key={draftShape.id}
                      shape={draftShape}
                      draft={true}
                    />
                  );
                }
              })()}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

export default App;

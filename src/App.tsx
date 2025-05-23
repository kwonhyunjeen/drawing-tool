import { Layer, Line, Stage } from "react-konva";
import Konva from "konva";
import { useState } from "react";
import type { Tool, Shape, BrushShape } from "./types/drawing";
import { v4 as uuidv4 } from "uuid";
import { Button } from "./components/Button";
import { nonNullable } from "./utils/nonNullable";

function App() {
  const [tool, setTool] = useState<Tool>("brush");
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [draftShape, setDraftShape] = useState<Shape>();

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
      return currentShape;
    });
  };

  const handleMouseUp = () => {
    if (!draftShape) {
      console.log("MouseUp", shapes);
      return;
    }

    const newShapes = [...shapes, draftShape];
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
              })}
          </Layer>
        </Stage>
      </div>
    </>
  );
}

export default App;

import { Layer, Line, Stage } from "react-konva";
import Konva from "konva";
import { useState } from "react";
import type { Tool, Shape } from "./types/drawing";
import { v4 as uuidv4 } from "uuid";

function App() {
  const [tool, setTool] = useState<Tool>("brush");
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleMouseDown = (event: Konva.KonvaEventObject<MouseEvent>) => {
    setIsDrawing(true);
    const stage = event.target.getStage();
    const point = stage?.getPointerPosition();

    if (!point) return;

    console.log("처음 좌표:", point);

    if (tool === "brush") {
      const newBrush: Shape = {
        id: uuidv4(),
        type: "brush",
        points: [[point.x, point.y]],
        stroke: "#dd0000",
        strokeWidth: 5,
      };
      setShapes([...shapes, newBrush]);
    }
  };

  const handleMouseMove = (event: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing) return;
    const stage = event.target.getStage();
    const point = stage?.getPointerPosition();

    if (!point) return;

    setShapes((previous) => {
      const lastIndex = previous.length - 1;
      const last = previous[lastIndex];

      if (!last || last.type !== "brush") return previous;

      const updatedBrush: Shape = {
        ...last,
        points: [...last.points, [point.x, point.y]],
      };

      return [...previous.slice(0, lastIndex), updatedBrush];
    });
    console.log({ shapes });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <>
      {/* drawing toolbar */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <button onClick={() => setTool("brush")}>Brush</button>
        <button onClick={() => setTool("line")}>Line</button>
        <button onClick={() => setTool("ellipse")}>Ellipse</button>
        <button onClick={() => setTool("rectangle")}>Rectangle</button>
        <button onClick={() => setTool("polygon")}>Polygon</button>
      </div>
      {/* drawing canvas */}
      <div>
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ border: "1px solid black" }}
        >
          <Layer>
            {shapes.map((shape) => {
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

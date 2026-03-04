import React from "react";

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const WaveformCanvas: React.FC<Props> = ({ canvasRef }) => {
  return (
    <canvas
      ref={canvasRef}
      width={700}
      height={200}
      style={{ border: "1px solid gray", marginTop: 20 }}
    />
  );
};

export default WaveformCanvas;

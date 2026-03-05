import React, { useEffect, useRef } from "react";

interface PitchTimelineCanvasProps {
	width?: number;
	height?: number;
}

const WINDOW_SECONDS = 5;
const MAX_FREQ = 1000;
const MIN_FREQ = 50;

const PitchTimelineCanvas: React.FC<PitchTimelineCanvasProps> = ({
	width = 800,
	height = 200,
}) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const pitchBufferRef = useRef<number[]>([]);
	// const startTimeRef = useRef<number>(performance.now());

	const addPitch = (freq: number) => {
		pitchBufferRef.current.push(freq);
	};

	useEffect(() => {
		const canvas = canvasRef.current!;
		const ctx = canvas.getContext("2d")!;

		const draw = () => {
			// const now = performance.now();
			// const elapsed = (now - startTimeRef.current) / 1000;

			ctx.fillStyle = "black";
			ctx.fillRect(0, 0, width, height);

			const buffer = pitchBufferRef.current;

			ctx.strokeStyle = "cyan";
			ctx.beginPath();

			const step = width / (WINDOW_SECONDS * 60); // assume ~60fps

			let x = width - buffer.length * step;

			buffer.forEach((freq, i) => {
				let y = height;

				if (freq !== -1) {
					const norm = (freq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ);
					y = height - norm * height;
				}

				if (i === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);

				x += step;
			});

			ctx.stroke();

			if (buffer.length > WINDOW_SECONDS * 60) {
				buffer.shift();
			}

			requestAnimationFrame(draw);
		};

		draw();
	}, []);

	(window as any).addPitchToTimeline = addPitch;

	return (
		<canvas
			ref={canvasRef}
			width={width}
			height={height}
			style={{
				width: "100%",
				border: "1px solid #444",
				borderRadius: 8,
			}}
		/>
	);
};

export default PitchTimelineCanvas;

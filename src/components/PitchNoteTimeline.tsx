import {
	useEffect,
	useRef,
	forwardRef,
	useImperativeHandle,
} from "react";

const WINDOW_SECONDS = 5;
const FPS = 60;

const NOTES = [
	"C5",
	"B4",
	"A4",
	"G4",
	"F4",
	"E4",
	"D4",
	"C4",
	"B3",
	"A3",
	"G3",
	"F3",
	"E3",
	"D3",
	"C3",
];

function freqToMidi(freq: number) {
	return 69 + 12 * Math.log2(freq / 440);
}

function midiToNoteIndex(midi: number) {
	const rounded = Math.round(midi);
	const noteNumber = rounded % 12;
	const octave = Math.floor(rounded / 12) - 1;

	const names = [
		"C",
		"C#",
		"D",
		"D#",
		"E",
		"F",
		"F#",
		"G",
		"G#",
		"A",
		"A#",
		"B",
	];
	const note = names[noteNumber] + octave;

	return NOTES.indexOf(note);
}

export interface PitchTimelineHandle {
	addPitch: (freq: number) => void;
}

const PitchNoteTimeline = forwardRef<PitchTimelineHandle>((_, ref) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const bufferRef = useRef<number[]>([]);

	useImperativeHandle(ref, () => ({
		addPitch(freq: number) {
			if (freq === -1) {
				bufferRef.current.push(-1);
				return;
			}

			const midi = freqToMidi(freq);
			const index = midiToNoteIndex(midi);

			bufferRef.current.push(index);
		},
	}));

	useEffect(() => {
		const canvas = canvasRef.current!;
		const ctx = canvas.getContext("2d")!;

		const width = canvas.width;
		const height = canvas.height;

		const rowHeight = height / NOTES.length;

		const draw = () => {
			ctx.fillStyle = "black";
			ctx.fillRect(0, 0, width, height);

			// draw note grid
			ctx.strokeStyle = "#333";
			ctx.fillStyle = "white";
			ctx.font = "12px monospace";

			NOTES.forEach((note, i) => {
				const y = i * rowHeight;

				ctx.beginPath();
				ctx.moveTo(0, y);
				ctx.lineTo(width, y);
				ctx.stroke();

				ctx.fillText(note, 5, y + rowHeight - 4);
			});

			const step = width / (WINDOW_SECONDS * FPS);

			let x = width - bufferRef.current.length * step;

			ctx.fillStyle = "cyan";

			bufferRef.current.forEach((noteIndex) => {
				if (noteIndex !== -1) {
					const y = noteIndex * rowHeight + rowHeight / 2;

					ctx.beginPath();
					ctx.arc(x, y, 3, 0, Math.PI * 2);
					ctx.fill();
				}

				x += step;
			});

			if (bufferRef.current.length > WINDOW_SECONDS * FPS) {
				bufferRef.current.shift();
			}

			requestAnimationFrame(draw);
		};

		draw();
	}, []);

	return (
		<canvas
			ref={canvasRef}
			width={900}
			height={250}
			style={{
				width: "100%",
				border: "1px solid #444",
				borderRadius: 8,
			}}
		/>
	);
});

export default PitchNoteTimeline;

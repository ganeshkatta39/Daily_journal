import {
	detectPitch,
	resetPitchDetector,
	getNoteFromFrequency,
} from "./pitchUtils";

export function startAudioProcessing(
	analyser: AnalyserNode,
	canvas: HTMLCanvasElement,
	_sampleRate: number,
	setNote: (note: string) => void,
	animationRef: React.MutableRefObject<number | null>,
	isDetectingRef: React.MutableRefObject<boolean>,
	pitchTimelineRef: React.MutableRefObject<any>,
) {
	resetPitchDetector();
	const ctx = canvas.getContext("2d");
	const dataArray = new Float32Array(analyser.fftSize);
	let frameCount = 0;
	const loop = () => {
		if (!isDetectingRef.current) return;

		animationRef.current = requestAnimationFrame(loop);

		analyser.getFloatTimeDomainData(dataArray);

		// ---- Pitch Detection ----
		const freq = detectPitch(dataArray);
		if ((window as any).addPitchToTimeline) {
			(window as any).addPitchToTimeline(freq);
		}
		pitchTimelineRef.current?.addPitch(freq);
		frameCount++; // modified to update only 12times per sec instead of original 60
		if (freq !== -1 && frameCount % 5 === 0) {
			setNote(getNoteFromFrequency(freq));
		}

		// ---- Waveform Drawing ----
		if (!ctx) return;

		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.strokeStyle = "lime";
		ctx.beginPath();

		const sliceWidth = canvas.width / dataArray.length;
		let x = 0;

		for (let i = 0; i < dataArray.length; i++) {
			const y = (dataArray[i] * canvas.height) / 2 + canvas.height / 2;

			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);

			x += sliceWidth;
		}

		ctx.stroke();
	};

	loop();
}

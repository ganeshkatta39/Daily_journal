import { YIN } from "pitchfinder";

const yinDetector = YIN({
	threshold: 0.1,
});

let lastPitch: number | null = null;

const pitchBuffer: number[] = [];
const MEDIAN_WINDOW = 5;

function getRMS(buffer: Float32Array) {
	let sum = 0;

	for (let i = 0; i < buffer.length; i++) {
		sum += buffer[i] * buffer[i];
	}

	return Math.sqrt(sum / buffer.length);
}

export function detectPitch(buffer: Float32Array) {
	const rms = getRMS(buffer);

	// noise gate
	if (rms < 0.005) {
		return lastPitch ?? -1;
	}
	// // for a discontued line
	// if (rms < 0.01) {
	// 	return -1;
	// }

	const pitch = yinDetector(buffer);

	if (!pitch || pitch < 80 || pitch > 1000) {
		return lastPitch ?? -1;
	}

	// smoothing
	if (lastPitch === null) {
		lastPitch = pitch;
	} else {
		lastPitch = lastPitch * 0.8 + pitch * 0.2;
	}

	// median filter
	pitchBuffer.push(lastPitch);

	if (pitchBuffer.length > MEDIAN_WINDOW) {
		pitchBuffer.shift();
	}

	const sorted = [...pitchBuffer].sort((a, b) => a - b);
	const median = sorted[Math.floor(sorted.length / 2)];

	return median;
}

export function resetPitchDetector() {
	lastPitch = null;
	pitchBuffer.length = 0;
}

export const getNoteFromFrequency = (frequency: number) => {
	const noteNames = [
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

	const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
	const noteIndex = midi % 12;
	const octave = Math.floor(midi / 12) - 1;

	return `${noteNames[noteIndex]}${octave}`;
};

import { useRef } from "react";
import { startAudioProcessing } from "../utils/audioVisualizer";
import type { PitchRibbonHandle } from "../components/PitchRibbonTimeline";

export const usePitchAnalyzer = () => {
	const animationRef = useRef<number | null>(null);
	const isDetectingRef = useRef(false);
	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const mediaElementSourceRef = useRef<MediaElementAudioSourceNode | null>(
		null,
	);

	const streamRef = useRef<MediaStream | null>(null);

	const startAnalyzer = (
		source: MediaStream | HTMLAudioElement,
		canvas: HTMLCanvasElement,
		setNote: (note: string) => void,
		pitchTimelineRef: React.MutableRefObject<PitchRibbonHandle | null>,
	) => {
		stopAnalyzer();

		isDetectingRef.current = true;

		if (!audioContextRef.current) {
			audioContextRef.current = new AudioContext();
		}

		const audioContext = audioContextRef.current;

		const analyser = audioContext.createAnalyser();
		analyser.fftSize = 4096;

		analyserRef.current = analyser;

		if (source instanceof MediaStream) {
			streamRef.current = source;

			const streamSource = audioContext.createMediaStreamSource(source);
			streamSource.connect(analyser);
		} else {
			// IMPORTANT: create only once
			if (!mediaElementSourceRef.current) {
				mediaElementSourceRef.current =
					audioContext.createMediaElementSource(source);
			}

			mediaElementSourceRef.current.connect(analyser);
			analyser.connect(audioContext.destination);
		}

		startAudioProcessing(
			analyser,
			canvas,
			audioContext.sampleRate,
			setNote,
			animationRef,
			isDetectingRef,
			pitchTimelineRef,
		);
	};

	const stopAnalyzer = () => {
		isDetectingRef.current = false;

		if (animationRef.current) {
			cancelAnimationFrame(animationRef.current);
			animationRef.current = null;
		}

		streamRef.current?.getTracks().forEach((track) => track.stop());
		streamRef.current = null;

		analyserRef.current?.disconnect();
		analyserRef.current = null;
	};

	return { startAnalyzer, stopAnalyzer };
};

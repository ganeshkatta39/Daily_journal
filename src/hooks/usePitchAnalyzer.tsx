import { useRef } from "react";
import { startAudioProcessing } from "../utils/audioVisualizer";
import type { PitchRibbonHandle } from "../components/PitchRibbonTimeline";

export const usePitchAnalyzer = () => {
	const animationRef = useRef<number | null>(null);
	const isDetectingRef = useRef(false);

	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const sourceRef = useRef<
		MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null
	>(null);

	const startAnalyzer = (
		sourceStream: MediaStream | HTMLAudioElement,
		canvas: HTMLCanvasElement,
		sampleRateSetter: (note: string) => void,
		pitchTimelineRef: React.MutableRefObject<PitchRibbonHandle | null>,
	) => {
		isDetectingRef.current = true;

		if (!audioContextRef.current) {
			const audioContext = new AudioContext();
			audioContextRef.current = audioContext;

			const analyser = audioContext.createAnalyser();
			analyser.fftSize = 2048;

			analyserRef.current = analyser;

			if (sourceStream instanceof MediaStream) {
				const source = audioContext.createMediaStreamSource(sourceStream);
				source.connect(analyser);
				sourceRef.current = source;
			} else {
				const source = audioContext.createMediaElementSource(sourceStream);
				source.connect(analyser);
				analyser.connect(audioContext.destination);
				sourceRef.current = source;
			}
		}

		if (analyserRef.current) {
			startAudioProcessing(
				analyserRef.current,
				canvas,
				audioContextRef.current!.sampleRate,
				sampleRateSetter,
				animationRef,
				isDetectingRef,
				pitchTimelineRef,
			);
		}
	};

	const stopAnalyzer = () => {
		isDetectingRef.current = false;

		if (animationRef.current) {
			cancelAnimationFrame(animationRef.current);
			animationRef.current = null;
		}
	};

	return { startAnalyzer, stopAnalyzer };
};

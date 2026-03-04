import React, { useRef, useState } from "react";
import RecorderControls from "./RecorderControls";
import WaveformCanvas from "./WaveformCanvas";
import AudioPlayer from "./AudioPlayer";
import { startAudioProcessing } from "../utils/audioVisualizer";
import PitchTimelineCanvas from "./PitchTimelineCanvas";
import PitchNoteTimeline from "./PitchNoteTimeline";
import type { PitchTimelineHandle } from "./PitchNoteTimeline";
import PitchRibbonTimeline from "./PitchRibbonTimeline";
import type { PitchRibbonHandle } from "./PitchRibbonTimeline";

import { usePitchAnalyzer } from "../hooks/usePitchAnalyzer";

const PitchRecorder: React.FC = () => {
	const [isRecording, setIsRecording] = useState(false);
	const [audioURL, setAudioURL] = useState<string | null>(null);
	const [note, setNote] = useState<string>("--");
	const isDetectingRef = useRef(false);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const animationRef = useRef<number | null>(null);
	const playbackAudioContextRef = useRef<AudioContext | null>(null);
	const playbackAnalyserRef = useRef<AnalyserNode | null>(null);
	const playbackSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
	const pitchTimelineRef = useRef<PitchTimelineHandle | null>(null);
	const [snapToNote, setSnapToNote] = useState(false);
	const { startAnalyzer, stopAnalyzer } = usePitchAnalyzer();

	const startRecording = async () => {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

		const canvas = canvasRef.current;

		if (canvas) {
			startAnalyzer(stream, canvas, setNote, pitchTimelineRef);
		}
	};

	const stopRecording = () => {
		mediaRecorderRef.current?.stop();

		isDetectingRef.current = false;

		if (animationRef.current) {
			cancelAnimationFrame(animationRef.current);
			animationRef.current = null;
		}

		setNote("--");
		setIsRecording(false);
	};

	const startPlaybackAnalysis = () => {
		if (!audioRef.current) return;

		isDetectingRef.current = true;

		if (!playbackAudioContextRef.current) {
			const audioContext = new AudioContext();
			playbackAudioContextRef.current = audioContext;

			const analyser = audioContext.createAnalyser();
			analyser.fftSize = 2048;
			playbackAnalyserRef.current = analyser;

			const source = audioContext.createMediaElementSource(audioRef.current);
			playbackSourceRef.current = source;

			source.connect(analyser);
			analyser.connect(audioContext.destination);
		}

		const analyser = playbackAnalyserRef.current;
		const canvas = canvasRef.current;

		if (analyser && canvas) {
			startAudioProcessing(
				analyser,
				canvas,
				playbackAudioContextRef.current!.sampleRate,
				setNote,
				animationRef,
				isDetectingRef,
				pitchTimelineRef,
			);
		}
	};

	const stop_detection = () => {
		isDetectingRef.current = false;

		if (animationRef.current) {
			cancelAnimationFrame(animationRef.current);
			animationRef.current = null;
		}

		setNote("--");
	};

	return (
		<div style={{ padding: 20 }}>
			<h2>🎤 Pitch Detection Recorder</h2>

			<RecorderControls
				isRecording={isRecording}
				startRecording={startRecording}
				stopRecording={stopRecording}
			/>

			<WaveformCanvas canvasRef={canvasRef} />

			<PitchTimelineCanvas />
			{/* <PitchNoteTimeline ref={pitchTimelineRef} /> */}
			<button
				onClick={() => setSnapToNote((v) => !v)}
				style={{ marginBottom: 10 }}
			>
				{snapToNote ? "Disable Note Snap" : "Enable Note Snap"}
			</button>
			<PitchRibbonTimeline ref={pitchTimelineRef} snapToNote={snapToNote} />

			<h2>Note: {note}</h2>

			{audioURL && (
				<AudioPlayer
					audioURL={audioURL}
					audioRef={audioRef}
					onPlay={startPlaybackAnalysis}
					onEnded={stop_detection}
				/>
			)}
		</div>
	);
};

export default PitchRecorder;

import React, { useRef, useState } from "react";
import RecorderControls from "./RecorderControls";
import WaveformCanvas from "./WaveformCanvas";
import AudioPlayer from "./AudioPlayer";
import PitchTimelineCanvas from "./PitchTimelineCanvas";
import PitchRibbonTimeline from "./PitchRibbonTimeline";
import type { PitchRibbonHandle } from "./PitchRibbonTimeline";
import { usePitchAnalyzer } from "../hooks/usePitchAnalyzer";

const PitchRecorder: React.FC = () => {
	const [isRecording, setIsRecording] = useState(false);
	const [audioURL, setAudioURL] = useState<string | null>(null);
	const [note, setNote] = useState<string>("--");
	const [snapToNote, setSnapToNote] = useState(false);

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const pitchTimelineRef = useRef<PitchRibbonHandle | null>(null);

	const { startAnalyzer, stopAnalyzer } = usePitchAnalyzer();

	const startRecording = async () => {
		pitchTimelineRef.current?.reset();

		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

		const mediaRecorder = new MediaRecorder(stream);
		mediaRecorderRef.current = mediaRecorder;

		audioChunksRef.current = [];

		mediaRecorder.ondataavailable = (event: BlobEvent) => {
			audioChunksRef.current.push(event.data);
		};

		mediaRecorder.onstop = () => {
			const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
			const url = URL.createObjectURL(blob);

			setAudioURL(url);
		};

		mediaRecorder.start();

		if (canvasRef.current) {
			startAnalyzer(stream, canvasRef.current, setNote, pitchTimelineRef);
		}

		setIsRecording(true);
	};

	const stopRecording = () => {
		mediaRecorderRef.current?.stop();

		stopAnalyzer();

		setNote("--");
		setIsRecording(false);
	};

	const startPlaybackAnalysis = () => {
		if (!audioRef.current || !canvasRef.current) return;

		pitchTimelineRef.current?.reset();

		startAnalyzer(
			audioRef.current,
			canvasRef.current,
			setNote,
			pitchTimelineRef,
		);
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
					onEnded={stopAnalyzer}
				/>
			)}
		</div>
	);
};

export default PitchRecorder;

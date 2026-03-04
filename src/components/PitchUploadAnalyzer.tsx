import React, { useRef, useState } from "react";
import WaveformCanvas from "./WaveformCanvas";
import AudioPlayer from "./AudioPlayer";
import PitchRibbonTimeline from "./PitchRibbonTimeline";
import type { PitchRibbonHandle } from "./PitchRibbonTimeline";
import { usePitchAnalyzer } from "../hooks/usePitchAnalyzer";

const PitchUploadAnalyzer: React.FC = () => {
	const [audioURL, setAudioURL] = useState<string | null>(null);
	const [note, setNote] = useState("--");

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const pitchTimelineRef = useRef<PitchRibbonHandle | null>(null);

	const { startAnalyzer, stopAnalyzer } = usePitchAnalyzer();

	const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setAudioURL(URL.createObjectURL(file));
	};

	const startPlaybackAnalysis = () => {
		if (!audioRef.current || !canvasRef.current) return;

		startAnalyzer(
			audioRef.current,
			canvasRef.current,
			setNote,
			pitchTimelineRef,
		);
	};

	return (
		<div style={{ padding: 20 }}>
			<h2>Upload Singing Recording</h2>

			<input type="file" accept="audio/*" onChange={handleUpload} />

			<WaveformCanvas canvasRef={canvasRef} />

			<PitchRibbonTimeline ref={pitchTimelineRef} snapToNote={false} />

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

export default PitchUploadAnalyzer;

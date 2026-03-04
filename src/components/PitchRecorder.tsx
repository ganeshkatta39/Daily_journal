import React, { useRef, useState } from "react";
import RecorderControls from "./RecorderControls";
import WaveformCanvas from "./WaveformCanvas";
import AudioPlayer from "./AudioPlayer";
import { autoCorrelate, getNoteFromFrequency } from "../utils/pitchUtils";

const PitchRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [note, setNote] = useState<string>("--");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const startRecording = async () => {
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

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 2048;
    source.connect(analyser);

    const dataArray = new Float32Array(analyser.fftSize);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getFloatTimeDomainData(dataArray);

      const freq = autoCorrelate(dataArray, audioContext.sampleRate);

      if (freq !== -1) {
        setNote(getNoteFromFrequency(freq));
      }

      if (!canvas || !ctx) return;

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

    draw();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsRecording(false);
  };

  const startPlaybackAnalysis = () => {
    if (!audioRef.current) return;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaElementSource(audioRef.current);
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 2048;

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const dataArray = new Float32Array(analyser.fftSize);

    const detect = () => {
      analyser.getFloatTimeDomainData(dataArray);

      const freq = autoCorrelate(dataArray, audioContext.sampleRate);

      if (freq !== -1) {
        setNote(getNoteFromFrequency(freq));
      }

      requestAnimationFrame(detect);
    };

    detect();
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

      <h2>Note: {note}</h2>

      {audioURL && (
        <AudioPlayer
          audioURL={audioURL}
          audioRef={audioRef}
          onPlay={startPlaybackAnalysis}
        />
      )}
    </div>
  );
};

export default PitchRecorder;

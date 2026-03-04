import React, { useState, useRef, useEffect } from "react";

const VoiceRecorderWithWaveform: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startRecording = async (): Promise<void> => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event: BlobEvent) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      const url = URL.createObjectURL(audioBlob);
      setAudioURL(url);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = (): void => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // 🔥 Draw waveform when audioURL changes
  useEffect(() => {
    if (!audioURL) return;

    const drawWaveform = async () => {
      const audioContext = new AudioContext();
      const response = await fetch(audioURL);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const rawData = audioBuffer.getChannelData(0);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#f5f5f5";
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#007bff";
      ctx.beginPath();

      const samples = 1000; // number of waveform bars
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData: number[] = [];

      for (let i = 0; i < samples; i++) {
        const blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j]);
        }
        filteredData.push(sum / blockSize);
      }

      const max = Math.max(...filteredData);

      for (let i = 0; i < samples; i++) {
        const x = (i / samples) * width;
        const y = (filteredData[i] / max) * height;

        ctx.moveTo(x, height / 2 - y / 2);
        ctx.lineTo(x, height / 2 + y / 2);
      }

      ctx.stroke();
    };

    drawWaveform();

    // auto play
    audioRef.current?.play();
  }, [audioURL]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>🎤 Recorder + Waveform</h2>

      {!isRecording ? (
        <button onClick={startRecording}>Start Recording</button>
      ) : (
        <button onClick={stopRecording}>Stop Recording</button>
      )}

      {audioURL && (
        <>
          <div style={{ marginTop: "20px" }}>
            <audio ref={audioRef} src={audioURL} controls />
          </div>

          <canvas
            ref={canvasRef}
            width={600}
            height={200}
            style={{ marginTop: "20px", border: "1px solid #ccc" }}
          />
        </>
      )}
    </div>
  );
};

export default VoiceRecorderWithWaveform;

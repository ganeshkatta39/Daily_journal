import React, { useRef, useState } from "react";

const LiveWaveformRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const animationRef = useRef<number | null>(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // recorder
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

    // audio context for visualization
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    source.connect(analyser);

    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = canvasRef.current;
    const canvasCtx = canvas?.getContext("2d");

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      if (!canvas || !canvasCtx) return;

      canvasCtx.fillStyle = "black";
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = "lime";

      canvasCtx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };

    draw();

    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setIsRecording(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🎤 Live Waveform Recorder</h2>

      {!isRecording ? (
        <button onClick={startRecording}>Start Recording</button>
      ) : (
        <button onClick={stopRecording}>Stop Recording</button>
      )}

      <canvas
        ref={canvasRef}
        width={700}
        height={200}
        style={{
          border: "1px solid gray",
          marginTop: "20px",
        }}
      />

      {audioURL && (
        <div style={{ marginTop: 20 }}>
          <audio ref={audioRef} src={audioURL} controls autoPlay />
        </div>
      )}
    </div>
  );
};

export default LiveWaveformRecorder;

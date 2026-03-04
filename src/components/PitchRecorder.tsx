import React, { useRef, useState } from "react";

const PitchRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [note, setNote] = useState<string>("--");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // 🎵 frequency → note
  const getNoteFromFrequency = (frequency: number) => {
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

  // 🎯 pitch detection
  const autoCorrelate = (buffer: Float32Array, sampleRate: number) => {
    let SIZE = buffer.length;
    let rms = 0;

    for (let i = 0; i < SIZE; i++) {
      rms += buffer[i] * buffer[i];
    }

    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1;

    let r1 = 0,
      r2 = SIZE - 1;

    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < 0.2) {
        r1 = i;
        break;
      }
    }

    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < 0.2) {
        r2 = SIZE - i;
        break;
      }
    }

    buffer = buffer.slice(r1, r2);
    SIZE = buffer.length;

    const c = new Array(SIZE).fill(0);

    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE - i; j++) {
        c[i] += buffer[j] * buffer[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;

    let maxval = -1;
    let maxpos = -1;

    for (let i = d; i < SIZE; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }

    if (maxpos === 0) return -1;

    return sampleRate / maxpos;
  };

  // 🎤 start recording
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

  // ⏹ stop recording
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsRecording(false);
  };

  // ▶ detect pitch during playback
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

      {!isRecording ? (
        <button onClick={startRecording}>Start Recording</button>
      ) : (
        <button onClick={stopRecording}>Stop Recording</button>
      )}

      <canvas
        ref={canvasRef}
        width={700}
        height={200}
        style={{ border: "1px solid gray", marginTop: 20 }}
      />

      <h2>Note: {note}</h2>

      {audioURL && (
        <audio
          ref={audioRef}
          src={audioURL}
          controls
          onPlay={startPlaybackAnalysis}
          style={{ marginTop: 20 }}
        />
      )}
    </div>
  );
};

export default PitchRecorder;

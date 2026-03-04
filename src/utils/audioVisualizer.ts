import { autoCorrelate, getNoteFromFrequency } from "./pitchUtils";

export function startAudioProcessing(
  analyser: AnalyserNode,
  canvas: HTMLCanvasElement,
  sampleRate: number,
  setNote: (note: string) => void,
  animationRef: React.MutableRefObject<number | null>,
  isDetectingRef: React.MutableRefObject<boolean>,
) {
  const ctx = canvas.getContext("2d");
  const dataArray = new Float32Array(analyser.fftSize);

  const loop = () => {
    if (!isDetectingRef.current) return;

    animationRef.current = requestAnimationFrame(loop);

    analyser.getFloatTimeDomainData(dataArray);

    // ---- Pitch Detection ----
    const freq = autoCorrelate(dataArray, sampleRate);
    if (freq !== -1) {
      setNote(getNoteFromFrequency(freq));
    }

    // ---- Waveform Drawing ----
    if (!ctx) return;

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

  loop();
}

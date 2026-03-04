export function drawWaveform(
  analyser: AnalyserNode,
  canvas: HTMLCanvasElement,
  dataArray: Float32Array<ArrayBuffer>,
  animationRef: React.MutableRefObject<number | null>,
) {
  const ctx = canvas.getContext("2d");

  const draw = () => {
    animationRef.current = requestAnimationFrame(draw);

    analyser.getFloatTimeDomainData(dataArray);

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

  draw();
}

import { autoCorrelate, getNoteFromFrequency } from "./pitchUtils";

export function detectPitch(
  analyser: AnalyserNode,
  sampleRate: number,
  dataArray: Float32Array<ArrayBuffer>,
  setNote: (note: string) => void,
) {
  const detect = () => {
    analyser.getFloatTimeDomainData(dataArray);

    const freq = autoCorrelate(dataArray, sampleRate);

    if (freq !== -1) {
      setNote(getNoteFromFrequency(freq));
    }

    requestAnimationFrame(detect);
  };

  detect();
}

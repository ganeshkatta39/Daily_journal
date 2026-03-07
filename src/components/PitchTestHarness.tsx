import { useState } from "react";
import { detectPitch, getNoteFromFrequency } from "../utils/pitchUtils";

const TEST_TONES = [
  110,   // A2
  146.83,// D3
  196,   // G3
  220,   // A3
  261.63,// C4
  293.66,// D4
  329.63,// E4
  349.23,// F4
  392,   // G4
  440,   // A4
];

function centsError(detected: number, expected: number) {
  return 1200 * Math.log2(detected / expected);
}

export default function PitchTestHarness() {
  const [results, setResults] = useState<any[]>([]);

  const runTest = async () => {
    const audioCtx = new AudioContext();

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 4096;

    const data = new Float32Array(analyser.fftSize);

    const newResults = [];

    for (const freq of TEST_TONES) {
      const osc = audioCtx.createOscillator();
      osc.frequency.value = freq;
      osc.type = "sine";

      osc.connect(analyser);
      analyser.connect(audioCtx.destination);

      osc.start();

      await new Promise(r => setTimeout(r, 400));

      analyser.getFloatTimeDomainData(data);

      const detected = detectPitch(data);

      const cents = centsError(detected, freq);

      newResults.push({
        expected: freq,
        detected,
        note: getNoteFromFrequency(detected),
        cents: cents.toFixed(2)
      });

      osc.stop();

      await new Promise(r => setTimeout(r, 200));
    }

    setResults(newResults);
  };

  return (
    <div style={{ padding: 20 }}>
      <button onClick={runTest}>Run Pitch Test</button>

      <table>
        <thead>
          <tr>
            <th>Expected Hz</th>
            <th>Detected Hz</th>
            <th>Note</th>
            <th>Error (cents)</th>
          </tr>
        </thead>

        <tbody>
          {results.map((r, i) => (
            <tr key={i}>
              <td>{r.expected}</td>
              <td>{r.detected?.toFixed(2)}</td>
              <td>{r.note}</td>
              <td>{r.cents}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
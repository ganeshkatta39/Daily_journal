import { useState } from "react";
import "./App.css";
import { NoteCard } from "./components/NoteCard";
import RecordView from "./components/RecordView";
import VoiceRecorder from "./components/VoiceRecorder";
import VoiceRecorderWithWaveform from "./components/VoiceRecorderWithWaveform";
import PitchRecorder from "./components/PitchRecorder";

import LiveWaveformRecorder from "./components/LiveWaveformRecorder";

function App() {
  const [count, setCount] = useState(0);
  const card = {
    id: "12345",
    title: "",
    content: "",
    date: "12345",
  };

  return (
    <>
      {/* <VoiceRecorder />
      <VoiceRecorderWithWaveform />
      <RecordView /> */}
      <LiveWaveformRecorder />
      <PitchRecorder />
    </>
  );
}

export default App;

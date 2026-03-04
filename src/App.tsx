import { useState } from "react";
import "./App.css";
import PitchRecorder from "./components/PitchRecorder";

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
      <PitchRecorder />
    </>
  );
}

export default App;

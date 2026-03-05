import "./App.css";
import PitchRecorder from "./components/PitchRecorder";
import PitchUploadAnalyzer from "./components/PitchUploadAnalyzer";
import { Analytics } from "@vercel/analytics/react";

function App() {
	return (
		<>
			<PitchRecorder />
			<PitchUploadAnalyzer />
			<Analytics />
		</>
	);
}

export default App;

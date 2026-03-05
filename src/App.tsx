import "./App.css";
import PitchRecorder from "./components/PitchRecorder";
import PitchUploadAnalyzer from "./components/PitchUploadAnalyzer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
	return (
		<>
			<PitchRecorder />
			<PitchUploadAnalyzer />
			<Analytics />
			<SpeedInsights />
		</>
	);
}

export default App;

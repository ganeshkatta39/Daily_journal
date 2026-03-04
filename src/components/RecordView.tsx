import { useReactMediaRecorder } from "react-media-recorder";

const RecordView = () => {
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({ video: false });

  return (
    <div>
      <p>{status}</p>
      <button onClick={startRecording}>Start</button>
      <button onClick={stopRecording}>Stop</button>
      <video src={mediaBlobUrl} controls autoPlay loop />
    </div>
  );
};

export default RecordView;

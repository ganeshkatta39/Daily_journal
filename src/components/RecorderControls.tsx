interface Props {
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
}

const RecorderControls: React.FC<Props> = ({
  isRecording,
  startRecording,
  stopRecording,
}) => {
  return (
    <>
      {!isRecording ? (
        <button onClick={startRecording}>Start Recording</button>
      ) : (
        <button onClick={stopRecording}>Stop Recording</button>
      )}
    </>
  );
};

export default RecorderControls;

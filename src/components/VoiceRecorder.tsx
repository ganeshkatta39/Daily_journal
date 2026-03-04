import React, { useState, useRef } from "react";

const VoiceRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async (): Promise<void> => {
    try {
      const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        // Wait a tiny bit for audio element to update
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play();
          }
        }, 100);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access denied:", error);
    }
  };

  const stopRecording = (): void => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🎤 Voice Recorder (Auto Play)</h2>

      {!isRecording ? (
        <button onClick={startRecording}>Start Recording</button>
      ) : (
        <button onClick={stopRecording}>Stop Recording</button>
      )}

      {audioURL && (
        <div style={{ marginTop: "20px" }}>
          <h3>Playback:</h3>
          <audio ref={audioRef} src={audioURL} controls />
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;

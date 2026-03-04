import React from "react";

interface Props {
  audioURL: string;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onPlay: () => void;
}

const AudioPlayer: React.FC<Props> = ({ audioURL, audioRef, onPlay }) => {
  return (
    <audio
      ref={audioRef}
      src={audioURL}
      controls
      onPlay={onPlay}
      style={{ marginTop: 20 }}
    />
  );
};

export default AudioPlayer;

import React from "react";

interface Props {
  audioURL: string;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onPlay: () => void;
  onEnded: () => void;
}

const AudioPlayer: React.FC<Props> = ({
  audioURL,
  audioRef,
  onPlay,
  onEnded,
}) => {
  return (
    <audio
      ref={audioRef}
      src={audioURL}
      controls
      onPlay={onPlay}
      onEnded={onEnded}
      style={{ marginTop: 20 }}
      onPause={onEnded}
    />
  );
};

export default AudioPlayer;

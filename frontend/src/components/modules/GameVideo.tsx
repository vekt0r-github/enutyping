import React, { useState, useEffect } from "react";
import YouTube from "@u-wave/react-youtube";

import styled from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

type Props = {
  source: string,
  started: boolean,
  gameStartTime?: number,
  startGame: () => void,
  volume: number,
  // setDuration: React.Dispatch<React.SetStateAction<number>>,
}

const Youtube = styled(YouTube)`
  pointer-events: none;
`;

const GameVideo = ({ source, started, gameStartTime, startGame, volume } : Props) => {
  if (!source) { return null; }
  const videoCode = source.split("v=")[1].split("&")[0];

  const [player, setPlayer] = useState<YT.Player>();

  useEffect(() => {
    if (!player || !started) { return; }
    player.playVideo();
  }, [player, started]);

  useEffect(() => {
    if (!player) {
      return;
    }
    // setDuration(player.getDuration());
  }, [player]);

  const onReady = (e : YT.PlayerEvent) => {
    setPlayer(e.target);
  };

  const onStateChange = (e : YT.OnStateChangeEvent) => {
    if (e.data === 1 && !gameStartTime) { // playing and hasn't started before
      startGame();
    }
  };

  const f = () => {console.log("We Done FUcked Up")};

  return (
    <Youtube
      video={videoCode}
      width={400}
      height={300}
      volume={volume}
      paused={false}
      showCaptions={false}
      controls={false}
      disableKeyboard={true}
      allowFullscreen={false}
      annotations={false}
      modestBranding={true}
      playsInline={true}
      showRelatedVideos={false}
      onReady={onReady}
      onStateChange={onStateChange}
      onBuffering={f}
      onPause={f}
    />
  );
}

export default GameVideo;

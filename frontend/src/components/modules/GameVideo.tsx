import React, { useState, useEffect } from "react";
import YouTube from "@u-wave/react-youtube";

import styled, { css } from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

type Props = {
  source: string,
  started: boolean,
  volume: number,
}

const Youtube = styled(YouTube)`
  pointer-events: none;
`;

const GameVideo = ({ source, started, volume } : Props) => {
  if (!source) { return null; }
  const videoCode = source.split("v=")[1].split("&")[0];

  const [player, setPlayer] = useState<YT.Player>();

  useEffect(() => {
    if (!player || !started) { return; }
    player.playVideo();
  }, [player, started]);

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
      onReady={(e : YT.PlayerEvent) => {
        setPlayer(e.target);
      }}
      onBuffering={f}
      onPause={f}
    />
  );
}

export default GameVideo;
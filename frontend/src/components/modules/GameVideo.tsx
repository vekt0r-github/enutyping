import React, { useState, useEffect } from "react";
import YouTube from "@u-wave/react-youtube";

import styled, { css } from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

enum PlayerState { // THank you Google very cool
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}

type Props = {
  source: string,
  starting: boolean,
}

const Youtube = styled(YouTube)`
  pointer-events: none;
`;

const GameVideo = ({ source, starting } : Props) => {
  if (!source) { return null; }
  const videoCode = source.split("v=")[1].split("&")[0];

  const [player, setPlayer] = useState<YT.Player>();

  useEffect(() => {
    if (!player || !starting) { return; }
    if (player.getPlayerState() === 1) { return; }
    player.playVideo();
  }, [player, starting]);

  const f = () => {console.log("We Done FUcked Up")};

  return (
    <Youtube
      video={videoCode}
      width={400}
      height={300}
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
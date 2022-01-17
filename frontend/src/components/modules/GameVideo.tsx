import React, { useState, useEffect } from "react";
import YouTube from "@u-wave/react-youtube";

import YTThumbnail from "@/components/modules/YTThumbnail";

import { Status } from "@/components/modules/GameArea";

import styled, { css } from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

type Props = {
  yt_id: string,
  status: Status,
  gameStartTime?: number,
  startGame: () => void,
  volume: number,
  // setDuration: React.Dispatch<React.SetStateAction<number>>,
}

const VideoContainer = styled.div`
  width: calc(var(--game-width) / 2);
  height: calc(var(--game-height) / 2);
  position: relative;
`;

const Video = styled(YouTube)<{show: boolean}>`
  pointer-events: none;
  position: absolute;
  z-index: 0;
  ${(props) => !props.show ? css`
    display: none
  ` : ''};
`;

const Overlay = styled(YTThumbnail)`
  position: absolute;
  z-index: 1;
`;

const GameVideo = ({ yt_id, status, gameStartTime, startGame, volume } : Props) => {
  if (!yt_id) { return null; }
  const source = `https://www.youtube.com/watch?v=${yt_id}`;
  const videoCode = source.split("v=")[1].split("&")[0];

  const [player, setPlayer] = useState<YT.Player>();
  const [playing, setPlaying] = useState<boolean>(false);

  useEffect(() => {
    if (!player || gameStartTime) { return; }
    if (status === Status.UNSTARTED) {
      player.stopVideo();
    } else if (status === Status.STARTQUEUED) {
      player.playVideo();
    }
  }, [player, status]);

  const onReady = (e : YT.PlayerEvent) => {
    setPlayer(e.target);
  };

  const onStateChange = (e : YT.OnStateChangeEvent) => {
    const playing = e.data === 1;
    setPlaying(playing);
    if (playing && status === Status.STARTQUEUED && !gameStartTime) { 
      // playing and should be playing and didn't start game
      startGame();
    }
  };

  const f = () => {console.log("We Done FUcked Up")};

  return (
    <VideoContainer>
      <Video
        video={videoCode}
        show={playing}
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
      {!playing ? 
        <Overlay yt_id={yt_id} width={400} height={300} />
        : null}
    </VideoContainer>
  );
}

export default GameVideo;

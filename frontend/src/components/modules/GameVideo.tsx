import React, { useState, useEffect } from "react";

import YTVideo from "@/components/modules/YTVideo";

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

const GameVideo = ({ yt_id, status, gameStartTime, startGame, volume } : Props) => {
  if (!yt_id) { return null; }

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
    <YTVideo
      yt_id={yt_id}
      show={playing}
      volume={volume}
      options={{
        onReady: onReady,
        onStateChange: onStateChange,
        onBuffering: f,
        onPause: f,
      }}
    />
  );
}

export default GameVideo;

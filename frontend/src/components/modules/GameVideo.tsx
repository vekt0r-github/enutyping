import React, { useState, useEffect } from "react";

import YTVideo from "@/components/modules/YTVideo";

import { Status } from "@/components/modules/GameArea";

import styled, { css } from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

type Props = {
  yt_id: string,
  status: Status,
  currTime?: number,
  startGame: () => void,
  volume: number,
  // setDuration: React.Dispatch<React.SetStateAction<number>>,
}

const GameVideo = ({ yt_id, status, currTime, startGame, volume } : Props) => {
  if (!yt_id) { return null; }

  const [player, setPlayer] = useState<YT.Player>();
  const [playing, setPlaying] = useState<boolean>(false);

  useEffect(() => {
    if (!player || !currTime) { return; }
    if ([Status.PAUSED, Status.SEEKING].includes(status)) {
      // only seek when manually changed in editor
      player.seekTo(currTime / 1000, true);
    }
  }, [currTime]);

  useEffect(() => {
    if (!player) { return; }
    if (status === Status.UNSTARTED) {
      player.stopVideo();
    } else if (status === Status.PAUSED) {
      player.pauseVideo();
    } else if ([Status.STARTQUEUED, Status.PLAYING].includes(status)) {
      player.playVideo();
    }
  }, [player, status]);

  const onReady = (e : YT.PlayerEvent) => {
    setPlayer(e.target);
  };

  const onStateChange = (e : YT.OnStateChangeEvent) => {
    const playing = e.data === 1;
    setPlaying(playing);
    if (playing && status === Status.STARTQUEUED) { 
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

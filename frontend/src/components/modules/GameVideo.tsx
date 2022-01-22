import React, { useState, useEffect } from "react";

import YTVideo from "@/components/modules/YTVideo";

import { GameStatus } from "@/utils/types";

import styled, { css } from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

type Props = {
  yt_id: string,
  status: GameStatus,
  currTime?: number,
  startGame: () => void,
  volume: number,
}

const GameVideo = ({ yt_id, status, currTime, startGame, volume } : Props) => {
  if (!yt_id) { return null; }

  const [player, setPlayer] = useState<YT.Player>();
  const [playing, setPlaying] = useState<boolean>(false); // not stopped (playing or paused)

  useEffect(() => {
    if (!player || !currTime) { return; }
    const threshold = 0.5; // number of seconds before video corrects itself
    // only seek when manually changed in editor
    if (status === GameStatus.PAUSED) {
      player.seekTo(currTime / 1000, true);
    } else if (Math.abs(currTime / 1000 - player.getCurrentTime()) > threshold) {
      console.log(currTime, player.getCurrentTime())
      player.seekTo(currTime / 1000, true);
    }
  }, [currTime]);

  useEffect(() => {
    if (!player) { return; }
    if (status === GameStatus.UNSTARTED) {
      player.stopVideo();
    } else if (status === GameStatus.PAUSED) {
      player.pauseVideo();
    } else if ([GameStatus.STARTQUEUED, GameStatus.PLAYING].includes(status)) {
      player.playVideo();
    }
  }, [player, status]);

  const onReady = (e : YT.PlayerEvent) => {
    setPlayer(e.target);
  };


  const onStateChange = (e : YT.OnStateChangeEvent) => {
    const playing = [1, 2, 3].includes(e.data);
    setPlaying(playing);
    if (playing && status === GameStatus.STARTQUEUED) { 
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

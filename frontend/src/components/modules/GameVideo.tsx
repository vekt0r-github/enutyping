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
  const seek = () => player && currTime && player.seekTo(currTime / 1000, true);

  useEffect(() => {
    if (!player || !currTime) { return; }
    const TOLERANCE_THRESHOLD = 0.3; // number of seconds before video corrects itself
    // only seek when manually changed in editor
    if (status === GameStatus.PAUSED) {
      seek();
    } else if (Math.abs(currTime / 1000 - player.getCurrentTime()) > TOLERANCE_THRESHOLD) {
      seek();
    }
  }, [currTime]);

  useEffect(() => {
    if (!player) { return; }
    if (status === GameStatus.UNSTARTED) {
      player.stopVideo();
    } else if (status === GameStatus.PAUSED) {
      player.playVideo();
      if (playing) { player.pauseVideo(); }
    } else if ([GameStatus.STARTQUEUED, GameStatus.PLAYING, GameStatus.AUTOPLAYING].includes(status)) {
      seek();
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
    } else if (playing && status === GameStatus.PAUSED) { 
      player?.pauseVideo();
    }
  };

  return (
    <YTVideo
      yt_id={yt_id}
      show={playing}
      volume={volume}
      options={{
        onReady: onReady,
        onStateChange: onStateChange,
      }}
    />
  );
}

export default GameVideo;

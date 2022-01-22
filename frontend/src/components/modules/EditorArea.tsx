import React, { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";

import GameAreaDisplay from "@/components/modules/GameAreaDisplay";

import { post } from '@/utils/functions';
import { 
  User, Beatmap, LineData, Config,
  GameStatus, GameState 
} from "@/utils/types";
import { 
  timeToLineIndex, 
  updateStatsOnKeyPress, 
  updateStatsOnLineEnd 
} from '@/utils/beatmaputils';

import styled from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

type Props = {
  user: User | null,
  beatmap: Beatmap,
  config: Config,
};

const EditorArea = ({ user, beatmap, config } : Props) => {
  const initState = () : GameState => ({
    status: GameStatus.PAUSED,
    offset: 0,
    currTime: undefined, // maintained via timer independent of video
    stats: {
      hits: 0,
      misses: 0,
      kanaHits: 0,
      kanaMisses: 0,
      totalKana: 0,
      score: 0,
    },
  });
  const [gameState, setGameState] = useState<GameState>(initState());
  const set = <K extends keyof GameState>(
    prop : K, 
    val : GameState[K] | ((oldState: GameState[K]) => GameState[K]),
  ) => {
    setGameState((state) => ({ ...state, 
      [prop]: typeof val === "function" ? val(state[prop]) : val,
    }))
  };

  // from iframe API; in seconds, rounded? maybe
  // maybe need later but idk
  // const [duration, setDuration] = useState<number>(Infinity);

  const lines = beatmap.lines as LineData[];
  const {status, offset, currTime, stats} = gameState;
  const currIndex = (currTime !== undefined) ? timeToLineIndex(lines, currTime) : undefined; 
  const isEditing = [GameStatus.PAUSED, GameStatus.AUTOPLAYING].includes(status);
  const isTesting = status === GameStatus.PLAYING;

  const startTest = () => {
    if (!isEditing) { return; }
    set('status', GameStatus.PLAYING);
  }

  const stopTest = () => {
    setGameState((oldState) => ({ ...oldState,
      status: GameStatus.PAUSED,
      stats: initState().stats,
    }));
  };

  const onKeyPress = (e: KeyboardEvent) => {
    if (e.key === "t") { // enter testing mode
      startTest();
    };
    if (e.key === " ") { // play/pause in normal edit mode
      if (isEditing) { 
        e.preventDefault();
        e.stopPropagation();
        set('status', (status === GameStatus.PAUSED) ? GameStatus.AUTOPLAYING : GameStatus.PAUSED);
      }
    };
    if (e.key === "Escape") {
      if (isTesting) { stopTest(); } 
      if (isEditing) { set('status', GameStatus.GOBACK); }
    }
  };

  useEffect(() => {
    // start game-- status must change to PLAYING
    // will cancel all game actions if status changes from PLAYING
    if (status !== GameStatus.PLAYING) { return; }
    const gameStartTime = new Date().getTime() - (currTime ?? 0); // resume at current time
    const intervalId = setInterval(() => {
      set('currTime', new Date().getTime() - gameStartTime);
    }, 50);
    return () => {
      clearInterval(intervalId);
    };
  }, [status]);

  useEffect(() => {
    if (currIndex === undefined) { return; }
    if (currIndex === lines.length) {
      set('status', GameStatus.PAUSED);
    } else if (currIndex > 0) {
      set('stats', (oldStats) => updateStatsOnLineEnd(oldStats, lines[currIndex-1]));
    }
  }, [currIndex]);
  
  useEffect(() => {
    document.addEventListener("keydown", onKeyPress);
    return () => {
      document.removeEventListener("keydown", onKeyPress);
    }
  }, [status]); // may eventually depend on other things

  const keyCallback = (hit: number, miss: number, endKana: boolean) => {
		set('stats', (oldStats) => updateStatsOnKeyPress(oldStats, hit, miss, endKana));
  }

  if (status === GameStatus.GOBACK) {
    return <Navigate to={`/edit/${beatmap.beatmapset.id}`} replace={true} />;
  }
  
  return (
    <GameAreaDisplay
      user={user}
      beatmap={beatmap}
      gameState={gameState}
      keyCallback={keyCallback}
      setGameState={setGameState}
      config={config}
    />
  );
}

export default EditorArea;

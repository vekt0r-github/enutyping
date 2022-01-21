import React, { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";

import GameAreaDisplay from "@/components/modules/GameAreaDisplay";

import { post } from '@/utils/functions';
import { User, Beatmap, LineData, Config } from "@/utils/types";
import { computeLineKana, timeToLineIndex } from '@/utils/beatmaputils';

import styled from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

export enum Status { 
  UNSTARTED, STARTQUEUED, PLAYING, SUBMITTING, ENDED,
  GOBACK, // if esc is pressed
  PAUSED, SEEKING, // only for editor
};

type Props = {
  user: User | null,
  beatmap: Beatmap,
  config: Config,
  afterGameEnd: () => void,
};

export type GameState = {
  status: Status,
  offset: number,
  currTime?: number,
  hits: number,
  misses: number,
	kanaHits: number,
	totalKana: number,
  score: number
};

const GameArea = ({ user, beatmap, config, afterGameEnd } : Props) => {
  const initState = () : GameState => ({
    status: Status.UNSTARTED,
    offset: 0,
    currTime: undefined, // maintained via timer independent of video
    hits: 0,
    misses: 0,
		kanaHits: 0,
		totalKana: 0,
    score: 0,
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
  const {status, offset, currTime, hits, misses, kanaHits, totalKana, score} = gameState;
  const currIndex = (currTime !== undefined) ? timeToLineIndex(lines, currTime) : undefined;

  const prepareStartGame = () => {
    if (status !== Status.UNSTARTED) { return; }
    set('status', Status.STARTQUEUED);
  }

  const startGame = (offset: number) => {
    if (status !== Status.STARTQUEUED) { return; }
    setGameState((state) => ({ ...state,
      status: Status.PLAYING,
      offset: offset,
    }));
  };

  const submitScore = () => {
    setGameState((state) => ({ ...state,
      status: Status.SUBMITTING,
    }));
  };

  const endGame = () => {
    setGameState((state) => ({ ...state,
      status: Status.ENDED,
    }));
  };

  const resetGame = () => {
    setGameState(initState());
  };

  const onKeyPress = (e: KeyboardEvent) => {
    if (e.key === " ") { // send signal to start game
      e.preventDefault();
      e.stopPropagation();
      prepareStartGame();
    };
    if (e.key === "Escape") {
      if (status === Status.PLAYING) { endGame(); } 
      if (status === Status.ENDED) { resetGame(); } 
      if (status === Status.UNSTARTED) { set('status', Status.GOBACK); } 
    }
  };

  useEffect(() => {
    // start game-- status must change to PLAYING
    // will cancel all game actions if status changes from PLAYING
    if (status !== Status.PLAYING) { return; }
    const gameStartTime = new Date().getTime() + offset;
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
      submitScore();
    } else if (currIndex > 0) {
      set('totalKana', (oldTotalKana) => oldTotalKana + computeLineKana(lines[currIndex]));
    }
  }, [currIndex]);

  useEffect(() => {
    if (status !== Status.SUBMITTING) { return; }
    if (!user) { endGame(); return; }
    const data = {
      beatmap_id: beatmap.id,
      user_id: user?.id,
      score: gameState.score,
    }
    post('/api/scores', data).then((score) => {
      afterGameEnd();
      endGame();
    });
  }, [status]);
  
  useEffect(() => {
    document.addEventListener("keydown", onKeyPress);
    return () => {
      document.removeEventListener("keydown", onKeyPress);
    }
  }, [status]); // may eventually depend on other things

  const keyCallback = (hit: boolean, endKana: boolean) => {
    if(hit) {
      set('hits', (oldHits) => oldHits + 1);
      if(endKana) {
				set('kanaHits', (oldHits) => oldHits + 1);
        set('score', (oldScore) => oldScore + 10);
      }
    }
    else {
      set('misses', (oldMisses) => oldMisses + 1);
      set('score', (oldScore) => oldScore - 5);
    }
  }

  if (status === Status.GOBACK) {
    return <Navigate to={`/play/${beatmap.beatmapset.id}`} replace={true} />;
  }
  
  return (
    <GameAreaDisplay
      user={user}
      beatmap={beatmap}
      gameState={gameState}
      keyCallback={keyCallback}
      startGame={startGame}
      config={config}
    />
  );
}

export default GameArea;

import React, { useState, useEffect, useContext } from "react";
import { Navigate } from "react-router-dom";

import GameAreaDisplay from "@/components/modules/GameAreaDisplay";

import { Config, configContext } from '@/providers/config';

import { post } from '@/utils/functions';
import { 
  User, Beatmap, LineData,
  GameStatus, GameState,
} from "@/utils/types";
import { 
  makeLineStateAt,
  makeSetFunc,
  timeToLineIndex, 
  GAME_FPS,
} from '@/utils/beatmaputils';
import { updateStateOnLineEnd } from "@/utils/gameplayutils";

import styled from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

type Props = {
  user: User | null,
  beatmap: Beatmap,
	speed: number,
  afterGameEnd: () => void,
	setAvailableSpeeds: React.Dispatch<React.SetStateAction<number[]>>,
};

const initStatsState = () => ({
  hits: 0,
  misses: 0,
  kanaHits: 0,
  kanaMisses: 0,
  totalKana: 0,
  score: 0,
});

const makeInitState = (lines: LineData[], config: Config, speed: number) : GameState => ({
  status: GameStatus.UNSTARTED,
  offset: 0,
  currTime: undefined, // maintained via timer independent of video
  lines: lines.map((lineData) => makeLineStateAt(0, lineData, config)),
  stats: initStatsState(),
  keyLog: [],
});

const GameArea = ({ user, beatmap, speed, afterGameEnd, setAvailableSpeeds } : Props) => {
  const config = useContext(configContext);

  const initState = () => makeInitState(beatmap.lines as LineData[], config, speed);

  const [gameState, setGameState] = useState<GameState>(initState());
  const set = makeSetFunc(setGameState);

  // from iframe API; in seconds, rounded? maybe
  // maybe need later but idk
  // const [duration, setDuration] = useState<number>(Infinity);

  const {status, offset, currTime, lines, stats} = gameState;
  const currIndex = (currTime !== undefined) ? timeToLineIndex(beatmap.lines, currTime * speed) : undefined;

  const prepareStartGame = () => {
    if (status !== GameStatus.UNSTARTED) { return; }
    set('status')(GameStatus.STARTQUEUED);
  }

  const submitScore = () => {
    setGameState((state) => ({
      ...updateStateOnLineEnd(state, lines.length),
      status: GameStatus.SUBMITTING,
    }));
  };

  const endGame = () => {
    setGameState((state) => ({ ...state,
      status: GameStatus.ENDED,
    }));
  };

  const resetGame = () => {
    setGameState(initState());
  };

  const onKeyPress = (e: KeyboardEvent) => {
    if (e.key === " ") { // send signal to start game
      if (status === GameStatus.UNSTARTED) { 
        e.preventDefault();
        e.stopPropagation();
        prepareStartGame();
      }
    };
    if (e.key === "Escape") {
      if (status === GameStatus.PLAYING) { endGame(); } 
      if (status === GameStatus.ENDED) { resetGame(); } 
      if (status === GameStatus.UNSTARTED) { set('status')(GameStatus.GOBACK); } 
    }
  };

  useEffect(() => {
    // start game-- status must change to PLAYING
    // will cancel all game actions if status changes from PLAYING
    if (status !== GameStatus.PLAYING) { return; }
    const gameStartTime = new Date().getTime() + offset;
    const intervalId = setInterval(() => {
      set('currTime')(new Date().getTime() - gameStartTime);
    }, 1000 / (GAME_FPS));
    return () => {
      clearInterval(intervalId);
    };
  }, [status]);

  useEffect(() => {
    if (currIndex === undefined) { return; }
    if (currIndex === lines.length) {
      submitScore();
    } else if (currIndex > 0) {
      setGameState((state) => updateStateOnLineEnd(state, currIndex));
    }
  }, [currIndex]);

  useEffect(() => {
    if (status !== GameStatus.SUBMITTING) { return; }
    if (!user) { endGame(); return; }
    const data = {
      beatmap_id: beatmap.id,
      // Do not provide user_id as the backend should have stored in session
      score: Math.round(stats.score),
      key_accuracy: stats.hits / (stats.hits + stats.misses),
			speed_modification: speed ?? 1,
      kana_accuracy: stats.kanaHits / stats.totalKana
      // if replay ever does get sent to the server
      // server will also need to store useKanaKeyboard
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

  if (status === GameStatus.GOBACK) {
    return <Navigate to={`/play/${beatmap.beatmapset.id}`} replace={true} />;
  }
  
  return (
    <GameAreaDisplay
      user={user}
      beatmap={beatmap}
      gameState={gameState}
      setGameState={setGameState}
			setAvailableSpeeds={setAvailableSpeeds}
			speed={speed}
    />
  );
}

export default GameArea;

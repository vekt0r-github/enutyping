import React, { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";

import GameAreaDisplay from "@/components/modules/GameAreaDisplay";
import EditorTimeline from "@/components/modules/EditorTimeline";

import { post } from '@/utils/functions';
import { 
  User, Beatmap, LineData, Config,
  GameStatus, GameState 
} from "@/utils/types";
import { 
  makeLineStateAt,
  makeSetFunc,
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

const EditorAreaContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const initStatsState = () => ({
  hits: 0,
  misses: 0,
  kanaHits: 0,
  kanaMisses: 0,
  totalKana: 0,
  score: 0,
});

// for during playback
const makeStateAt = (currTime: number, paused: boolean, lines: LineData[], config: Config) : GameState => ({
  status: paused ? GameStatus.PAUSED : GameStatus.AUTOPLAYING,
  offset: 0,
  currTime: currTime, // maintained via timer independent of video
  lines: lines.map((lineData) => makeLineStateAt(currTime, lineData, config)),
  stats: initStatsState(),
});

const EditorArea = ({ user, beatmap, config } : Props) => {
  const makeState = (currTime: number, paused: boolean) => makeStateAt(currTime, paused, beatmap.lines as LineData[], config);
  const [gameState, setGameState] = useState<GameState>(makeState(0, true));
  const set = makeSetFunc(setGameState);

  // from iframe API; in seconds, rounded? maybe
  // maybe need later but idk
  // const [duration, setDuration] = useState<number>(Infinity);

  const {status, offset, currTime, lines, stats} = gameState;
  const currIndex = (currTime !== undefined) ? timeToLineIndex(lines, currTime) : undefined; 
  const isEditing = [GameStatus.PAUSED, GameStatus.AUTOPLAYING].includes(status);
  const isTesting = status === GameStatus.PLAYING;
  
  const currIndexValid = (currTime !== undefined) && (currIndex !== undefined) && (currIndex > -1) && (currIndex < lines.length);

  const startTest = () => {
    setGameState((oldState) => ({ ...oldState,
      status: GameStatus.PLAYING,
      currTime: currIndexValid ? lines[currIndex].line.startTime : oldState.currTime,
    }));
  }

  const stopTest = () => {
    setGameState((oldState) => ({ ...oldState,
      status: GameStatus.PAUSED,
      stats: initStatsState(),
    }));
  };

  const onKeyPress = (e: KeyboardEvent) => {
    if (e.repeat) { return; }
    console.log(e)
    if (e.code === "KeyT" && (e.altKey)) { // enter testing mode
      if (isEditing) { 
        e.preventDefault();
        e.stopPropagation();
        startTest();
      }
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
    // start playing-- status must change to PLAYING
    // will cancel playing if status changes to not those
    if (![GameStatus.PLAYING, GameStatus.AUTOPLAYING].includes(status)) { return; }
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
      // set('status', GameStatus.PAUSED);
    } else if (currIndex > 0) {
      set('stats', (oldStats) => updateStatsOnLineEnd(oldStats, lines[currIndex-1].line));
    }
  }, [currIndex]);
  
  useEffect(() => {
    document.addEventListener("keydown", onKeyPress);
    return () => {
      document.removeEventListener("keydown", onKeyPress);
    }
  }, [status]); // may eventually depend on other things
  
  useEffect(() => { // refresh map content
    setGameState((oldGameState) => makeState(oldGameState.currTime ?? 0, true));
  }, [beatmap]);

  const keyCallback = (hit: number, miss: number, endKana: boolean) => {
		set('stats', (oldStats) => updateStatsOnKeyPress(oldStats, hit, miss, endKana));
  };

  if (status === GameStatus.GOBACK) {
    return <Navigate to={`/edit/${beatmap.beatmapset.id}`} replace={true} />;
  }

  const displayGameState = (isEditing && currTime !== undefined) ? 
    makeState(currTime, status === GameStatus.PAUSED) 
    : gameState;
  
  return (
    <EditorAreaContainer>
      <GameAreaDisplay
        user={user}
        beatmap={beatmap}
        gameState={displayGameState}
        keyCallback={isTesting ? keyCallback : () => {}}
        setGameState={isTesting ? setGameState : () => {}}
        config={config}
      />
      {isTesting ? <span>Testing Mode</span> : null}
      {isEditing ? <EditorTimeline 
        currTime={currTime ?? 0}
        setCurrTime={(currTime: number) => set('currTime', currTime)}
        length={lines[lines.length-1].line.endTime} // temp
      /> : null}
    </EditorAreaContainer>
  );
}

export default EditorArea;

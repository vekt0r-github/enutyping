import React, { useState, useEffect } from "react";

import GameVideo from "@/components/modules/GameVideo";
import GameLine from "@/components/modules/GameLine";

import { post } from '@/utils/functions';
import { User, Beatmap, LineData } from "@/utils/types";

import styled from 'styled-components';
import '@/utils/styles.css';
import { SubBox, Line } from '@/utils/styles';
import { Navigate } from "react-router-dom";

export enum Status { GOBACK, UNSTARTED, STARTQUEUED, PLAYING, SUBMITTING, ENDED };

type Props = {
  user: User,
  beatmap: Beatmap,
  volume: number,
};

type GameState = {
  status: Status,
  gameStartTime?: number,
  currIndex?: number,
  hits: number,
  misses: number,
  score: number
};

export const GameContainer = styled.div`
  width: var(--game-width);
  height: var(--game-height);
  min-width: var(--game-width);
  min-height: var(--game-height);
  margin: var(--s);
  padding: 0;
  background-color: var(--clr-primary-light);
  position: relative;
`;

const TopHalf = styled.div`
  width: 100%;
  height: 50%;
  position: absolute;
  left: 0;
  top: 0;
`;

const LyricLine = styled.div`
  font-size: 24px;
  color: black;
  width: 100%;
  text-align: center;
`;

export const BottomHalf = styled(TopHalf)`
  top: 50%;
  display: flex;
`;

export const StatBox = styled(SubBox)`
  flex-basis: 0;
  flex-grow: 1;
  height: auto;
  margin: var(--s);
`;

export const Overlay = styled.div`
  width: 100%;
  height: 100%;
  padding-bottom: calc(var(--game-height) / 3);
  box-sizing: border-box;
  position: absolute;
  left: 0;
  top: 0;
  background-color: #0006;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  & > ${Line} {
    width: 100%;
    text-align: center;
    font-style: italic;
  }
`;

const GameArea = ({ user, beatmap, volume } : Props) => {
  const initState = () : GameState => ({
    status: Status.UNSTARTED,
    gameStartTime: undefined, 
    currIndex: undefined, // maintained via timer independent of video
    hits: 0,
    misses: 0,
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
  const [offset, setOffset] = useState<number>(0);

  // from iframe API; in seconds, rounded? maybe
  // maybe need later but idk
  // const [duration, setDuration] = useState<number>(Infinity);

  const lines = beatmap.lines;
  const {status, gameStartTime, currIndex, hits, misses, score} = gameState;

  const prepareStartGame = () => {
    if (status !== Status.UNSTARTED) { return; }
    set('status', Status.STARTQUEUED);
  }

  const startGame = () => {
    if (status !== Status.STARTQUEUED) { return; }
    setGameState((state) => ({ ...state,
      status: Status.PLAYING,
      gameStartTime: new Date().getTime() + offset,
    }));
  };

  useEffect(() => {
    // start game-- status must change to PLAYING
    // will cancel all game actions if status changes from PLAYING
    if (status !== Status.PLAYING) { return; }
    let timeoutIds : NodeJS.Timeout[] = [];
    lines.forEach((line, index) => {
      // if this loop is too slow, save original time and reference
      timeoutIds.push(setTimeout(() => {
        set('currIndex', index);
      }, line.startTime + offset));
    });
    const endTime = lines[lines.length-1].endTime;
    timeoutIds.push(setTimeout(submitScore, endTime + offset));
    return () => {
      timeoutIds.forEach((id) => clearTimeout(id));
    };
  }, [status]);

  useEffect(() => {
    if (status !== Status.SUBMITTING) { return; }
    const data = {
      beatmap_id: beatmap.id,
      user_id: user?.id,
      score: gameState.score,
    }
    post('/api/scores', data).then((score) => {
      endGame();
    });
  }, [status]);

  const submitScore = () => {
    setGameState((state) => ({ ...state,
      status: Status.SUBMITTING,
      gameStartTime: undefined,
      currIndex: undefined,
    }));
  };

  const endGame = () => {
    setGameState((state) => ({ ...state,
      status: Status.ENDED,
      gameStartTime: undefined,
      currIndex: undefined,
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
    document.addEventListener("keydown", onKeyPress);
    return () => {
      document.removeEventListener("keydown", onKeyPress);
    }
  }, [status]); // may eventually depend on other things

  const acc = (() => {
    const hitCount = hits;
    const missCount = misses;
    if (hitCount + missCount == 0) {
      return 100;
    }
    return 100 * hitCount / (hitCount + missCount);
  })();

  const keyCallback = (hit: boolean, endKana: boolean) => {
    if(hit) {
      set('hits', (oldHits) => oldHits + 1);
      if(endKana) {
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
    <GameContainer>
      <TopHalf>
        {(currIndex !== undefined) && gameStartTime ? <>
          <GameLine // current line
            key={currIndex}
            gameStartTime={gameStartTime}
            lineData={lines[currIndex]}
            keyCallback={keyCallback}
          />
          <LyricLine>{lines[currIndex].lyric}</LyricLine>
        </> : null}
        {status === Status.SUBMITTING ?
          <h2>Submitting score...</h2>
          : null}
        {status === Status.ENDED ?
          <h2>YOUR SCORE IS {score}</h2>
          : null} 
      </TopHalf>
      <BottomHalf>
        <StatBox>Acc: {acc.toFixed(2)}</StatBox>
        <GameVideo
          yt_id={beatmap.beatmapset.yt_id}
          status={status}
          gameStartTime={gameStartTime}
          startGame={startGame}
          volume={volume}
        />
        <StatBox>Score: {score}</StatBox>
      </BottomHalf>
      {status === Status.UNSTARTED ? 
        <Overlay>
          <Line size="1.5em">Press Space to play</Line>
          <Line size="1em">Press Esc to exit during a game</Line>
          <Line size="0.5em">&nbsp;</Line>
          <Line size="1em">Set map offset:&nbsp;
            <input defaultValue='0' onChange={(e) => {
              const intValue = parseInt(e.target.value)
              if (!isNaN(intValue)) { setOffset(intValue); }
            }}></input>
          </Line>
          <Line size="1em">(Put negative offset if you think syllables are late; positive if you think they're early)</Line>
        </Overlay>
        : null}
    </GameContainer>
  );
}

export default GameArea;

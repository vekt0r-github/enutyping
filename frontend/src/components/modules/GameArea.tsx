import React, { useState, useEffect } from "react";
import { User, Beatmap } from "@/utils/types";

import GameVideo from "@/components/modules/GameVideo";
import GameLine from "@/components/modules/GameLine";
import styled from 'styled-components';
import '@/utils/styles.css';
import { SubBox, Line } from '@/utils/styles';
import { post } from '@/utils/functions';

export type LineData = {
  startTime: number,
  endTime: number,
  lyric: string,
  syllables: {
    time: number,
    text: string,
  }[],
};

export enum Status { UNSTARTED, STARTQUEUED, PLAYING, SUBMITTING, ENDED };

type Props = {
  user: User,
  beatmap: Beatmap,
  volume: number,
};

type GameState = {
  status: Status,
  gameStartTime?: number,
  currLine?: LineData,
  hits: number,
  misses: number,
  score: number
};

const GameContainer = styled.div`
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
`;

const BottomHalf = styled.div`
  display: flex;
  width: 100%;
  height: 50%;
`;

const StatBox = styled(SubBox)`
  flex-basis: 0;
  flex-grow: 1;
  height: auto;
  margin: var(--s);
`;

const Overlay = styled.div`
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
    currLine: undefined, // maintained via timer independent of video
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

  const {status, gameStartTime, currLine, hits, misses, score} = gameState;

  let lines : LineData[] = [];
  (() => { // process beatmap "file"
    if (!beatmap.content) { return null; } // idk man
    const objects = beatmap.content.split(/\r?\n/);
    let line : LineData;
    objects.forEach((obj_str) => {
      const obj = obj_str.split(',');
      const type = obj[0];
      const time = parseInt(obj[1]);
      const text = obj.slice(2).join(',');
      
      if (line && ['L','E'].includes(type)) {
        line.endTime = time;
        lines.push(line);
      }
      if (type === 'L') {
        line = {
          startTime: time,
          endTime: 0, // set when line ends
          lyric: text,
          syllables: [],
        };
      } else if (type === 'S') {
        line.syllables.push({ time, text });
      }
    });
  })();

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
    lines.forEach((line) => {
      // if this loop is too slow, save original time and reference
      timeoutIds.push(setTimeout(() => {
        set('currLine', line);
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
      console.log(score);
      endGame();
    });
  }, [status]);

  const submitScore = () => {
    setGameState((state) => ({ ...state,
      status: Status.SUBMITTING,
      gameStartTime: undefined,
      currLine: undefined,
    }));
  };

  const endGame = () => {
    setGameState((state) => ({ ...state,
      status: Status.ENDED,
      gameStartTime: undefined,
      currLine: undefined,
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

  return (
    <GameContainer>
      <TopHalf>
        {currLine && gameStartTime ? <>
          <GameLine
            gameStartTime={gameStartTime}
            lineData={currLine}
            keyCallback={keyCallback}
          />
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
          yt_id={beatmap.yt_id}
          status={status}
          gameStartTime={gameStartTime}
          startGame={startGame}
          volume={volume}
          // setDuration={setDuration}
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

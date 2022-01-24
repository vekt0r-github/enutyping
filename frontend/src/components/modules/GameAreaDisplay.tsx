import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

import GameVideo from "@/components/modules/GameVideo";
import GameLine from "@/components/modules/GameLine";

import { 
  User, Beatmap, LineData, Config,
  GameStatus, GameState,
} from "@/utils/types";
import { computeLineKPM, makeSetFunc, timeToLineIndex } from '@/utils/beatmaputils';

import styled from 'styled-components';
import '@/utils/styles.css';
import { SubBox, Line } from '@/utils/styles';

type Props = {
  user: User | null,
  beatmap: Beatmap, 
  gameState: GameState, // data in gameState.lines is a superset of beatmap.lines
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  keyCallback: (hit: number, miss: number, endKana: boolean) => void,
  config: Config,
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
  font-size: 1.5em;
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
  & ${Line} {
    width: 100%;
    text-align: center;
    font-style: italic;
  }
`;

const Warning = styled.div`
  background-color: var(--clr-warn);
  padding: var(--s) 0;
`;

const GameAreaDisplay = ({ user, beatmap, gameState, setGameState, keyCallback, config } : Props) => {
  const set = makeSetFunc(setGameState);

  const { volume } = config;

  const [offset, setOffset] = useState<number>(0);
  const totalOffset = offset + config.offset;

  const {status, currTime, lines, stats} = gameState;
  const {hits, misses, kanaHits, kanaMisses, score} = stats;
  const currIndex = (currTime !== undefined) ? timeToLineIndex(beatmap.lines, currTime) : undefined;

  const startGame = (offset: number) => {
    if (status !== GameStatus.STARTQUEUED) { return; }
    setGameState((state) => ({ ...state,
      status: GameStatus.PLAYING,
      offset: offset,
    }));
  };

  const acc = ((hitCount: number, missCount: number) => {
    if (hitCount + missCount == 0) {
      return 100;
    }
    return 100 * hitCount / (hitCount + missCount);
  });  

  const keyAcc = acc(hits, misses);
  const kanaAcc = acc(kanaHits, kanaMisses);
  
  const KPM = currTime ? (Math.round(hits * 60000 / currTime)) : 0;

  if (status === GameStatus.GOBACK) {
    return <Navigate to={`/play/${beatmap.beatmapset.id}`} replace={true} />;
  }

  const isActive = [GameStatus.PLAYING, GameStatus.PAUSED, GameStatus.AUTOPLAYING].includes(status) &&
    (currTime !== undefined) && (currIndex !== undefined) && (currIndex > -1) && (currIndex < lines.length);
  const isPlayingGame = isActive && status === GameStatus.PLAYING;
  
  return (
    <GameContainer>
      <TopHalf>
        {isActive ? <>
          <GameLine // current line
            key={currIndex}
            currTime={currTime}
            lineState={lines[currIndex]}
            setLineState={(makeNewLineState) => { set('lines', (oldLines) => {
              oldLines[currIndex] = makeNewLineState(oldLines[currIndex]);
              return oldLines;
            }); }}
            keyCallback={keyCallback}
            config={config}
          />
          <LyricLine>{lines[currIndex].line.lyric}</LyricLine>
        </> : null}
        {status === GameStatus.SUBMITTING ?
          <h2>Submitting score...</h2>
          : null}
        {status === GameStatus.ENDED ?
          <h2>YOUR SCORE IS {score}</h2>
          : null} 
      </TopHalf>
      <BottomHalf>
        <StatBox>
          <p>Keypress Acc: {keyAcc.toFixed(2)}</p>
          <p>Kana Acc: {kanaAcc.toFixed(2)}</p>
          <p>Score: {score}</p>
          <p>KPM: {KPM}</p>
        </StatBox>
        <GameVideo
          yt_id={beatmap.beatmapset.yt_id}
          status={status}
          currTime={currTime}
          startGame={() => startGame(totalOffset)}
          volume={volume}
        />
        <StatBox>
          <p>Beatmap KPM: {Math.round(beatmap.kpm ?? 0)}</p>
          <p>Line KPM: {isPlayingGame ? 
            (Math.round(computeLineKPM(lines[currIndex].line)))
            : "N/A"}</p>
        </StatBox>
      </BottomHalf>
      {status === GameStatus.UNSTARTED ? 
        <Overlay>
          {!user && <>
            <Warning>
              <Line size="1.5em">Warning: You are not logged in, and your score will not be submitted.</Line>
            </Warning>
            <Line size="0.5em">&nbsp;</Line>
          </>}
          <Line size="1.5em">Press Space to play</Line>
          <Line size="1em">Press Esc to exit during a game</Line>
          <Line size="0.5em">&nbsp;</Line>
          <Line size="1em">Set map offset:&nbsp;
            <input defaultValue={offset} onChange={(e) => {
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

export default GameAreaDisplay;

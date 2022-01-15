import React, { useState, useRef } from "react";
import { User, Beatmap } from "@/utils/types";

import GameVideo from "@/components/modules/GameVideo";
import Volume from "@/components/modules/Volume";
import GameLine from "@/components/modules/GameLine";
import styled from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

export type LineData = {
  startTime: number,
  endTime: number,
  lyric: string,
  syllables: {
    time: number,
    text: string,
  }[],
}

type Props = {
  user: User,
  beatmap: Beatmap,
  volume: number,
  setVolume: React.Dispatch<React.SetStateAction<number>>,
}

const GameContainer = styled.div`
  width: 800px;
  height: 600px;
  min-width: 800px;
  min-height: 600px;
  margin: var(--s);
  padding: 0;
  background-color: var(--clr-primary-light);
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

const StatBox = styled.div`
  width: calc(200px - 2 * var(--s));
  height: auto;
  margin: var(--s);
  background-color: white;
`;

const GameArea = ({ user, beatmap, volume, setVolume } : Props) => {
  // these are maintained via timer independent of video
  const [gameStartTime, setGameStartTime] = useState<number>();
  const [currLine, setCurrLine] = useState<LineData>();

  // from iframe API; in seconds, rounded? maybe
  // maybe need later but idk
  // const [duration, setDuration] = useState<number>(Infinity);

  const hits = useRef(0);
  const misses = useRef(0);

  let lines : LineData[] = [];
  (() => { // process beatmap "file"
    if (!beatmap.content) { return null; } // idk man
    const objects = beatmap.content.split(/\r?\n/);
    let line : LineData;
    objects.forEach((obj_str) => {
      const obj = obj_str.split(',');
      const type = obj[0];
      const time = parseInt(obj[1]);
      
      if (line && ['L','E'].includes(type)) {
        line.endTime = time;
        lines.push(line);
      }
      if (type === 'L') {
        line = {
          startTime: time,
          endTime: 0, // set when line ends
          lyric: obj[2],
          syllables: [],
        };
      } else if (type === 'S') {
        const text = obj[2];
        line.syllables.push({ time, text });
      }
    });
  })();

  const prepareStartGame = () => {
    if (gameStartTime) { return; }
    setGameStartTime(727); // let them know we've started
  };

  const startGame = () => {
    setGameStartTime(new Date().getTime());
    lines.forEach((line) => {
      // if this loop is too slow, save original time and reference
      setTimeout(() => {
        setCurrLine(line);
      }, line.startTime);
    });
    setTimeout(endGame, lines[lines.length - 1].endTime);
  };

  const endGame = () => {
    setCurrLine(undefined);
  }

  const acc = (() => {
    const hitCount = hits.current;
    const missCount = misses.current;
    if (hitCount + missCount == 0) {
      return 100;
    }
    return 100 * hitCount / (hitCount + missCount);
  })();

  const keyCallback = (hit: boolean) => {
    if(hit) {
      hits.current++;
    }
    else {
      misses.current++;
    }
  }

  return (
    <GameContainer>
      <TopHalf>
        <button onClick={prepareStartGame}>start</button>
        <Volume
          volume={volume}
          setVolume={setVolume}
        />
        {currLine && gameStartTime ? <>
          <GameLine
            gameStartTime={gameStartTime}
            lineData={currLine}
            keyCallback={keyCallback}
          />
        </> : null}
      </TopHalf>
      <BottomHalf>
        <StatBox>Acc: {acc.toFixed(2)}</StatBox>
        <GameVideo
          source={beatmap.source}
          gameStartTime={gameStartTime}
          startGame={startGame}
          volume={volume}
          // setDuration={setDuration}
        />
        <StatBox>,</StatBox>
      </BottomHalf>
    </GameContainer>
  );
}

export default GameArea;

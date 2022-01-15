import React, { useState, useRef } from "react";
import { User, Beatmap } from "@/utils/types";

import GameVideo from "@/components/modules/GameVideo";
import Volume from "@/components/modules/Volume";
import ProgressBar from "@/components/modules/ProgressBar";
import GameLine from "@/components/modules/GameLine";
import styled, { css } from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

type Props = {
  user: User,
  beatmap: Beatmap,
  volume: number,
  setVolume: React.Dispatch<React.SetStateAction<number>>,
}

const GameContainer = styled.div`
  width: 800px;
  height: 600px;
  background-color: var(--clr-primary-light);
`;

const LyricLine = styled.div`
  width: 100%;
`;

const GameArea = ({ user, beatmap, volume, setVolume } : Props) => {
  const [started, setStarted] = useState<boolean>(false);
  const [currLine, setCurrLine] = useState<string>();
  const [currSyllable, setCurrSyllable] = useState<string>();

  // iframe API seems to return in seconds
  // I think currentTime is floating point but not duration
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(Infinity);

  const hits = useRef(0);
  const misses = useRef(0);

  if (!beatmap.content) { return null; } // idk man
  const objects = beatmap.content.split(/\r?\n/);

  const startGame = () => {
    setStarted(true);
    objects.forEach((obj_str) => {
      // if this loop is too slow, save original time and reference
      const obj = obj_str.split(',');
      const type = obj[0];
      const time = parseInt(obj[1]);
      switch (type) {
        case 'L':
          const lyric = obj[2];
          setTimeout(() => {
            setCurrLine(lyric);
          }, time)
          break;
        case 'S':
          const syllable = obj[2];
          setTimeout(() => {
            setCurrSyllable(syllable);
          }, time)
          break;
        case 'E': 
        setTimeout(() => {
          endGame();
        }, time)
        break;
      }
    })
  }

  const endGame = () => {
    setCurrLine('');
    setCurrSyllable('');
  }

  const getAcc = () => {
    const hitCount = hits.current;
    const missCount = misses.current;
    if (hitCount + missCount == 0) {
      return 100;
    }
    return 100 * hitCount / (hitCount + missCount);
  }

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
      <GameVideo
        source={beatmap.source}
        started={started}
        volume={volume}
        setCurrentTime={setCurrentTime}
        setDuration={setDuration}
      />
      <button onClick={startGame}>start</button>
      <Volume
        volume={volume}
        setVolume={setVolume}
      />
      <ProgressBar
        currentTime={currentTime}
        duration={duration}
      />
      <GameLine
        line={"asodfihasdpfoi"}
        keyCallback={keyCallback}
        getAcc={getAcc}
      />
      <LyricLine>{currLine}</LyricLine>
      <LyricLine>{currSyllable}</LyricLine> {/* just to see */}
    </GameContainer>
  );
}

export default GameArea;

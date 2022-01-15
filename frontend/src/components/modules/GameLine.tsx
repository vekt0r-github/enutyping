import React, { useState, useEffect, useRef } from "react";

import ProgressBar from "@/components/modules/ProgressBar";

import { LineData } from '@/components/modules/GameArea'

import styled from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

type Props = {
  gameStartTime: number,
  lineData: LineData,
  keyCallback: (hit: boolean) => void,
}

const LineContainer = styled.div`
  width: 100%;
  background-color: white;
`;

const LineText = styled.div`
  font-size: 18px;
  color: var(--clr-medgrey);
`;

const FutureText = styled.span`
  color: black;
`;

const LyricLine = styled.div`
  font-size: 24px;
  color: black;
`;


const GameLine = ({ gameStartTime, lineData, keyCallback } : Props) => {
  const [position, _setPosition] = useState<number>(0);
  const positionRef = useRef(position);

  const line = lineData.syllables.map(s => s.text).join('');

  const setPosition = (newPos: number) => {
    positionRef.current = newPos;
    _setPosition(newPos);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    // TODO: handle japanese input as well
    const pos = positionRef.current;
    if(line.length > pos && e.key == line[pos]) {
      setPosition(pos + 1);
      keyCallback(true);
    }
    else if(line.length > pos) {
      keyCallback(false);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <LineContainer>
      <ProgressBar
        startTime={gameStartTime + lineData.startTime}
        endTime={gameStartTime + lineData.endTime}
      />
      <LineText>{line.substring(0, position)}<FutureText>{line.substring(position)}</FutureText></LineText>
      <LyricLine>{lineData.lyric}</LyricLine>
    </LineContainer>
  ); // idk if there's a better way to make this happen
}

export default GameLine;
import React, { useState, useEffect, useRef } from "react";

import ProgressBar from "@/components/modules/ProgressBar";

import { LineData } from '@/components/modules/GameArea'

import styled, { css } from 'styled-components';
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

const Timeline = styled.div`
  width: 100%;
  height: 50px;
  position: relative;
`;

const LineText = styled.span<{
  pos?: number,
  active: number, // <0: inactive; 0: current; >0: future
}>`
  font-size: 18px;
  color: ${(props) => {
    if (props.active < 0) { return 'var(--clr-medgrey)'; }
    if (props.active === 0) { return 'var(--clr-link)'; }
    return 'black';
  }};
  ${(props) => props.pos ? css`
    position: absolute;
    left: ${props.pos * 100}%;
  ` : ''}
`;

const LyricLine = styled.div`
  font-size: 24px;
  color: black;
`;


const GameLine = ({ gameStartTime, lineData, keyCallback } : Props) => {
  const [position, _setPosition] = useState<number>(0);
  const positionRef = useRef(position);

  const {startTime, endTime, lyric, syllables} = lineData;
  const line = syllables.map(s => s.text).join('');

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
      <Timeline>
        {syllables.map(({time, text}, index) => 
          <LineText
            pos={(time - startTime) / (endTime - startTime)}
            active={index - position}
            >{text}</LineText>
        )}
        <ProgressBar
          startTime={gameStartTime + startTime}
          endTime={gameStartTime + endTime}
        />
      </Timeline>
      <LineText active={-1}>{line.substring(0, position)}</LineText>
      <LineText active={1}>{line.substring(position)}</LineText>
      <LyricLine>{lyric}</LyricLine>
    </LineContainer>
  );
}

export default GameLine;
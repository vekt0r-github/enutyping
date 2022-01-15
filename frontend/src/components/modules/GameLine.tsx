import React, { useState, useEffect, useRef } from "react";

import styled, { css } from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

type Props = {
  line: string,
  keyCallback: (hit: boolean) => void,
  getAcc: () => number
}

const LineContainer = styled.div`
  width: 800px;
  height: 150px;
  background-color: white;
  font-size: 24px;
`;

const LineText = styled.p`
  color: gray;
`;

const FutureText = styled.span`
  color: black;
`;

const GameLine = ({ line, keyCallback, getAcc } : Props) => {
  const [position, _setPosition] = useState<number>(0);
  const [acc, setAcc] = useState<number>(100);

  const positionRef = useRef(position);

  const setPosition = (newPos: number) => {
    positionRef.current = newPos;
    _setPosition(newPos);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    const pos = positionRef.current;
    if(line.length > pos && e.key == line[pos]) {
      setPosition(pos + 1);
      keyCallback(true);
    }
    else if(line.length > pos) {
      keyCallback(false);
    }
    setAcc(getAcc()); // this is here to trigger a rerender
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <LineContainer>
      <LineText>{line.substring(0, position)}<FutureText>{line.substring(position)}</FutureText></LineText>
      <LineText>Acc: {acc.toFixed(2)}</LineText>
    </LineContainer>
  ); // idk if there's a better way to make this happen
}

export default GameLine;
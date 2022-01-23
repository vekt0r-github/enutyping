import React from "react";

import styled from 'styled-components';
import '@/utils/styles.css';
import { Line } from '@/utils/styles';

type Props = {
  currTime: number,
  setCurrTime: (newTime: number) => void,
  length: number,
}

const SliderOuterContainer = styled.div`
  --slider-width: 4px;
  width: 100%;
  height: 40px;
  box-sizing: border-box;
  padding: 0 var(--s);
  position: relative;
  display: flex;
  align-items: center;
  background-color: var(--clr-secondary-light);
  border: 2px solid var(--clr-secondary-dim);
`;

const SliderLabel = styled(Line)`
  text-align: right;
  width: 80px;
  padding-right: var(--s);
  font-size: 1.125em;
  pointer-events: none;
  user-select: none;
`;

const SliderContainer = styled.div`
  flex-basis: 0;
  flex-grow: 1;
  height: var(--slider-width);
  position: relative;
`;

const Slider = styled.input`
  appearance: none;
  position: absolute;
  width: 100%;
  height: var(--slider-width);
  margin: 0;
  background: #0000;
  outline: none;
  -webkit-transition: .2s;
  transition: opacity .2s;
  &::-webkit-slider-thumb {
    appearance: none;
    width: 4px; 
    height: 24px; 
    background: var(--clr-primary-dim); 
    cursor: pointer; 
  }
`;

const SliderBody = styled.div`
  position: absolute;
  width: 100%;
  height: var(--slider-width);
  background: #ddd;
`;

const SliderFill = styled.div<{fill: number}>`
  position: absolute;
  width: ${(props) => props.fill * 100}%;
  height: var(--slider-width);
  background-color: var(--clr-primary);
`;

const EditorTimeline = ({ currTime, setCurrTime, length } : Props) => {
  const handleScrub = (e : React.ChangeEvent<HTMLInputElement>) => {
    setCurrTime(parseInt(e.target.value));
  };

  return (
    <SliderOuterContainer>
      <SliderLabel as="label" htmlFor="editor-timeline-slider-container">{currTime}</SliderLabel>
      <SliderContainer id="editor-timeline-slider-container">
        <SliderBody />
        <SliderFill
          fill={currTime / length}
        />
        <Slider
          type="range" 
          min={0} 
          max={length}
          value={currTime}
          onChange={handleScrub} 
        />
      </SliderContainer>
    </SliderOuterContainer>
  );
}

export default EditorTimeline;

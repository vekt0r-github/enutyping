import React from "react";

import { LineData } from "@/utils/types";

import styled from 'styled-components';
import '@/utils/styles.css';
import { Line, EditorTimelineBox } from '@/utils/styles';

type Props = {
  currTime: number,
  setCurrTime: (newTime: number) => void,
  lines: LineData[]; // only need the static data
  length: number,
}

const SliderOuterContainer = styled(EditorTimelineBox)`
  padding: 0 var(--s);
  position: relative;
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
  --slider-width: 4px;
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
  z-index: 3;
  &::-webkit-slider-thumb {
    appearance: none;
    width: 4px; 
    height: 24px; 
    background-color: var(--clr-primary-dim); 
  }
`;

const SliderBody = styled.div`
  position: absolute;
  width: 100%;
  height: var(--slider-width);
  background: #ddd;
`;

const SliderFill = styled.div.attrs<{fill: number}>(({fill}) => ({
  style: {
    width: `${fill * 100}%`,
  },
}))<{fill: number}>`
  position: absolute;
  height: var(--slider-width);
  background-color: var(--clr-primary);
`;

const LineMarker = styled.div.attrs<{pos: number}>(({pos}) => ({
  style: {
    left: `${pos * 100}%`,
  },
}))<{pos: number}>`
  position: absolute;
  top: calc((var(--slider-width) - 30px) / 2);
  width: 1px;
  height: 30px;
  background-color: black;
`;

const EditorScrollBar = ({ currTime, setCurrTime, lines, length } : Props) => {
  const handleScrub = (e : React.ChangeEvent<HTMLInputElement>) => {
    setCurrTime(parseInt(e.target.value));
  };
  
  const mapEndTime = lines[lines.length - 1]?.endTime;

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
        {lines.map((line) => <>
          <LineMarker key={line.startTime} pos={line.startTime / length} />
        </>)} 
        {mapEndTime && <LineMarker key={mapEndTime} pos={mapEndTime / length} />}
      </SliderContainer>
    </SliderOuterContainer>
  );
}

export default EditorScrollBar;

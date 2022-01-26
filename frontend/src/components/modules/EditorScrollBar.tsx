import React, { Fragment } from "react";

import { LineData, TimingPoint } from "@/utils/types";

import styled from 'styled-components';
import '@/utils/styles.css';
import { Line, EditorTimelineBox } from '@/utils/styles';

type Props = {
  currTime: number,
  setCurrTime: (newTime: number) => void,
  lines: LineData[]; // only need the static data
  timingPoints: TimingPoint[],
  endTime?: number,
  length: number,
}

const SliderOuterContainer = styled(EditorTimelineBox)`
  padding: 0 var(--s);
  position: relative;
`;

const SliderLabel = styled(Line)`
  text-align: right;
  width: 110px;
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
    left: `calc(1.5px + ${pos} * (100% - 4px))`,
  },
}))<{pos: number}>`
  position: absolute;
  top: calc(var(--slider-width) - 17px);
  width: 1px;
  height: 17px;
  background-color: black;
`;

const SyllableMarker = styled(LineMarker)`
  top: calc(var(--slider-width) - 12px);
  height: 12px;
  background-color: green;
`;

const TimingMarker = styled(LineMarker)`
  top: 0;
  height: 17px;
  background-color: red;
`;

const EndMarker = styled(LineMarker)`
  top: calc((var(--slider-width) - 34px) / 2);
  width: 2px;
  height: 34px;
`;

const EditorScrollBar = ({ currTime, setCurrTime, lines, timingPoints, endTime, length } : Props) => {
  const handleScrub = (e : React.ChangeEvent<HTMLInputElement>) => {
    setCurrTime(parseInt(e.target.value));
  };
  const calcPos = (time : number) => time / length;

  const formattedTime = ((time : number) => {
    const ms = Math.round(time % 1000);
    time = (time - ms) / 1000;
    const ss = Math.round(time % 60);
    time = (time - ss) / 60;
    const mm = Math.round(time % 60);
    time = (time - mm) / 60;
    const hh = Math.round(time);
    let tstr = `${ms}`.padStart(3, '0');
    tstr = `${ss}:`.padStart(3, '0') + tstr;
    tstr = `${mm}:`.padStart(3, '0') + tstr;
    return hh ? `${hh}:` + tstr : tstr;
  })(currTime);
  
  return (
    <SliderOuterContainer>
      <SliderLabel as="label" htmlFor="editor-timeline-slider-container">{formattedTime}</SliderLabel>
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
        {timingPoints.map((point) => <TimingMarker key={`T${point.time}`} pos={calcPos(point.time)} />)}
        {lines.map((line) => <Fragment key={`L${line.startTime}`}>
          <LineMarker pos={calcPos(line.startTime)} />
          {line.syllables.map((syllable) => 
            <SyllableMarker key={`S${syllable.time}`} pos={calcPos(syllable.time)}/>
          )}
        </Fragment>)} 
        {endTime ? <EndMarker key={`E${endTime}`} pos={calcPos(endTime)} /> : null}
      </SliderContainer>
    </SliderOuterContainer>
  );
}

export default EditorScrollBar;

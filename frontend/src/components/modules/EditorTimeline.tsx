import React, { Fragment } from "react";

import { LineData, TimingPoint } from "@/utils/types";
import { getTimeOfBeat, timeToTimingPointIndex, timeToBeatNumber } from "@/utils/beatmaputils";

import styled from 'styled-components';
import '@/utils/styles.css';
import { EditorTimelineBox } from '@/utils/styles';

type Props = {
  windowLength: number,
  currTime: number,
  lines: LineData[]; // only need the static data
  timingPoints: TimingPoint[],
  endTime?: number,
  beatSnapDivisor: number,
}

const SNAPS_TO_SHOW : {[divisor: number] : number[]} = {
  2: [2, 1],
  4: [4, 2, 1],
  8: [8, 4, 2, 1],
  3: [3, 1],
  6: [6, 2, 1],
  12: [12, 6, 4, 2, 1],
  16: [16, 8, 4, 2, 1],
};

type Snap = {
  color: string,
  width: string,
  height: string,
}

const SNAPS : {[divisor: number] : Snap} = {
  1: {
    color: "var(--clr-grey)",
    width: "2px",
    height: "16px",
  },
  2: {
    color: "red",
    width: "1px",
    height: "10px",
  },
  4: {
    color: "blue",
    width: "1px",
    height: "7px",
  },
  8: {
    color: "yellow",
    width: "1px",
    height: "5px",
  },
  3: {
    color: "purple",
    width: "1px",
    height: "6px",
  },
  6: {
    color: "purple",
    width: "1px",
    height: "6px",
  },
  12: {
    color: "gray",
    width: "1px",
    height: "5px",
  },
  16: {
    color: "gray",
    width: "1px",
    height: "5px",
  },
}

const Container = styled(EditorTimelineBox)`
  position: relative;
  align-items: flex-end;
`;

const Timeline = styled.div`
  position: absolute;
  width: 100%;
  height: 2px;
  top: 32px;
  background: var(--clr-grey);
`;

const Marker = styled.div.attrs<{pos: number}>(({pos}) => ({
  style: {
    display: (0 <= pos && pos <= 1) ? 'block' : 'none',
    left: `${pos * 100}%`,
  },
}))<{pos: number}>`
  position: absolute;
`;

const LineMarker = styled(Marker)`
  width: 15px;
  height: 25px;
  border-top: 1px solid black;
  border-left: 1px solid black;
`;

const EndMarker = styled(Marker)`
  width: 2px;
  height: 30px;
  background-color: black;
`;

const SyllableMarker = styled(LineMarker)`
  width: 4px;
  height: 15px;
  border-color: green;
`;

const TimingMarker = styled(Marker)`
  width: 1px;
  height: 35px;
  background-color: red;
`;

const BeatMarker = styled(Marker)<Snap>`
  width: ${({width}) => width};
  height: ${({height}) => height};
  background-color: ${({color}) => color};
  bottom: 4px;
`;

const Cursor = styled.div`
  position: absolute;
  left: calc(50% - 1px);
  top: -2px;
  width: 1px;
  height: 38px;
  border: 1px solid white;
`;

const EditorTimeline = ({ windowLength, currTime, lines, timingPoints, endTime, beatSnapDivisor } : Props) => {
  const calcPos = (time : number) => (0.5 + (time - currTime) / windowLength)

  const currTimingPoint = timingPoints.length ? 
    timingPoints[Math.max(timeToTimingPointIndex(timingPoints, currTime!) - 1, 0)]
    : null;
  const getTimes = (divisor: number) => {
    if (!currTimingPoint) { return null; }
    const ttbn = (t: number) => timeToBeatNumber(currTimingPoint, divisor, t);
    const gtob = (b: number) => getTimeOfBeat(currTimingPoint, divisor, b);
    const start = ttbn(currTime - 0.5 * windowLength);
    const end = ttbn(currTime + 0.5 * windowLength) + 1;
    let times = [];
    for (let i = start; i < end; i++) {
      times.push(gtob(i));
    }
    return times;
  }

  return (
    <Container>
      <Timeline />
      <Cursor />
      {timingPoints.map((point) => <TimingMarker key={`T${point.time}`} pos={calcPos(point.time)} />)}
      {currTimingPoint ? SNAPS_TO_SHOW[beatSnapDivisor].map(divisor => 
        getTimes(divisor)!.map((time) => 
          <BeatMarker {...SNAPS[divisor]} key={`${divisor}B${time}`} pos={calcPos(time)} />
        )
      ) : null}
      {lines.map((line) => <Fragment key={`L${line.startTime}`}>
        <LineMarker pos={calcPos(line.startTime)} />
        {line.syllables.map((syllable) => 
          <SyllableMarker key={`S${syllable.time}`} pos={calcPos(syllable.time)}/>
        )}
      </Fragment>)} 
      {endTime ? <EndMarker key={`E${endTime}`} pos={calcPos(endTime)} /> : null}
    </Container>
  );
}

export default EditorTimeline;

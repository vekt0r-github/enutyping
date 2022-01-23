import React from "react";

import { LineData } from "@/utils/types";

import styled from 'styled-components';
import '@/utils/styles.css';
import { EditorTimelineBox } from '@/utils/styles';

type Props = {
  windowLength: number,
  currTime: number,
  lines: LineData[]; // only need the static data
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
  background: black;
`;

const LineMarker = styled.div.attrs<{pos: number}>(({pos}) => ({
  style: {
    display: (0 <= pos && pos <= 1) ? 'block' : 'none',
    left: `${pos * 100}%`,
  },
}))<{pos: number}>`
  position: absolute;
  width: 1px;
  height: 30px;
  background-color: black;
`;

const SyllableMarker = styled(LineMarker)`
  height: 20px;
  background-color: green;
`;

const Cursor = styled.div`
  position: absolute;
  left: calc(50% - 1px);
  top: -2px;
  width: 1px;
  height: 38px;
  border: 1px solid white;
`;

const EditorTimeline = ({ windowLength, currTime, lines } : Props) => {
  const calcPos = (time : number) => (0.5 + (time - currTime) / windowLength)
  const mapEndTime = lines[lines.length - 1]?.endTime;

  return (
    <Container>
      <Timeline />
      <Cursor />
      {lines.map((line) => <>
        <LineMarker key={line.startTime} pos={calcPos(line.startTime)} />
        {line.syllables.map((syllable) => 
          <SyllableMarker key={syllable.time} pos={calcPos(syllable.time)}/>
        )}
      </>)} 
      {mapEndTime && <LineMarker key={mapEndTime} pos={calcPos(mapEndTime)} />}
    </Container>
  );
}

export default EditorTimeline;

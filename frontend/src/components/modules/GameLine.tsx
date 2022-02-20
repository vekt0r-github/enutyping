import React, { useEffect } from "react";

import ProgressBar from "@/components/modules/ProgressBar";

import { KanaState, LineState } from '@/utils/types'
import { getCurrentRomanization, getVisualPosition, withOverlapOffsets } from "@/utils/beatmaputils";

import styled, { css } from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

type Props = {
  currTime: number,
  lineState: LineState,
  keyCallback: (e: KeyboardEvent) => void,
  isPlayingGame: boolean,
}

enum ActiveStatus { MISSED, PAST, PRESENT, FUTURE };

const LineContainer = styled.div`
  width: 100%;
  height: 120px;
  /* background-color: var(--clr-grey); */
`;

const Timeline = styled.div`
  width: 100%;
  height: 60px;
  margin: var(--s) 0;
  position: relative;
`;

const TimelineBar = styled.div`
  width: 100%;
  position: absolute;
  top: 42px;
  left: 0;
`;

type SyllableProps = { pos?: [string, string] };
const Syllable = styled.span.attrs<SyllableProps>(({pos}) =>({
  style: {
    ...(pos ? {
      position: 'absolute',
      left: pos[0],
      top: pos[1],
    } : {}),
  },
}))<SyllableProps>`
  font-size: 1.125em;
`;

const SyllableText = styled(Syllable)`
  position: absolute;
  width: fit-content;
  white-space: nowrap;
`;

const CharText = styled.span<{active: ActiveStatus}>`
  ${(props) => {
    switch (props.active) {
      case ActiveStatus.MISSED:
        return css`
          color: var(--clr-warn);
          opacity: 0.5;
          background-color: transparent;
          z-index: 1;
        `;
      case ActiveStatus.PAST:
        return css`
          color: var(--clr-medgrey);
          opacity: 0.5;
          background-color: transparent;
          z-index: 1;
        `;
      case ActiveStatus.PRESENT:
        return css`
          color: black;
          background-color: var(--clr-highlight);
          box-shadow: 2px 2px 5px #aaa;
          z-index: 3;
        `;
      case ActiveStatus.FUTURE:
        return css`
          color: black;
          background-color: var(--clr-grey);
          box-shadow: 2px 2px 5px #aaa;
          z-index: 2;
        `;
    }
  }}
`;

// middle is 42 + 8 = 50px;
type ConnectorProps = { offset: string, flip: boolean };
const Connector = styled.div.attrs<ConnectorProps>(({offset, flip}) =>({
  style: {
    width: offset,
    top: flip ? '32px' : '44px',
    background: `linear-gradient(to top ${flip ? 'left' : 'right'}, #0000 calc(50% - 1.5px), black calc(50% - 0.75px), black calc(50% + 0.75px), #0000 calc(50% + 1.5px) )`
  },
}))<ConnectorProps>`
  position: absolute;
  left: 4px;
  height: 12px;
  z-index: 1;
`;

const Tick = styled.div<{active?: ActiveStatus}>`
  width: 2px;
  height: 24px;
  position: absolute;
  content: "";
  left: 4px;
  top: 32px;
  z-index: 1;
  background-color: black;
`;

const ScoreMarker = styled.div<{value: number}>` // value 0-1
  width: 8px;
  height: 8px;
  border-radius: 50%;
  position: absolute;
  content: "";
  left: 1px;
  top: 40px;
  z-index: 1;
  background-color: hsl(calc(0 + 120 * ${({value}) => value}), 100%, 50%);
  filter: blur(2px); 
`;

const GameLine = ({ currTime, lineState, keyCallback, isPlayingGame } : Props) => {
  const {line, syllables} = lineState;
  const sPos = lineState.position;

  useEffect(() => {
    document.addEventListener("keydown", keyCallback);
    return () => {
      document.removeEventListener("keydown", keyCallback);
    }
  }, [lineState, currTime]); // any change in state affects the listener

  const joinKana = (kana : KanaState[]) => "".concat.apply("", kana.map(k => k.kana.text));
  let syllablesWithOffsets : (typeof syllables[number] & {pos: number, offset: number})[] = 
    withOverlapOffsets(lineState, Math.pow(1.125, 2)).syllables;
  let syllableList = syllablesWithOffsets.map(({time, text, position: kPos, kana, pos, offset}, index) => {
    let prefixes = ""; // this is pretty implementation dependent
    let suffixes = ""; // and seems likely to break
    let score = 0;
    let maxScore = 0;
    kana.forEach(ks => {
      prefixes += ks.prefix;
      suffixes += ks.suffix;
      score += ks.score;
      maxScore += 25 * ks.minKeypresses; // TODO: hardcode alert
    });

    let active;
    let topContent : JSX.Element;
    let bottomContent : JSX.Element;
    const {MISSED, PAST, PRESENT, FUTURE} = ActiveStatus;
    if (index > sPos) {
      active = FUTURE;
      topContent = <CharText active={active}>{text}</CharText> 
      bottomContent =
        <CharText active={active}>
          {getCurrentRomanization(kana)}
        </CharText> 
    } else if (index < sPos) {
      active = PAST;
      topContent = (<>
        <CharText active={PAST}>{joinKana(kana.slice(0, kPos))}</CharText>
        <CharText active={MISSED}>{joinKana(kana.slice(kPos))}</CharText>
      </>);
      bottomContent = (<>
        <CharText active={PAST}>{prefixes}</CharText>
        <CharText active={MISSED}>{suffixes}</CharText>
      </>);
    } else {
      active = PRESENT;
      topContent = (<>
        <CharText active={PAST}>{joinKana(kana.slice(0, kPos))}</CharText>
        <CharText active={PRESENT}>{joinKana(kana.slice(kPos, kPos+1))}</CharText>
        <CharText active={FUTURE}>{joinKana(kana.slice(kPos+1))}</CharText>
      </>);
      let prefixes = ""; // this is pretty implementation dependent
      let suffixes = ""; // and seems likely to break
      kana.forEach(ks => {
        prefixes += ks.prefix;
        suffixes += ks.suffix;
      });
      bottomContent = (<>
        <CharText active={PAST}>{prefixes}</CharText>
        <CharText active={PRESENT}>{suffixes.substring(0, 1)}</CharText>
        <CharText active={FUTURE}>{suffixes.substring(1)}</CharText>
      </>);
    }
    const timeRatio = getVisualPosition(time, line);
    return (
      <Syllable 
        key={index}
        pos={[`${timeRatio * 100}%`, '0']}
      >
        <SyllableText pos={[`${offset}px`, "0"]}>{topContent}</SyllableText>
        {offset >= 2 ? <>
          <Connector offset={`${offset}px`} flip={false} />
          <Connector offset={`${offset}px`} flip={true} />
        </> : <Tick active={active}/>}
        {active !== ActiveStatus.FUTURE && isPlayingGame ? 
          <ScoreMarker value={Math.max(score / maxScore, 0)} /> : null}
        <SyllableText pos={[`${offset}px`, "60px"]}>{bottomContent}</SyllableText>
      </Syllable>
    );
  });

  const visualShift = (x: number) => Math.min(x + 0.005, 1); // 4px :ehehe:

  return (
    <LineContainer>
      <Timeline>
        {syllableList.reverse()}
        <TimelineBar>
          <ProgressBar
            progress={visualShift(getVisualPosition(currTime, line))}
          />
        </TimelineBar>
      </Timeline>
    </LineContainer>
  );
}

export default GameLine;

import React, { useEffect } from "react";

import ProgressBar from "@/components/modules/ProgressBar";

import { Config, KanaState, LineState } from '@/utils/types'
import { getCurrentRomanization, getVisualPosition, timeToSyllableIndex, withOverlapOffsets } from "@/utils/beatmaputils";

import styled, { css } from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

type Props = {
  currTime: number,
  lineState: LineState,
  setLineState: (makeNewLineState: (oldLineState: LineState) => LineState) => void,
  keyCallback: (hits: number, misses: number, endKana: boolean) => void,
  config: Config,
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
  background-color: ${(props) => 
    props.active === ActiveStatus.PAST ? 'var(--clr-darkgrey)' : 'black'
  };
`;

const GameLine = ({ currTime, lineState, setLineState, keyCallback, config } : Props) => {
  const {line, syllables, nBuffer} = lineState;
  const sPos = lineState.position;
  const {startTime, endTime, lyric} = line;
  const latestActiveSyllable = timeToSyllableIndex(line.syllables, currTime) - 1;

  const getKana = (sPos: number) : KanaState | undefined => {
    const syllable = syllables[sPos];
    if (!syllable) { return; }
    return syllable.kana[syllable.position];
  }

  const resultOfHit = (key : string, sPos: number) : KanaState | undefined => {
    const curKana = getKana(sPos);
    if (!curKana) return;
    const {kana, prefix, minKeypresses} = curKana;
    const newPrefix = prefix + key;
    const filteredRomanizations = kana.romanizations.filter(s => s.substring(0, newPrefix.length) == newPrefix);
    if (filteredRomanizations.length == 0) { return; }
    const newSuffix = filteredRomanizations[0].substring(newPrefix.length);
    return {kana: kana, prefix: newPrefix, suffix: newSuffix, minKeypresses: minKeypresses};
  }

  const handleCorrectKeypress = (sPos: number, newKana : KanaState) => {
    const {kana, prefix, suffix, minKeypresses} = newKana;
    setLineState(({line, syllables, nBuffer}) => {
      let {position: kPos, kana: kanaList} = syllables[sPos];
      kanaList[kPos] = newKana; // should be safe
      if (suffix === "") {
        kPos++;
        syllables[sPos].position = kPos;
        if (!kanaList[kPos]) {sPos++; } 
        // if getKana(position) still undefined, line is over
        nBuffer = (prefix === "n" && kana.text == "ん");
      }
      return {line, position: sPos, syllables, nBuffer};
    });
    keyCallback((prefix.length <= minKeypresses) ? 1 : 0, 0, suffix === "");
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (["Escape"].includes(e.key)) { return; } // GameArea is handling it
    const allowedCharacters = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890-`~ \"'.?!,"; // idk if this is comprehensive
    if(!allowedCharacters.includes(e.key)) { return; }
    if(e.key == "n" && nBuffer) {
      setLineState((s) => ({ ...s, nBuffer: false }));
      return;
    }
    const newKana = resultOfHit(e.key, sPos);  
    if (!newKana) { // key is not the next char
      let newPosition = sPos;
      while (newPosition < latestActiveSyllable) {
        newPosition++; // next syllable
        const testNewKana = resultOfHit(e.key, newPosition);
        if (testNewKana) {
          handleCorrectKeypress(newPosition, testNewKana);
          return;
        }
      }
      keyCallback(0, 1, false);
    } else { // key works as the next char
      handleCorrectKeypress(sPos, newKana);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    }
  }, [lineState, currTime]); // any change in state affects the listener

  const joinKana = (kana : KanaState[]) => "".concat.apply("", kana.map(k => k.kana.text));
  let syllablesWithOffsets : (typeof syllables[number] & {pos: number, offset: number})[] = 
    withOverlapOffsets(lineState, 1.125).syllables;
  let syllableList = syllablesWithOffsets.map(({time, text, position: kPos, kana, pos, offset}, index) => {
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
      topContent = (<>
        <CharText active={PAST}>{joinKana(kana.slice(0, kPos))}</CharText>
        <CharText active={MISSED}>{joinKana(kana.slice(kPos))}</CharText>
      </>);
      let prefixes = ""; // this is pretty implementation dependent
      let suffixes = ""; // and seems likely to break
      kana.forEach(ks => {
        prefixes += ks.prefix;
        suffixes += ks.suffix;
      });
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

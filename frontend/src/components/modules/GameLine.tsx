import React, { useEffect } from "react";

import ProgressBar from "@/components/modules/ProgressBar";

import { Config, KanaState, LineState } from '@/utils/types'
import { getVisualPosition, timeToSyllableIndex } from "@/utils/beatmaputils";

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

enum ActiveStatus { PAST, PRESENT, FUTURE };

const LineContainer = styled.div`
  width: 100%;
  height: 80px;
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
  top: 28px;
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

const SyllableTopText = styled.span`
  position: absolute;
  left: 0;
  top: 0;
  width: fit-content;
  white-space: nowrap;
`;

const SyllableBottomText = styled(SyllableTopText)`
  top: 40px;
`;

const CharText = styled.span<{active: ActiveStatus}>`
  ${(props) => {
    switch (props.active) {
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

const Tick = styled.div<{active?: ActiveStatus}>`
  width: 2px;
  height: 16px;
  position: absolute;
  content: "";
  left: 4px;
  top: 22px;
  z-index: 1;
  background-color: ${(props) => 
    props.active === ActiveStatus.PAST ? 'var(--clr-darkgrey)' : 'black'
  };
`;

const GameLine = ({ currTime, lineState, setLineState, keyCallback, config } : Props) => {
  const {line, position, syllables, nBuffer} = lineState;
  const {startTime, endTime, lyric} = line;
  const latestActiveSyllable = timeToSyllableIndex(line.syllables, currTime) - 1;

  const getKana = (pos : LineState['position']) : KanaState | undefined => syllables[pos[0]]?.kana[pos[1]];

  const resultOfHit = (key : string, pos : LineState['position']) : KanaState | undefined => {
    const curKana = getKana(pos);
    if (!curKana) return;
    const {kana, prefix, minKeypresses} = curKana;
    const newPrefix = prefix + key;
    const filteredRomanizations = kana.romanizations.filter(s => s.substring(0, newPrefix.length) == newPrefix);
    if (filteredRomanizations.length == 0) { return; }
    const newSuffix = filteredRomanizations[0].substring(newPrefix.length);
    return {kana: kana, prefix: newPrefix, suffix: newSuffix, minKeypresses: minKeypresses};
  }

  const handleCorrectKeypress = (position : LineState['position'], newKana : KanaState) => {
    const {kana, prefix, suffix, minKeypresses} = newKana;
    setLineState(({line, syllables, nBuffer}) => {
      syllables[position[0]].kana[position[1]] = newKana; // should be safe
      if (suffix === "") {
        position[1]++;
        if (!getKana(position)) { position = [position[0] + 1, 0]; } // carry to next syllable
        // if getKana(position) still undefined, line is over
        nBuffer = (prefix === "n" && kana.text == "ん");
      }
      return {line, position: position, syllables, nBuffer};
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
    const newKana = resultOfHit(e.key, position);  
    if (!newKana) { // key is not the next char
      let newPosition = position;
      while (newPosition[0] < latestActiveSyllable) {
        newPosition = [newPosition[0] + 1, 0]; // next syllable
        const testNewKana = resultOfHit(e.key, newPosition);
        if (testNewKana) {
          handleCorrectKeypress(newPosition, testNewKana);
          return;
        }
      }
      keyCallback(0, 1, false);
    } else { // key works as the next char
      handleCorrectKeypress(position, newKana);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    }
  }, [lineState, currTime]); // any change in state affects the listener

  const joinKana = (kana : KanaState[]) => "".concat.apply("", kana.map(k => k.kana.text));
  let syllableList = syllables.map(({time, text, kana}, index) => {
    let active;
    let topContent : JSX.Element;
    let bottomContent : JSX.Element;
    const {PAST, PRESENT, FUTURE} = ActiveStatus;
    if (index !== position[0]) {
      active = (index < position[0]) ? PAST : FUTURE;
      topContent = <CharText active={active}>{text}</CharText> 
      bottomContent =
        <CharText active={active}>
          {"".concat.apply("", kana.map(ks => ks.prefix + ks.suffix))}
        </CharText> 
    } else {
      active = PRESENT;
      const kpos = position[1];
      topContent = (<>
        <CharText active={PAST}>{joinKana(kana.slice(0, kpos))}</CharText>
        <CharText active={PRESENT}>{joinKana(kana.slice(kpos, kpos+1))}</CharText>
        <CharText active={FUTURE}>{joinKana(kana.slice(kpos+1))}</CharText>
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
        <SyllableTopText>{topContent}</SyllableTopText>
        <Tick active={active}/>
        <SyllableBottomText>{bottomContent}</SyllableBottomText>
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

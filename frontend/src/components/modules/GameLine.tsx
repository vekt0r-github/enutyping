import React, { useState, useEffect } from "react";

import ProgressBar from "@/components/modules/ProgressBar";

import { LineData } from '@/utils/types'
import { Kana, parseKana } from '@/utils/kana'

import styled, { css } from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

type KanaState = {
  kana: Kana,
  prefix: string, // the correct keystrokes user has typed for this kana
  suffix: string, // one possible romaji completion of this kana after prefix
};

type Props = {
  gameStartTime: number,
  lineData: LineData,
  keyCallback: (hit: boolean, endKana: boolean) => void,
}

type Position = [number, number]; // syllable index, kana index

type State = {
  position: Position,
  syllables: {
    time: number,
    text: string,
    kana: KanaState[],
  }[], 
  nBuffer: boolean,
}

enum ActiveStatus { PAST, PRESENT, FUTURE };

const LineContainer = styled.div`
  width: 100%;
  background-color: var(--clr-grey);
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

const getColorOfActiveStatus = (active : ActiveStatus) => {
  if (active === ActiveStatus.PAST) { return 'var(--clr-darkgrey)'; }
  if (active === ActiveStatus.PRESENT) { return 'var(--clr-link)'; }
  return 'black';
};

type LineProps = { pos?: [string, string], active: ActiveStatus };
const LineText = styled.span.attrs<LineProps>(({pos}) =>({
  style: {
    ...(pos ? {
      position: 'absolute',
      left: pos[0],
      top: pos[1],
    } : {}),
  },
}))<LineProps>`
  font-size: 18px;
  color: ${(props) => getColorOfActiveStatus(props.active)};
  ${(props) => {
    switch (props.active) {
      case ActiveStatus.PAST:
        return css`
          background-color: var(--clr-grey);
          z-index: 0;
        `;
      case ActiveStatus.PRESENT:
        return css`
          background-color: var(--clr-highlight);
          box-shadow: 2px 2px 5px #aaa;
          z-index: 1;
        `;
      case ActiveStatus.FUTURE:
        return css`
          background-color: var(--clr-grey);
          box-shadow: 2px 2px 5px #aaa;
        `;
    }
  }}
`;

const Syllable = styled(LineText)`
  &::before {
    width: 2px;
    height: 16px;
    position: absolute;
    content: "";
    left: 4px;
    top: 22px;
    background-color: ${(props) => getColorOfActiveStatus(props.active)};
  }
`;

const LyricLine = styled.div`
  font-size: 24px;
  color: black;
`;

const GameLine = ({ gameStartTime, lineData, keyCallback } : Props) => {
  const {startTime, endTime, lyric} = lineData;
  const initKanaState = (kana : Kana) => ({ kana, prefix: "", suffix: kana.romanizations[0] });

  const initState = () : State => ({
    position: [0, 0],
    syllables: lineData.syllables.map((syllable, i, arr) => ({
      ...syllable,
      kana: parseKana(syllable.text, arr[i+1]?.text).map(initKanaState),
    })),
    nBuffer: false,
  });
  const [state, setState] = useState<State>(initState());

  const {position, syllables, nBuffer} = state;
  const isDone = position[0] >= syllables.length;
  const getKana = (pos : Position) : KanaState | undefined => syllables[pos[0]]?.kana[pos[1]];

  const handleKeyPress = (e: KeyboardEvent) => {
    if (["Escape"].includes(e.key)) { return; } // GameArea is handling it
    const curKana = getKana(position);
    if (!curKana) return;
    const {kana, prefix} = curKana;
    const newPrefix = prefix + e.key;
    const filteredRomanizations = kana.romanizations.filter(s => s.substring(0, newPrefix.length) == newPrefix);

    if(e.key == "n" && nBuffer) {
      setState((s: State) => ({ ...s, nBuffer: false }));
      keyCallback(true, false);
    } else if (filteredRomanizations.length == 0) {
      keyCallback(false, false);
    } else {
      const newSuffix = filteredRomanizations[0].substring(newPrefix.length);
      const newKana: KanaState = {kana: kana, prefix: newPrefix, suffix: newSuffix};
      setState(({position, syllables, nBuffer}) => {
        syllables[position[0]].kana[position[1]] = newKana; // should be safe
        if (newSuffix === "") {
          position[1]++;
          if (!getKana(position)) { position = [position[0] + 1, 0]; } // carry to next syllable
          // if getKana(position) still undefined, line is over
          nBuffer = (newPrefix === "n" && newKana.kana.text == "ん");
        }
        return {position, syllables, nBuffer};
      });
      keyCallback(true, newSuffix === "");
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    }
  }, [state]); // any change in state affects the listener

  const joinKana = (kana : KanaState[]) => "".concat.apply("", kana.map(k => k.kana.text));
  let syllableList = syllables.map(({time, text, kana}, index) => {
    let active;
    let topContent : JSX.Element | string = text;
    let bottomContent : JSX.Element | string = 
      "".concat.apply("", kana.map(ks => ks.prefix + ks.suffix));
    const {PAST, PRESENT, FUTURE} = ActiveStatus;
    if (index < position[0]) {
      active = PAST;
    } else if (index > position[0]) {
      active = FUTURE;
    } else {
      active = PRESENT;
      const kpos = position[1];
      topContent = (<>
        <LineText active={PAST}>{joinKana(kana.slice(0, kpos))}</LineText>
        <LineText active={PRESENT}>{joinKana(kana.slice(kpos, kpos+1))}</LineText>
        <LineText active={FUTURE}>{joinKana(kana.slice(kpos+1))}</LineText>
      </>);
      let prefixes = ""; // this is pretty implementation dependent
      let suffixes = ""; // and seems likely to break
      kana.forEach(ks => {
        prefixes += ks.prefix;
        suffixes += ks.suffix;
      });
      bottomContent = (<>
        <LineText active={PAST}>{prefixes}</LineText>
        <LineText active={PRESENT}>{suffixes.substring(0, 1)}</LineText>
        <LineText active={FUTURE}>{suffixes.substring(1)}</LineText>
      </>);
    }
    const timeRatio = (time - startTime) / (endTime - startTime);
    return (
      <Syllable 
        key={index}
        pos={[`${timeRatio * 100}%`, '0']}
        active={active}
      >
        {topContent}
        <LineText pos={['0', '40px']} active={active}>
        {bottomContent}
        </LineText>
      </Syllable>
    );
  });

  return (
    <LineContainer>
      <Timeline>
        {syllableList.reverse()}
        <TimelineBar>
          <ProgressBar
            startTime={gameStartTime + startTime}
            endTime={gameStartTime + endTime}
          />
        </TimelineBar>
      </Timeline>
      {/* <LineText active={ActiveStatus.PAST}>{typedLine + prefix}</LineText>
      <LineText active={ActiveStatus.FUTURE}>{suffix + toRomaji(line.substring(position + length))}</LineText> */}
      <LyricLine>{lyric}</LyricLine>
    </LineContainer>
  );
}

export default GameLine;

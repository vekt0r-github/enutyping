import React, { useState, useEffect, useRef } from "react";

import { toRomaji, toHiragana } from "wanakana";

import ProgressBar from "@/components/modules/ProgressBar";

import { LineData } from '@/components/modules/GameArea'

import styled, { css } from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

type Props = {
  gameStartTime: number,
  lineData: LineData,
  keyCallback: (hit: boolean) => void,
}

const LineContainer = styled.div`
  width: 100%;
  background-color: white;
`;

const Timeline = styled.div`
  width: 100%;
  height: 50px;
  position: relative;
`;

const LineText = styled.span<{
  pos?: number,
  active: number, // <0: inactive; 0: current; >0: future
}>`
  font-size: 18px;
  color: ${(props) => {
    if (props.active < 0) { return 'var(--clr-medgrey)'; }
    if (props.active === 0) { return 'var(--clr-link)'; }
    return 'black';
  }};
  ${(props) => props.pos ? css`
    position: absolute;
    left: ${props.pos * 100}%;
  ` : ''}
`;

const LyricLine = styled.div`
  font-size: 24px;
  color: black;
`;

const kanaRespellings = {
  shi: ["shi", "si", "ci"],
  chi: ["chi", "ti"],
  tsu: ["tsu", "tu"],
  ji: ["ji", "zi"],
  sha: ["sha", "sya"],
  sho: ["sho", "syo"],
  shu: ["shu", "syu"],
  ja: ["ja", "jya", "zya"],
  jo: ["jo", "jyo", "zyo"],
  ju: ["ju", "jyu", "zyu"],
  ka: ["ka", "ca"],
  ku: ["ku", "cu", "qu"],
  ko: ["ko", "co"],
  se: ["se", "ce"],
  fu: ["fu", "hu"]
};

const GameLine = ({ gameStartTime, lineData, keyCallback } : Props) => {
  const [position, _setPosition] = useState<number>(0);
  const positionRef = useRef(position);

  const {startTime, endTime, lyric, syllables} = lineData;
  const line = syllables.map(s => s.text).join('');

  const setPosition = (newPos: number) => {
    positionRef.current = newPos;
    _setPosition(newPos);
  };

  const getRomanizations = (kana: string) => {
    const canonical = toRomaji(kana);
    if(kana.length == 1) {
      if(canonical in kanaRespellings) return kanaRespellings[canonical];
      return [toRomaji(kana)];
    }

    // small tsu case
    if(kana[0] == "っ") {
      const subRomanizations = getRomanizations(kana.substring(1));
      return [].concat.apply([], subRomanizations.map(r => [r[0] + r, "xtu" + r, "xtsu" + r]));
    }

    // all that's left after the first 2 cases is combinations e.g. きょ
    let normals: string[] = [];
    if(canonical in kanaRespellings) normals = kanaRespellings[canonical];
    else normals = [canonical];

    let modifierRomaji: string = toRomaji(kana[1]);
    let weirds: string[] = getRomanizations(kana[0]).map(r => r + "x" + modifierRomaji);

    return normals.concat(weirds);
  };

  const kanaLength = useRef(0);
  const romanizations = useRef([]);

  const [prefix, _setPrefix] = useState<string>("");
  const prefixRef = useRef(""); // what the player has typed

  const setPrefix = (newPrefix: string) => {
    prefixRef.current = newPrefix;
    _setPrefix(newPrefix);
  }

  const sampleSuffix = useRef(""); // suggested autocomplete for current kana

  const populateNextKana = () => {
    const pos = positionRef.current;
    if(pos >= line.length) {
      setPrefix("");
      return;
    }

    romanizations.current = [];
    kanaLength.current = 1;
    if(line[pos] == "っ") {
      kanaLength.current++;
    }
    if(line[pos + kanaLength.current] in ["ょ", "ゃ", "ゅ"]) {
      kanaLength.current++;
    } 

    romanizations.current = getRomanizations(line.substr(pos, kanaLength.current));
    sampleSuffix.current = romanizations.current[0];
    setPrefix("");
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    // TODO: handle japanese input as well
    const pos = positionRef.current;
    if(line.length <= pos) return;
    const newPrefix = prefixRef.current + e.key;
    const filteredRomanizations = romanizations.current.filter(s => s.substr(0, newPrefix.length) == newPrefix);
    if(filteredRomanizations.length == 0) {
      keyCallback(false);
    }
    else {
      sampleSuffix.current = filteredRomanizations[0].substr(newPrefix.length);
      romanizations.current = filteredRomanizations;
      setPrefix(newPrefix);
      keyCallback(true);
    }

    if(sampleSuffix.current == "") {
      setPosition(pos + kanaLength.current);
      populateNextKana();
    }

  };

  useEffect(() => {
    setPosition(0);
    populateNextKana();
    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    }
  }, [lineData]);

  return (
    <LineContainer>
      <Timeline>
        {syllables.map(({time, text}, index) => 
          <LineText
            pos={(time - startTime) / (endTime - startTime)}
            active={index - position}
            >{text}</LineText>
        )}
        <ProgressBar
          startTime={gameStartTime + startTime}
          endTime={gameStartTime + endTime}
        />
      </Timeline>
      <LineText active={-1}>{toRomaji(line.substring(0, position)) + prefixRef.current}</LineText>
      <LineText active={1}>{sampleSuffix.current + toRomaji(line.substring(position + kanaLength.current))}</LineText>
      <LyricLine>{lyric}</LyricLine>
    </LineContainer>
  );
}

export default GameLine;
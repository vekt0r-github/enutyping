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

type Kana = {
  length: number,
  romanizations: string[],
  prefix: string,
  suffix: string
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
  const [position, setPosition] = useState<number>(0);
  const [curKana, setCurKana] = useState<Kana>({length: 0, romanizations: [], prefix: "", suffix: ""});
  const {length, romanizations, prefix, suffix} = curKana;


  const {startTime, endTime, lyric, syllables} = lineData;
  const line = syllables.map(s => s.text).join('');

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

  const populateNextKana = (pos: number) => {
    let newKana: Kana = {length: 1, romanizations: [], prefix: "", suffix: ""};
    if(pos >= line.length) {
      newKana.prefix = "";
    }
    else {
      newKana.length = 1;
      if(line[pos] == "っ") {
        newKana.length++;
      }
      if(line[pos + length] in ["ょ", "ゃ", "ゅ"]) {
        newKana.length++;
      } 
      newKana.romanizations = getRomanizations(line.substr(pos, newKana.length));
      newKana.suffix = newKana.romanizations[0];
      newKana.prefix = "";
    }
    setCurKana(newKana);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    // TODO: handle japanese input as well
    if(line.length <= position) return;
    const newPrefix = prefix + e.key;
    const filteredRomanizations = romanizations.filter(s => s.substr(0, newPrefix.length) == newPrefix);
    if(filteredRomanizations.length == 0) {
      keyCallback(false);
    }
    else {
      const newSuffix = filteredRomanizations[0].substr(newPrefix.length)
      const newKana: Kana = {length: length, romanizations: filteredRomanizations, prefix: newPrefix, suffix: newSuffix};
      setCurKana(newKana);
      if(newSuffix == "") {
        setPosition(position + length);
      }
      keyCallback(true);
    }

  };

  useEffect(() => {
    setPosition(0);
  }, [lineData]);

  useEffect(() => {
    populateNextKana(position);
  }, [position, lineData]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    }
  }, [position, lineData, prefix, suffix]);

  let syllableList = [];
  let syllablePos: int = 0;
  syllables.forEach(({time, text}) => {
    if(syllablePos + text.length <= position) {
      syllableList.push(<LineText 
        pos={(time - startTime) / (endTime - startTime)}
        active={1}
        >{text}</LineText>);
    }
    else if(syllablePos > position) {
      syllableList.push(<LineText 
        pos={(time - startTime) / (endTime - startTime)}
        active={-1}
        >{text}</LineText>);
    }
    else {
      syllableList.push(<LineText 
        pos={(time - startTime) / (endTime - startTime)}
        active={0}
        >{text}</LineText>);
    }
    syllablePos += text.length;
  });

  return (
    <LineContainer>
      <Timeline>
        {syllableList}
        <ProgressBar
          startTime={gameStartTime + startTime}
          endTime={gameStartTime + endTime}
        />
      </Timeline>
      <LineText active={-1}>{toRomaji(line.substring(0, position)) + prefix}</LineText>
      <LineText active={1}>{suffix + toRomaji(line.substring(position + length))}</LineText>
      <LyricLine>{lyric}</LyricLine>
    </LineContainer>
  );
}

export default GameLine;
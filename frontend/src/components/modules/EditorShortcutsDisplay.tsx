import React, { useState } from "react";

import styled, { css } from 'styled-components';
import '@/utils/styles.css';
import { Line, SubBox, Sidebar } from '@/utils/styles';

type Props = {

};

const info = [
  [`Space`, `Play/Pause`],
  [`←↑→↓`, `Navigate the timeline`],
  [`Ctrl+S`, `Save beatmap`],
  [`T`, `Place a timing point`, `Make sure your timing is correct! Look up the BPM of your song, navigate to the first downbeat, and place your timing point.`],
  [`U`, `Delete last timing point`],
  [`[ and ]`, `Change beat snap divisor`, `Each white tick in the timeline is one beat, and the colored lines are subdivisions.`],
  [`Ctrl+Enter`, `Place a new line`, `Place a line whenever a line of lyrics starts, and enter the lyrics in the textbox. You can join or split lines to make the beatmap more readable!`],
  [`Ctrl+⌫`, `Delete the previous line`],
  [`Enter`, `Place a new syllable`, `Write the exact kana or letters you want the player to type at the current time. `],
  [`⌫`, `Delete the previous syllable`],
  [`Ctrl+←↑→↓`, `Navigate to nearest lines/syllables`],
  [`E`, `Set beatmap's end time`, `This is when your last line ends.`],
  [`Ctrl+Space`, `Enter "Testing Mode"`, `This is where you can test your map from any point, to see how hard it is!`],
  [`Esc`, `Exit Testing Mode`],
]

const InfoEntry = styled.div`
  width: 100%;
  position: relative;
  margin-bottom: var(--xs);
  display: flex;
`;

const InfoLabel = styled(Line)`
  font-weight: bold;
  width: 100px;
  flex-shrink: 0;
  display: inline-block;
  text-align: right;
  margin-right: var(--s);
`;

const InfoInst = styled(Line)`
  display: inline-block;
  white-space: normal;
`

const InfoDesc = styled(SubBox)`
  position: absolute;
  left: var(--s);
  top: 24px;
  width: calc(100% - 3*var(--s));
  white-space: normal;
  font-size: 0.8em;
  z-index: 1;
`

const InfoToggle = styled.div<{active: boolean}>`
  cursor: pointer;
  position: absolute;
  user-select: none;
  left: -2px;
  top: 0;
  ${({active}) => active ? css`
    transform: rotate(0.25turn);
  ` : null}
`;

const EditorShortcutsDisplay = ({  } : Props) => {
  const [curr, setCurr] = useState<number>();

  return (
    <Sidebar>
      <Line as="h2" size="1.5em" margin="0.75em 0">Editor How-To</Line>
      {info.map((line, i) => {
        const [key, inst, desc] = line;
        const active = i === curr;
        return (
          <InfoEntry>
            <InfoLabel>{key}: </InfoLabel>
            <InfoInst>{inst}</InfoInst>
            {desc ? <>
              <InfoToggle active={active} onClick={() => setCurr(c => c === i ? undefined : i)}>&gt;</InfoToggle>
              {active ? <InfoDesc>{desc}</InfoDesc> : null}
            </> : null}
          </InfoEntry>
        )
      })}
    </Sidebar>
  );
}

export default EditorShortcutsDisplay;

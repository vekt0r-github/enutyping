import React, { useState } from "react";

import { getL10nFunc } from '@/providers/l10n';

import styled, { css } from 'styled-components';
import '@/utils/styles.css';
import { Line, SubBox, Sidebar, InfoEntry } from '@/utils/styles';

type Props = {

};

const info = [
  [`Space`, `editor-shortcut-play-pause`],
  [`←↑→↓`, `editor-shortcut-scroll`],
  [`Ctrl+S`, `editor-shortcut-save`],
  [`T`, `editor-shortcut-timing-add`, `editor-shortcut-timing-add-desc`],
  [`U`, `editor-shortcut-timing-remove`],
  [`[ ]`, `editor-shortcut-beat-snap`, `editor-shortcut-beat-snap-desc`],
  [`Ctrl+Enter`, `editor-shortcut-line-add`, `editor-shortcut-line-add-desc`],
  [`Ctrl+⌫`, `editor-shortcut-line-remove`],
  [`Enter`, `editor-shortcut-syllable-add`, `editor-shortcut-syllable-add-desc`],
  [`⌫`, `editor-shortcut-syllable-remove`],
  [`Ctrl+←↑→↓`, `editor-shortcut-scroll-jump`],
  [`E`, `editor-shortcut-end-set`, `editor-shortcut-end-set-desc`],
  [`Ctrl+Space`, `editor-shortcut-testing-enter`, `editor-shortcut-testing-enter-desc`],
  [`Esc`, `editor-shortcut-testing-exit`],
]

const ShortcutInfoEntry = styled(InfoEntry)`
  position: relative; /* to enable the dropdown descriptions */
`;

const InfoLabel = styled(Line)`
  font-weight: var(--fw-bold);
  width: 100px;
  flex-shrink: 0;
  display: inline-block;
  text-align: right;
  margin-right: var(--s);
`;

const InfoInst = styled(Line)`
  display: inline-block;
  white-space: normal;
  width: calc(100% - 100px); // why does my life have to be like this
`;

const InfoDesc = styled(SubBox)`
  position: absolute;
  left: var(--s);
  top: 24px;
  width: calc(100% - 3*var(--s));
  white-space: normal;
  font-size: 0.8em;
  z-index: 1;
`;

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
  const text = getL10nFunc();

  return (
    <Sidebar>
      <Line as="h2" size="1.5em" margin="0.75em 0">{text(`editor-shortcut-header`)}</Line>
      {info.map((line, i) => {
        const [key, inst, desc] = line;
        const active = i === curr;
        return (
          <ShortcutInfoEntry key={i}>
            <InfoLabel>{key}: </InfoLabel>
            <InfoInst>{text(inst)}</InfoInst>
            {desc ? <>
              <InfoToggle active={active} onClick={() => setCurr(c => c === i ? undefined : i)}>&gt;</InfoToggle>
              {active ? <InfoDesc>{text(desc)}</InfoDesc> : null}
            </> : null}
          </ShortcutInfoEntry>
        )
      })}
    </Sidebar>
  );
}

export default EditorShortcutsDisplay;

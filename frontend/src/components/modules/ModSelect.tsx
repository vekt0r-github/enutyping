import React from "react";

import { InfoDisplay } from "@/components/modules/InfoDisplay";

import { L10nFunc } from "@/providers/l10n";

import { ModCombo, getModCombo } from "@/utils/types";
import { makeSetFunc } from "@/utils/beatmaputils";
import { getScoreMultiplier } from "@/utils/gameplayutils";

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox } from "@/utils/styles";

type Props = {
  availableSpeeds: number[], // empty array means game in progress; can't change
  speed: number,
  setSpeed: React.Dispatch<React.SetStateAction<number>>,
  modCombo: ModCombo,
  setModCombo: React.Dispatch<React.SetStateAction<ModCombo>>,
};

const ModSelectContainer = styled(MainBox)`
  width: 600px;
  /* position: absolute; */
  align-self: center;
  opacity: 0.9;
  margin-top: 3em;
`;

const MultiplierDisplay = styled.p`
  text-align: center;
  width: 100%;
  font-weight: bold;
  font-size: 1.125em;
`;

const MultiplierBig = styled.span`
  font-size: 1.5rem;
`;

const ModSelectContent = InfoDisplay("game-mods-header", ({ availableSpeeds, speed, setSpeed, modCombo, setModCombo } : Props, text: L10nFunc) => {
  const canEdit = (availableSpeeds.length > 0);
  const speedOptions = canEdit ? availableSpeeds : [speed];
  const {hidden} = modCombo;
  const setMod = makeSetFunc(setModCombo);

  const percentDisplay = (speed: number, modCombo: ModCombo) => {
    const mult = getScoreMultiplier(speed, modCombo);
    const percentChange = Math.round((mult - 1) * 100)
    if (percentChange === 0) { return '±0%'}
    return `${percentChange < 0 ? "" : "+"}${percentChange}%`;
  }

  return [
    ["", <MultiplierDisplay>
      {text("game-mods-multiplier")}:&nbsp;
      <MultiplierBig>{getScoreMultiplier(speed, modCombo).toFixed(2)}x</MultiplierBig>
    </MultiplierDisplay>],
    [
      "game-mods-speed", 
      <select value={speed} onChange={(e) => setSpeed(Number.parseFloat(e.target.value))} disabled={!canEdit}>
        {speedOptions.map((s: number) => 
          <option key={s} value={s}>{s}x ({percentDisplay(s, getModCombo(0))})</option>
        )}
      </select>,
      text("game-mods-speed-desc"),
    ],
    [
      "game-mods-hidden",
      <label>
        HD ({percentDisplay(1, {hidden: true})})
        <input type="checkbox" checked={hidden} onChange={(e) => setMod("hidden")(e.target.checked)} disabled={!canEdit}></input>
      </label>,
      text("game-mods-hidden-desc"),
    ],
  ]
});

const ModSelect = (props: Props) => {
  return <ModSelectContainer>
    <ModSelectContent {...props} />
  </ModSelectContainer>
}

export default ModSelect;

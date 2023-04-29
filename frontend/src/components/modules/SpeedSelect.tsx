import React  from "react";

import { getL10nFunc } from "@/providers/l10n";

import styled from 'styled-components';
import '@/utils/styles.css';
import { InfoBox, InfoEntry } from '@/utils/styles';

type Props = {
  availableSpeeds: number[],
  speed: number,
  setSpeed: React.Dispatch<React.SetStateAction<number>>,
};

const SpeedSelect = ({ availableSpeeds, speed, setSpeed } : Props) => {
  const text = getL10nFunc();
  const speedSelect = (
    <>
      <select value={speed} onChange={(e) => setSpeed(Number.parseFloat(e.target.value))}>
        {(availableSpeeds ?? [1]).map((s: number) => 
          <option key={s} value={s}>{s}x</option>
        )}
      </select>
    </>
  );

  return (
    <>
      <h2>{text(`game-mods-header`)}</h2>
      <InfoBox width={90}>
        <InfoEntry>
          <span><b>{text(`game-mods-speed`)}</b>{speedSelect}</span>
        </InfoEntry>
        <p>{text(`game-mods-speed-desc`)}</p>
      </InfoBox>
    </>
  );
}

export default SpeedSelect;

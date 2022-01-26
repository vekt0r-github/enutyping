import React  from "react";

import styled from 'styled-components';
import '@/utils/styles.css';
import { InfoBox, InfoEntry } from '@/utils/styles';

type Props = {
	availableSpeeds: number[],
	speed: number,
	setSpeed: React.Dispatch<React.SetStateAction<number>>,
};

const SpeedSelect = ({ availableSpeeds, speed, setSpeed } : Props) => {
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
			<h2>Map Modifications</h2>
			<InfoBox width={90}>
				<InfoEntry>
					<span><b>Map Playback Speed: </b>{speedSelect}</span>
				</InfoEntry>
				<p>Use this to change how fast the map is (slower is easier, faster is harder)!</p>
			</InfoBox>
		</>
  );
}

export default SpeedSelect;

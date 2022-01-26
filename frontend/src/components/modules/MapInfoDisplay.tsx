import React  from "react";

import styled from 'styled-components';
import '@/utils/styles.css';
import { Line, Link, Sidebar, InfoBox, InfoEntry } from '@/utils/styles';

type Props = {
  title: string,
  artist: string,
  source: string,
  diffname?: string | JSX.Element,
	availableSpeeds?: number[],
	speed?: number,
	setSpeed?: React.Dispatch<React.SetStateAction<number>>,
  kpm?: number,
};

const NoWrapSpan = styled.span`
	white-space: nowrap;
	margin-right: var(--s);
`;
const OverflowSpan = styled.span`
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
`;

const MapInfoDisplay = ({ title, artist, diffname, kpm, availableSpeeds, speed, setSpeed, source } : Props) => {

  const mapInfoPairs: [string, string | number | JSX.Element | undefined][] = [
    ["Title", title],
    ["Artist", artist],
    ["Difficulty Name", diffname],
    ["Average KPM", kpm ? Math.round(kpm) : 0],
    ["Source Video", source.length ? 
			<Link as="a" href={source}>Link (YouTube)</Link>
			: <Line>Source link not set</Line>],
  ];

  const mapInfoElements = mapInfoPairs.map((entry: [string, string | number | JSX.Element | undefined]) => (
    <InfoEntry key={entry[0]}>
      <NoWrapSpan><b>{entry[0]}:</b></NoWrapSpan>
      <OverflowSpan>{entry[1]}</OverflowSpan>
    </InfoEntry>
  ));

	const speedSelect = speed && setSpeed && (
		<>
			<select value={speed} onChange={(e) => setSpeed(Number.parseFloat(e.target.value))}>
				{(availableSpeeds ?? [1]).map((s: number) => 
					<option key={s} value={s}>{s}x</option>
				)}
			</select>
		</>
	);

  return (
    <Sidebar>
      <h2>Map Information</h2>
			<InfoBox width={90}>
				{mapInfoElements}
			</InfoBox>
			{speed && <>
				<h2>Map Modifications</h2>
				<InfoBox width={90}>
					<InfoEntry>
						<span><b>Map Playback Speed: </b>{speedSelect}</span>
					</InfoEntry>
					<p>Use this to change how fast the map is (slower is easier, faster is harder)!</p>
				</InfoBox>
			</>}
    </Sidebar>
  );
}

export default MapInfoDisplay;

import React  from "react";

import styled from 'styled-components';
import '@/utils/styles.css';
import { Line, Link, Sidebar, InfoBox, InfoEntry } from '@/utils/styles';

type Props = {
  title: string,
  artist: string,
  source: string,
  diffname?: string | JSX.Element,
  kpm?: number,
};

const MapInfoDisplay = ({ title, artist, diffname, kpm, source } : Props) => {

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
      <span><b>{entry[0]}:</b></span>
      <span>{entry[1]}</span>
    </InfoEntry>
  ));

  return (
    <Sidebar>
      <h2>Map Information</h2>
			<InfoBox width={90}>
				{mapInfoElements}
			</InfoBox>
    </Sidebar>
  );
}

export default MapInfoDisplay;

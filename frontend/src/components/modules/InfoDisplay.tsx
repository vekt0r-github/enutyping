import React  from "react";

import { BeatmapMetadata, Beatmapset } from "@/utils/types";

import styled from 'styled-components';
import '@/utils/styles.css';
import { Line, Link, InfoBox, InfoEntry } from '@/utils/styles';
import { getSetAvg } from "@/utils/beatmaputils";

type InfoPair = [string, string | number | JSX.Element | undefined]

const NoWrapSpan = styled.span`
	white-space: nowrap;
	margin-right: var(--s);
`;
const OverflowSpan = styled.span`
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
`;

const InfoDisplay = <Props,>(title: string, infoPairs: (p: Props) => InfoPair[]) => (props: Props) => {
  const infoElements = infoPairs(props).map((entry: InfoPair) => (
    <InfoEntry key={entry[0]}>
      <NoWrapSpan><b>{entry[0]}:</b></NoWrapSpan>
      <OverflowSpan>{entry[1]}</OverflowSpan>
    </InfoEntry>
  ));

  return (
    <>
      <h2>{title}</h2>
      <InfoBox width={90}>
        {infoElements}
      </InfoBox>
    </>
  );
}

const mapInfoPairs = ({ title, artist, diffname, kpm, source }: BeatmapMetadata): InfoPair[] => [
  ["Title", title],
  ["Artist", artist],
  ["Difficulty Name", diffname],
  ["Average KPM", kpm ? Math.round(kpm) : 0],
  ["Source Video", source?.length ? 
    <Link as="a" href={source}>Link (YouTube)</Link>
    : <Line>Source link not set</Line>],
];

export const MapInfoDisplay = InfoDisplay("Map Info", mapInfoPairs);

const mapsetInfoPairs = (set: Beatmapset): InfoPair[] => [
  ["Name", set.name],
  // ["Description", set.description],
  ["Owner", set.owner.name],
  ["Average Collection KPM", Math.round(getSetAvg(set, "kpm"))],
];

export const MapsetInfoDisplay = InfoDisplay("Collection Info", mapsetInfoPairs);

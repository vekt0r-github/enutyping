import React  from "react";

import { getL10nFunc, L10nFunc } from "@/providers/l10n";

import { getSetAvg } from "@/utils/beatmaputils";
import { BeatmapMetadata, Beatmapset } from "@/utils/types";

import styled from 'styled-components';
import '@/utils/styles.css';
import { Line, Link, InfoBox, InfoEntry } from '@/utils/styles';

// the first entry of InfoPair is now the FTL key
export type InfoPair = [string, string | number | JSX.Element | undefined];

const NoWrapSpan = styled.span`
	white-space: nowrap;
	margin-right: var(--s);
`;
const OverflowSpan = styled.span`
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
`;

export const InfoDisplay = <Props,>(title: string, infoPairs: (p: Props, text: L10nFunc) => InfoPair[]) => (props: Props) => {
  const text = getL10nFunc();
  
  const infoElements = infoPairs(props, text).map((entry: InfoPair) => (
    <InfoEntry key={entry[0]}>
      <NoWrapSpan><b>{text(entry[0])}:</b></NoWrapSpan>
      <OverflowSpan>{entry[1]}</OverflowSpan>
    </InfoEntry>
  ));

  return (
    <>
      {title ? <h2>{text(title)}</h2> : null}
      <InfoBox width={90}>
        {infoElements}
      </InfoBox>
    </>
  );
}

const mapInfoPairs = ({ title, artist, diffname, kpm, source }: BeatmapMetadata, text: L10nFunc): InfoPair[] => [
  ["map-info-title", title],
  ["map-info-artist", artist],
  // ["Difficulty Name", diffname], // TODO: add creator or something
  ["map-info-kpm", kpm ? Math.round(kpm) : 0],
  ["map-info-source", source?.length ? 
    <Link as="a" href={source}>{text(`map-info-source-link`)}</Link>
    : <Line>{text(`map-info-source-no-link`)}</Line>],
];

export const MapInfoDisplay = InfoDisplay("map-info", mapInfoPairs);

const mapsetInfoPairs = (set: Beatmapset): InfoPair[] => [
  ["mapset-info-name", set.name],
  // ["Description", set.description],
  ["mapset-info-owner", set.owner.name],
  ["mapset-info-kpm", Math.round(getSetAvg(set, "kpm"))],
];

export const MapsetInfoDisplay = InfoDisplay("mapset-info", mapsetInfoPairs);

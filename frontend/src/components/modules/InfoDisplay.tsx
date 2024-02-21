import React from "react";

import { getL10nFunc, L10nFunc } from "@/providers/l10n";

import { getSetAvg } from "@/utils/beatmaputils";
import { BeatmapMetadata, Beatmapset } from "@/utils/types";

import styled from 'styled-components';
import '@/utils/styles.css';
import { Line, Link, InfoBox, InfoEntry } from '@/utils/styles';

export type InfoPair = [
  string, // FTL key for text on the left
  string | number | JSX.Element | undefined, // value on the right
  (string | number | JSX.Element)?, // optional description below
];

const Header = styled.h2`
  /* margin: var(--s); */
  width: 100%;
  text-align: center;
`;

const InfoDisplayEntry = styled(InfoEntry)`
  justify-content: space-between;
  display: flex;
  align-items: center;
  line-height: 1.5em;
`;

const NoWrapSpan = styled.span`
  font-weight: var(--fw-bold);
	white-space: nowrap;
	margin-right: var(--s);
`;

const OverflowSpan = styled.span`
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
`;

const Description = styled.p`
  font-size: 0.8em;
  margin: 0 0 var(--s) 0;
  width: fit-content;
  position: relative;
  left: var(--s);
`;

export const InfoDisplay = <Props,>(title: string, infoPairs: (p: Props, text: L10nFunc) => InfoPair[]) => (props: Props) => {
  const text = getL10nFunc();
  
  const infoElements = infoPairs(props, text).map(([label, value, desc]: InfoPair) => (<>
    <InfoDisplayEntry key={label}>
      {label ? <NoWrapSpan>{text(label)}:</NoWrapSpan> : null}
      {["string", "number"].includes(typeof value) ? <OverflowSpan>{value}</OverflowSpan> : value}
    </InfoDisplayEntry>
    {desc ? <Description>{desc}</Description> : null}
  </>));

  return (
    <>
      {title ? <Header>{text(title)}</Header> : null}
      <InfoBox>
        {infoElements}
      </InfoBox>
    </>
  );
}

const mapInfoPairs = ({ title, artist, diffname, owner, kpm, source }: BeatmapMetadata, text: L10nFunc): InfoPair[] => [
   // TODO: add creator or something
  ["map-info-title", title],
  ["map-info-artist", artist],
  ["map-info-diffname", diffname],
  ["map-info-owner", owner.name],
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

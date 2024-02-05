import React, { useContext, useState }  from "react";

import ConfirmPopup from "@/components/modules/ConfirmPopup";
import YTThumbnail from "@/components/modules/YTThumbnail";

import { Beatmap, MapID } from "@/utils/types";

import { getL10nFunc, getL10nElementFunc } from '@/providers/l10n';
import { Config, configContext } from '@/providers/config';

import { getArtist, getTitle } from "@/utils/beatmaputils";

import styled, { StyledComponentProps } from 'styled-components';
import '@/utils/styles.css';
import { MainBox, Link, Line, BlackLine } from '@/utils/styles';
import { httpDelete } from "@/utils/functions";

type Props = {
  getBeatmaps?: () => void,
  beatmaps: Beatmap[],
  includeMapCreate: boolean,
  onObjectClick?: (mapId: MapID) => void
  link?: (mapId: MapID) => string
};

const MapLink = styled(MainBox)`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  color: var(--lavender);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
`;

const MapBox = styled(MainBox)`
  height: 204px;
  width: 220px;
  margin: var(--s);
  box-sizing: content-box;
  position: relative;
  background-color: var(--clr-primary);
  transition: var(--tt-long);
  &:hover, &:focus {
    z-index: 1;
    background-color: var(--clr-primary-light);
  }
  & ${Line} {
    width: 100%;
    text-align: center;
  }
`;

const NewMapBox = styled(MapBox)`
  background-color: var(--clr-create-map);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: black;
  transition: var(--tt-short);
  &:hover, &:focus {
    background-color: var(--clr-create-map-light);
    color: black;
  }
`;

export const NewMapLine = styled.h2`
  max-width: 100%;
  size: 1.5em;
  color: black;
  text-align: center;
`;

const MapInfo = styled.div`
  margin-top: var(--s);
  width: 100%;
`;

type TargetProps = {
  as?: React.ComponentType,
  to?: string,
  onClick?: () => void,
}

const MapList = ({ getBeatmaps, beatmaps, includeMapCreate, onObjectClick, link } : Props) => {
  const text = getL10nFunc();
  const elem = getL10nElementFunc();
  const config = useContext(configContext);

  const makeTargetProps = (mapId: MapID) => {
    let props: TargetProps = link ? {
      as: Link,
      to: link(mapId),
    } : {}
    if (onObjectClick) props = {...props, onClick: () => onObjectClick(mapId)}
    return props;
  }

  // TODO: ensure deleting a mapset has no cascade

  return (
    <>
      {/* optional create buttons come first */}
      {includeMapCreate ? 
        <NewMapBox {...makeTargetProps("new")}>
          <Line size="6em" margin="0 0 -40px 0">+</Line>
          <NewMapLine>{text(`menu-map-new`)}</NewMapLine>
        </NewMapBox> : null}
      {/* next, the actual beatmaps */}
      {beatmaps?.map((beatmap) => {
        return (
          <MapBox key={beatmap.id}>
            <MapLink {...makeTargetProps(beatmap.id)}>
              <YTThumbnail yt_id={beatmap.yt_id} width={160} height={90} />
              <Line size='1.25em' lineHeightRatio={1.35} as='h2' margin="var(--s) 0 0 0">{getTitle(beatmap, config)}</Line>
              <Line size='1em' lineHeightRatio={1.35} margin="0">{getArtist(beatmap, config)}</Line>
              <MapInfo>
                <Line size='1em' margin="0">{text(`menu-map-kpm`, {kpm: beatmap.kpm ?? 0})}</Line>
                <Line size='0.8em' margin="0">{text(`menu-map-owner`, {owner: beatmap.owner.name})}</Line>
              </MapInfo>
            </MapLink>
          </MapBox>
        );
      })}
    </>
  );
}

export default MapList;

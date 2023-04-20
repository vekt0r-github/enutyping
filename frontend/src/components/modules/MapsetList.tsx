import React, { useState }  from "react";

import ConfirmPopup from "@/components/modules/ConfirmPopup";
import YTThumbnail from "@/components/modules/YTThumbnail";

import { Config, Beatmapset, Beatmap, BeatmapMetadata } from "@/utils/types";

import { getArtist, getTitle, getSetAvg } from "@/utils/beatmaputils";

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox, SubBox, Link, Line, BlackLine, Thumbnail } from '@/utils/styles';
import { httpDelete } from "@/utils/functions";

type Props = {
  getBeatmapsets: () => void,
  mapsets: Beatmapset[],
  includeCreate: boolean,
  config: Config,
  link: (mapsetId: number, mapId?: number|string) => string,
};

const SetLink = styled(MainBox)`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  color: var(--lavender);
  display: flex;
  box-sizing: border-box;
`;

const DiffsContainer = styled.div`
  width: 100%;
  z-index: 1;
`;

const Diff = styled(SubBox)<{color: string, changeHeight?: boolean}>`
  background-color: ${({color}) => `var(--clr-${color})`};
  display: flex;
  align-items: center;
  width: 100%;
  height: 32px;
  padding: var(--xs) var(--s);
  & + &, & + div { margin-top: var(--xs); } /* clap point stupid */
  box-sizing: border-box;
  transition: var(--tt-short);
  z-index: 1;
  &:hover {
    background-color: ${({color}) => `var(--clr-${color}-light)`};
    cursor: pointer;
    ${({changeHeight}) => changeHeight ? "height: auto;" : ''}
    & > ${Line} {
      overflow: visible;
      white-space: normal;
    }
  }
  & > ${Thumbnail} + ${Line} {
    margin-left: var(--s);
  }
`;

const HoverContainer = styled(MainBox)`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background-color: var(--clr-primary);
  display: flex;
  transition: var(--tt-long);
  & > ${DiffsContainer} { display: none; }
`;

const SongBox = styled(MainBox)`
  height: 90px;
  min-width: 360px;
  max-width: 480px;
  margin: var(--s);
  box-sizing: content-box;
  position: relative;
  &:hover, &:focus {
    z-index: 1;
    & > ${HoverContainer} {
      padding-top: calc(90px + 2*var(--s));
      background-color: var(--clr-primary-light);
      height: fit-content;
      & > ${DiffsContainer} { display: block; }
    }
  }
`;

const Info = styled.div`
  margin-left: var(--s);
  min-width: 0;
`;

const MapsetList = ({ getBeatmapsets, mapsets, includeCreate, config, link } : Props) => {
  const handleDeleteBeatmapset = async (mapsetId: number) => {
    const res = await httpDelete(`/api/beatmapsets/${mapsetId}`);
    if (res && res.success) {
      getBeatmapsets();
    }
  };

  return (
    <>
      {mapsets?.map((mapset) => {
        const {icon_url, owner, beatmaps} = mapset;
        const mapCount = beatmaps.length;
        return (
          <SongBox key={mapset.id}>
            <HoverContainer>
              <SetLink as={Link} to={link(mapset.id)}>
                <Thumbnail src={icon_url} width={120} height={90} />
                <Info>
                  <Line size='1.25em' as='h2' margin="0">{mapset.name}</Line>
                  {/* <Line size='1em' margin="0">by {getArtist(mapset, config)}</Line> */}
                  <Line size='1em' margin="0">{mapset.description}</Line>
                  <Line size='0.8em' margin="0">created by {owner.name}</Line>
                  <Line size='0.8em' margin="0">{mapCount} map{mapCount !== 1 ? 's' : ''} | Average keys/min: {Math.round(getSetAvg(mapset, 'kpm'))}</Line>
                </Info>
              </SetLink>
              <DiffsContainer>
                {beatmaps.map((map) => 
                  <Diff
                    as={Link} 
                    to={link(mapset.id, map.id)} 
                    color={"secondary"}
                    changeHeight={true}
                    key={map.id}
                  >
                    <YTThumbnail yt_id={map.yt_id} width={32} height={24} />
                    <Line size="1em" margin="0">{getArtist(map, config)} - {getTitle(map, config)} [{map.diffname}] ({Math.round(map.kpm ?? 0)} kpm)</Line>
                  </Diff>
                )}
                {/* below only when in editor mode */}
                {includeCreate ? <>
                  <Diff
                    as={Link} 
                    to={link(mapset.id, "new")} 
                    color={"create"}
                    key={"new"}
                  >
                    <BlackLine size="2.5em" margin="-1.5px 8px 0 0">+</BlackLine>
                    <BlackLine size="1em">Create New Beatmap in Collection</BlackLine>
                  </Diff>
                  <ConfirmPopup 
                    button={<Diff color="warn">
                    <BlackLine size="2.5em" margin="-8px 14px 0 5px">-</BlackLine>
                      <BlackLine size="1em">Delete Collection</BlackLine>
                    </Diff>}
                    warningText={<>
                      <Line size="1.25em" margin="1.5em 0 0 0">Are you sure you want to delete this beatmapset:</Line>
                      <Line size="1.75em" margin="1.5em 0 0 0">{mapset.name}?</Line>
                      <Line size="1.25em" margin="1.5em 0 0 0">All {mapCount} beatmap(s) will be deleted.</Line>
                      <Line size="1.25em" margin="1.5em 0 0 0">This action is permanent and cannot be undone.</Line>
                    </>}
                    onConfirm={() => handleDeleteBeatmapset(mapset.id)}
                  />
                </> : null}
              </DiffsContainer>
            </HoverContainer>
          </SongBox>
        );
      })}
    </>
  );
}

export default MapsetList;

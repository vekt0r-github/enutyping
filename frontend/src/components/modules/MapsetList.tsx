import React, { useState }  from "react";

import YTThumbnail from "@/components/modules/YTThumbnail";
import ConfirmPopup from "@/components/modules/ConfirmPopup";

import { Config, Beatmapset, Beatmap, BeatmapMetadata } from "@/utils/types";

import { formatTime, getArtist, getTitle } from "@/utils/beatmaputils";

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox, SubBox, Link, Line, BlackLine } from '@/utils/styles';
import { httpDelete } from "@/utils/functions";

type Props = {
  getBeatmapsets: () => void,
  mapsets: Beatmapset[],
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

const Diff = styled(SubBox)<{color: string}>`
  background-color: ${({color}) => `var(--clr-${color})`};
  display: flex;
  align-items: center;
  width: 100%;
  height: 30px;
  padding: 1px var(--s);
  & + &, & + div { margin-top: var(--xs); } /* clap point stupid */
  box-sizing: border-box;
  transition: var(--tt-short);
  z-index: 1;
  &:hover {
    background-color: ${({color}) => `var(--clr-${color}-light)`};
    cursor: pointer;
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

const MapsetList = ({ getBeatmapsets, mapsets, config, link } : Props) => {
  const handleDeleteBeatmapset = async (mapsetId: number) => {
    const res = await httpDelete(`/api/beatmapsets/${mapsetId}`);
    if (res && res.success) {
      getBeatmapsets();
    }
  };

  return (
    <>
      {mapsets?.map((mapset) => {
        const {yt_id, preview_point, owner, beatmaps, duration} = mapset; 
        const diffCount = beatmaps.filter((map: Beatmap | BeatmapMetadata) => (map.id !== "new")).length;
        return (
          <SongBox key={mapset.id}>
            <HoverContainer>
              <SetLink as={Link} to={link(mapset.id)}>
                <YTThumbnail yt_id={yt_id} width={120} height={90} />
                <Info>
                  <Line size='1.25em' as='h2'>{getTitle(mapset, config)}</Line>
                  <Line size='1em'>by {getArtist(mapset, config)}</Line>
                  <Line size='0.8em'>mapped by {owner.name}</Line>
                  <Line size='0.8em'>{formatTime(duration).slice(0, -4)} | {diffCount} difficult{diffCount !== 1 ? 'ies' : 'y'}</Line>
                </Info>
              </SetLink>
              <DiffsContainer>
                {/* This map_id === new, delete shit pattern code color is so scuffed wtf */}
                {beatmaps.map((map) => 
                  <Diff
                    as={Link} 
                    to={link(mapset.id, map.id)} 
                    color={(map.id === "new") ? "create" : "secondary"}
                    key={map.id}
                  >
                    {(map.id === "new") ? <>
												<BlackLine size="2.5em" margin="-1.5px 8px 0 0">+</BlackLine>
												<BlackLine size="1em">{map.diffname}</BlackLine>
											</>
                      : <>
                    		<Line size="1em">{map.diffname} ({formatTime(map.length!).slice(0, -4)}, {Math.round(map.kpm ?? 0)} keys/min)</Line>
											</>}
                  </Diff>
                )}
                {/* scuff code due to scuff code */
                // now it's more scuffed yw
                  beatmaps.map(b => b.id).includes("new") &&
                  <ConfirmPopup 
                    button={<Diff color="warn">
                    <BlackLine size="2.5em" margin="-8px 14px 0 5px">-</BlackLine>
                      <BlackLine size="1em">Delete Beatmapset</BlackLine>
                    </Diff>}
                    warningText={<>
                      <Line size="1.25em" margin="1.5em 0 0 0">Are you sure you want to delete this beatmapset:</Line>
                      <Line size="1.75em" margin="1.5em 0 0 0">{mapset.artist} - {mapset.title}?</Line>
                      <Line size="1.25em" margin="1.5em 0 0 0">All {diffCount} beatmap(s) will be deleted.</Line>
                      <Line size="1.25em" margin="1.5em 0 0 0">This action is permanent and cannot be undone.</Line>
                    </>}
                    onConfirm={() => handleDeleteBeatmapset(mapset.id)}
                  />
                }
              </DiffsContainer>
            </HoverContainer>
          </SongBox>
        );
      })}
    </>
  );
}

export default MapsetList;

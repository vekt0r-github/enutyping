import React, { useState }  from "react";

import YTThumbnail from "@/components/modules/YTThumbnail";

import { Config, Beatmapset } from "@/utils/types";

import { getArtist, getTitle } from "@/utils/beatmaputils";

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox, SubBox, Link, Line } from '@/utils/styles';

type Props = {
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
  & + & { margin-top: var(--xs); }
  box-sizing: border-box;
  transition: var(--tt-short);
  z-index: 1;
  &:hover {
    background-color: ${({color}) => `var(--clr-${color}-light)`};
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

const MapsetList = ({ mapsets, config, link } : Props) => {
  return (
    <>
      {mapsets?.map((mapset) => {
        const {yt_id, preview_point, owner, beatmaps} = mapset;
        const diffCount = beatmaps.filter((map) => map.id !== "new").length;
        return (
          <SongBox key={mapset.id}>
            <HoverContainer>
              <SetLink as={Link} to={link(mapset.id)}>
                <YTThumbnail yt_id={yt_id} width={120} height={90} />
                <Info>
                  <Line size='1.25em' as='h2'>{getTitle(mapset, config)}</Line>
                  <Line size='1em'>by {getArtist(mapset, config)}</Line>
                  <Line size='0.8em'>mapped by {owner.name}</Line>
                  <Line size='0.8em'>{diffCount} difficult{diffCount !== 1 ? 'ies' : 'y'}</Line>
                </Info>
              </SetLink>
              <DiffsContainer>
                {beatmaps.map((map) => 
                  <Diff
                    as={Link} 
                    to={link(mapset.id, map.id)} 
                    color={(map.id === "new") ? "create" : "secondary"}
                    key={map.id}
                  >
                    {(map.id === "new") ? <Line size="2.5em" margin="-1.5px 8px 0 0">+</Line> : null}
                    <Line size="1em">{map.diffname}</Line>
                  </Diff>
                )}
              </DiffsContainer>
            </HoverContainer>
          </SongBox>
        );
      })}
    </>
  );
}

export default MapsetList;

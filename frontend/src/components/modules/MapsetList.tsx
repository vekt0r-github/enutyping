import React  from "react";

import YTThumbnail from "@/components/modules/YTThumbnail";

import { Config, Beatmapset } from "@/utils/types";

import { getArtist, getTitle } from "@/utils/beatmaputils";

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox, SubBox, Link, Line } from '@/utils/styles';

type Props = {
  mapsets: Beatmapset[],
  config: Config,
  link: (mapsetId: number, mapId?: number) => string,
};

const SongsContainer = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr;
  max-width: 500px;
  @media (min-width: 800px) {
    grid-template-columns: 1fr 1fr;
    max-width: 1000px;
  }
  justify-content: center;
  margin: 0 var(--s);
`;

const SetLink = styled(MainBox)`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  color: black;
  display: flex;
  box-sizing: border-box;
  &:hover { color: black; }
`;

const DiffsContainer = styled.div`
  width: 100%;
  z-index: 1;
`;

const Diff = styled(SubBox)`
  display: block;
  width: 100%;
  padding: 1px var(--s);
  & + & { margin-top: var(--xs); }
  box-sizing: border-box;
  color: black;
  transition: var(--tt-short);
  z-index: 1;
  &:hover {
    background-color: var(--clr-secondary-light);
    color: black;
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
  color: black;
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
    <SongsContainer>
      {mapsets?.map((mapset) => {
        const {yt_id, preview_point, owner, beatmaps} = mapset;
        return (
          <SongBox key={mapset.id}>
            <HoverContainer>
              <SetLink as={Link} to={link(mapset.id)}>
                <YTThumbnail yt_id={yt_id} width={120} height={90} />
                <Info>
                  <Line size='1.25em' as='h2'>{getTitle(mapset, config)}</Line>
                  <Line size='1em'>by {getArtist(mapset, config)}</Line>
                  <Line size='0.8em'>mapped by {owner.name}</Line>
                  <Line size='0.8em'>{beatmaps.length} difficult{beatmaps.length !== 1 ? 'ies' : 'y'}</Line>
                </Info>
              </SetLink>
              <DiffsContainer>
                {beatmaps.map((map) => 
                  <Diff as={Link} to={link(mapset.id, map.id)} key={map.id}>
                    {map.diffname}
                  </Diff>
                )}
              </DiffsContainer>
            </HoverContainer>
          </SongBox>
        );
      })}
    </SongsContainer>
  );
}

export default MapsetList;

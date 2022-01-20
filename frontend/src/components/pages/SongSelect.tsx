import React, { useEffect, useState }  from "react";
import { Navigate } from "react-router-dom";

import YTThumbnail from "@/components/modules/YTThumbnail";

import { get, post } from "@/utils/functions";
import { User, Beatmapset } from "@/utils/types";

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox, SubBox, Link, Line } from '@/utils/styles';

type Props = {
  user: User | null,
  volume: number,
};

const SongsContainer = styled.div`
  display: grid;
  @media (min-width: 760px) {
    grid-template-columns: repeat(2, 1fr);
  }
  justify-content: center;
  max-width: 1000px;
  margin: 0 var(--s);
`;

const HoverContainer = styled(MainBox)`
  background-color: var(--clr-primary-light);
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  padding-top: calc(90px + 2*var(--s));
  box-sizing: border-box;
  display: flex;
  z-index: -1;
  animation: fadeIn var(--tt-long);
  @keyframes fadeIn {
    from {
      background-color: var(--clr-primary);
      opacity: 0;
      height: 90px;
    }
  }
`;

const Diff = styled(SubBox)`
  display: block;
  width: 100%;
  padding: 1px var(--s);
  & + & { margin-top: var(--xs); }
  box-sizing: border-box;
  color: black;
  transition: var(--tt-short);
  &:hover {
    background-color: var(--clr-secondary-light);
    color: black;
  }
`;

const SongBox = styled(MainBox)`
  height: 90px;
  max-width: 480px;
  min-width: 360px;
  margin: var(--s);
  box-sizing: content-box;
  display: flex;
  color: black;
  position: relative;
  & > ${HoverContainer} { display: none; }
  &:hover, &:focus {
    color: black;
    & > ${HoverContainer} { display: block; }
    z-index: 1;
  }
`;

const Info = styled.div`
  margin-left: var(--s);
  min-width: 0;
`;

const SongSelect = ({ user, volume } : Props) => {
  if (!user) { // include this in every restricted page
    return <Navigate to='/login' replace={true} />
  }

  const [mapsets, setMapsets] = useState<Beatmapset[]>();
  
  useEffect(() => {
    get("/api/beatmapsets").then((res) => {
      const beatmapsets = res.beatmapsets;
      if (beatmapsets && beatmapsets.length) {
        setMapsets(beatmapsets);
      }
    });
  }, []);
  
  return (
    <>
      <h1>Song Select</h1>
      <SongsContainer>
        {mapsets?.map((mapset) => {
          const {artist, title, artist_original, title_original, yt_id, preview_point, owner, beatmaps} = mapset;
          return (
            <SongBox 
              as={Link} 
              to={`/play/${mapset.id}`} 
              key={mapset.id}
            >
              <YTThumbnail yt_id={yt_id} width={120} height={90} />
              <Info>
                <Line size='1.25em' as='h2'>{title}</Line>
                <Line size='1em'>by {artist}</Line>
                <Line size='0.8em'>mapped by {owner.name}</Line>
                <Line size='0.8em'>{beatmaps.length} difficult{beatmaps.length !== 1 ? 'ies' : 'y'}</Line>
              </Info>
              <HoverContainer>
                {beatmaps.map((map) => 
                  <Diff as={Link} to={`/play/${mapset.id}/${map.id}`}>
                    {map.diffname}
                  </Diff>
                )}
              </HoverContainer>
            </SongBox>
          );
        })}
      </SongsContainer>
    </>
  );
}

export default SongSelect;

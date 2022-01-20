import React, { useEffect, useState }  from "react";
import { Navigate } from "react-router-dom";

import YTThumbnail from "@/components/modules/YTThumbnail";

import { get, post } from "@/utils/functions";
import { User, Beatmapset } from "@/utils/types";

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox, Link, Line } from '@/utils/styles';

type Props = {
  user: User | null,
  volume: number,
};

const SongsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 1000px;
  margin: 0 var(--s);
`;

const SongBox = styled(MainBox)`
  height: 90px;
  max-width: 480px;
  min-width: 360px;
  flex-basis: 360px;
  flex-grow: 1;
  flex-shrink: 0;
  margin: var(--s);
  box-sizing: content-box;
  display: flex;
  color: black;
  transition: 0.1454s;
  &:hover {
    color: black;
    background-color: var(--clr-primary-light);
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
      console.log(res)
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
          // TODO: display info about diffs
          console.log(mapset)
          return (
            <SongBox as={Link} to={`/play/${mapset.id}/${beatmaps[0].id}`} key={mapset.id}>
              <YTThumbnail yt_id={yt_id} width={120} height={90} />
              <Info>
                <Line size='1.25em' as='h2'>{title}</Line>
                <Line size='1em'>by {artist}</Line>
                <Line size='0.8em'>mapped by {owner.name}</Line>
                <Line size='0.8em'>{beatmaps.length} diffs</Line>
              </Info>
            </SongBox>
          );
        })}
      </SongsContainer>
    </>
  );
}

export default SongSelect;

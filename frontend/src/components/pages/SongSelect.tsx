import React, { useEffect, useState }  from "react";
import { Navigate } from "react-router-dom";

import { get, post } from "@/utils/functions";
import { User, Beatmap } from "@/utils/types";

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox, Link } from '@/utils/styles';

type Props = {
  user: User,
  volume: number,
  setVolume: React.Dispatch<React.SetStateAction<number>>,
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

const Thumbnail = styled.img`
  width: 120px;
  height: 90px;
`;

const Info = styled.div`
  margin-left: var(--s);
  min-width: 0;
`;

const Line = styled.span<{size: string}>`
  max-width: 100%;
  font-size: ${(props) => props.size};
  margin: 0;
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const SongSelect = ({ user, volume, setVolume } : Props) => {
  if (!user) { // include this in every restricted page
    return <Navigate to='/login' replace={true} />
  }

  const [maps, setMaps] = useState<Beatmap[]>();
  
  useEffect(() => {
    get("/api/beatmaps").then((res) => {
      const beatmaps = res.beatmaps;
      if (beatmaps && beatmaps.length) {
        setMaps(beatmaps);
      }
    });
  }, []);
  
  return (
    <>
      <h1>Song Select</h1>
      <SongsContainer>
        {maps?.map((map) => 
          <SongBox as={Link} to={`/play/${map.id}`} key={map.id}>
            <Thumbnail src={`http://img.youtube.com/vi/${map.yt_id}/default.jpg`} />
            <Info>
              <Line size='20px' as='h2'>{map.title}</Line>
              <Line size='16px'>by {map.artist}</Line>
              <Line size='14px'>mapped by Erik Demaine</Line>
              <Line size='14px'>727 thumbs up</Line>
            </Info>
          </SongBox>
        )}
      </SongsContainer>
    </>
  );
}

export default SongSelect;

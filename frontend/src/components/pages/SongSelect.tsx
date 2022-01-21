import React, { useEffect, useState }  from "react";
import { Navigate } from "react-router-dom";

import MapsetList from "@/components/modules/MapsetList";

import { get, post } from "@/utils/functions";
import { User, Config, Beatmapset } from "@/utils/types";

import styled from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

type Props = {
  user: User | null,
  config: Config,
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

const SongSelect = ({ user, config } : Props) => {
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
        {mapsets ? <MapsetList mapsets={mapsets} config={config} /> : null}
      </SongsContainer>
    </>
  );
}

export default SongSelect;

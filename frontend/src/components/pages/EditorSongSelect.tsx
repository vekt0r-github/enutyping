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

const EditorSongSelect = ({ user, config } : Props) => {
  if (!user) { // include this in every restricted page
    return <Navigate to='/login' replace={true} />
  }

  const [mapsets, setMapsets] = useState<Beatmapset[]>();
  
  useEffect(() => {
    get("/api/beatmapsets").then((res) => {
      // this route shouldn't exist yet
      const beatmapsets = res.beatmapsets;
      if (beatmapsets && beatmapsets.length) {
        setMapsets(beatmapsets);
      }
    });
  }, []);
  
  return (
    <>
      <h1>My Beatmapsets</h1>
      {mapsets ? <MapsetList 
        mapsets={mapsets}
        config={config} 
        link={(mapsetId, mapId) => `/edit/${mapsetId}/${mapId??''}`}
      /> : null}
    </>
  );
}

export default EditorSongSelect;

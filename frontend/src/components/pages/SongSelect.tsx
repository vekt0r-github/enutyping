import React, { useEffect, useState }  from "react";

import MapsetList from "@/components/modules/MapsetList";

import { get, post } from "@/utils/functions";
import { User, Config, Beatmapset } from "@/utils/types";

import styled from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

type Props = {
  config: Config,
};

const SongSelect = ({ config } : Props) => {
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
      {mapsets ? <MapsetList mapsets={mapsets} config={config} /> : null}
    </>
  );
}

export default SongSelect;

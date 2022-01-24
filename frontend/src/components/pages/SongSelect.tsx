import React, { useEffect, useState }  from "react";

import MapsetList from "@/components/modules/MapsetList";
import Loading from "@/components/modules/Loading";

import { get } from "@/utils/functions";
import { Config, Beatmapset } from "@/utils/types";

import styled from 'styled-components';
import '@/utils/styles.css';
import { SearchBar, SongsContainer } from '@/utils/styles';

type Props = {
  config: Config,
};

const SongSelect = ({ config } : Props) => {
  const [mapsets, setMapsets] = useState<Beatmapset[]>();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredMapsets = mapsets?.filter((set: Beatmapset) => {  
    const lowercaseQuery = searchQuery.toLowerCase();
    return JSON.stringify(set).toLowerCase().includes(lowercaseQuery);
  });
  
  useEffect(() => {
    get("/api/beatmapsets").then((res) => {
      const beatmapsets = res.beatmapsets;
      if (beatmapsets && beatmapsets.length) {
        setMapsets(beatmapsets);
      } else {
        setMapsets([]);
      }
    });
  }, []);
  
  return (
    <>
      <h1>Song Select</h1>
      <SearchBar value={searchQuery} placeholder={"Search for a mapset:"} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} />
      <SongsContainer>
        {(filteredMapsets === undefined) ? <Loading /> :
          <MapsetList 
            mapsets={filteredMapsets} 
            config={config} 
            link={(mapsetId, mapId) => `/play/${mapsetId}/${mapId??''}`} 
          />}
      </SongsContainer>
    </>
  );
}

export default SongSelect;

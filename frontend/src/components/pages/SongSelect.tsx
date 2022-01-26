import React, { useEffect, useState }  from "react";

import MapsetList from "@/components/modules/MapsetList";
import Loading from "@/components/modules/Loading";

import { get } from "@/utils/functions";
import { Config, Beatmapset, Beatmap, BeatmapMetadata } from "@/utils/types";

import styled from 'styled-components';
import '@/utils/styles.css';
import { SearchBar, SongsContainer } from '@/utils/styles';

const SearchContainer = styled.div`
  display: flex;
	flex-direction: row;
	justify-content: center;
  align-items: center;
  min-width: 100%;
`;

type Props = {
  config: Config,
};

const SongSelect = ({ config } : Props) => {
  const [mapsets, setMapsets] = useState<Beatmapset[]>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [KPMUpperBound, setKPMUpperBound] = useState<number>();

  const filteredMapsets = mapsets?.filter((set: Beatmapset) => {  
    const lowercaseQuery = searchQuery.toLowerCase();
    return JSON.stringify(set).toLowerCase().includes(lowercaseQuery);
  }).filter((set: Beatmapset) => {
    return KPMUpperBound ? set.beatmaps.some((b: Beatmap | BeatmapMetadata) => (b.kpm && b.kpm < KPMUpperBound)) : true;
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
      <SearchContainer>
				<SearchBar value={searchQuery} placeholder={"Search for a mapset:"} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} />
        <span><b>Filter: KPM {"<"}</b></span>
        <input type="number" value={KPMUpperBound} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKPMUpperBound(e.target.value ? parseInt(e.target.value) : undefined)}/>
      </SearchContainer>
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

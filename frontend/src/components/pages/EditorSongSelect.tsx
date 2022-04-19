import React, { useEffect, useState }  from "react";
import { Navigate } from "react-router-dom";

import MapsetList from "@/components/modules/MapsetList";
import Loading from "@/components/modules/Loading";

import { get, post } from "@/utils/functions";
import { User, Config, Beatmapset, BeatmapMetadata } from "@/utils/types";
import { SortFuncs } from "@/components/pages/SongSelect";
import { withLabel } from "@/utils/componentutils";

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox, Link, Line, BlackLine, SearchBar, SearchContainer, SongsContainer } from '@/utils/styles';

type Props = {
  user: User | null,
  config: Config,
};

const NewMapset = styled(MainBox)`
  background-color: var(--clr-create);
  height: 90px;
  min-width: 360px;
  max-width: 480px;
  margin: var(--s);
  box-sizing: content-box;
  display: flex;
  justify-content: center;
  align-items: center;
  color: black;
  position: relative;
  transition: var(--tt-short);
  &:hover, &:focus {
    background-color: var(--clr-create-light);
    color: black;
  }
`;

const EditorSongSelect = ({ user, config } : Props) => {
  if (!user) { // include this in every restricted page
    return <Navigate to='/login' replace={true} />
  }

  const [mapsets, setMapsets] = useState<Beatmapset[]>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortLabel, setSortLabel] = useState<string>("Date Created");
  const [sortReverse, setSortReverse] = useState<boolean>(true);
  let sortFunc = SortFuncs[sortLabel];
  if (sortReverse) sortFunc = sortFunc.reverse();

  // Scuffed code 2

  const newDiff = () => ({
    id: "new",
    diffname: "Create New Difficulty",
    kpm: 0
  });

  const filteredMapsets = mapsets?.filter((set: Beatmapset) => {  
    const lowercaseQuery = searchQuery.toLowerCase();
    return JSON.stringify(set).toLowerCase().includes(lowercaseQuery);
  }).map((set: Beatmapset) => ({ ...set,
    beatmaps: [ ...set.beatmaps,
      newDiff(),
    ],
  }));

  filteredMapsets?.sort(sortFunc);

  const getBeatmapsets = () => {
    get("/api/beatmapsets", { search: user.id }).then((res) => {
      const beatmapsets = res.beatmapsets;
      if (beatmapsets && beatmapsets.length) {
        setMapsets(beatmapsets);
      } else {
        setMapsets([]);
      }
    });
  };

  useEffect(() => {
    getBeatmapsets();
  }, []);
  
  return (
    <>
      <h1>My Beatmapsets</h1>
      <SearchContainer>
        <SearchBar value={searchQuery} placeholder={"Search for a mapset:"} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} />
        {withLabel(<select onChange={(e) => setSortLabel(e.target.value)}>
          {Object.keys(SortFuncs).filter(x => x !== "Creator").map(k => <option value={k}>{k}</option>)}
        </select>, "song-select-sort", "Sort by:")}
        {withLabel(<input type="checkbox" checked={sortReverse} onChange={(e) => setSortReverse(e.target.checked)}></input>, 
          "song-select-reverse", "Reverse?")}
      </SearchContainer>
      <SongsContainer>
        {(filteredMapsets === undefined) ? <Loading /> :
          <>
            <NewMapset as={Link} to='/edit/new'>
              <Line size="6em" margin="-5px 20px 0 0">+</Line>
              <BlackLine as="h2" size="1.5em">Create New Mapset</BlackLine>
            </NewMapset>
            <MapsetList 
              getBeatmapsets={getBeatmapsets}
              mapsets={filteredMapsets} 
              config={config} 
              link={(mapsetId, mapId) => `/edit/${mapsetId}/${mapId??''}`} 
            />
          </>}
      </SongsContainer>
    </>
  );
}

export default EditorSongSelect;

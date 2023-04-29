import React, { useEffect, useState }  from "react";
import { Navigate } from "react-router-dom";

import MapsetList from "@/components/modules/MapsetList";
import Loading from "@/components/modules/Loading";

import { getL10nFunc } from '@/providers/l10n';
import { Config } from "@/providers/config";

import { get, post } from "@/utils/functions";
import { User, Beatmapset, BeatmapMetadata } from "@/utils/types";
import { sortFuncs } from "@/components/pages/SongSelect";
import { withLabel } from "@/utils/componentutils";

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox, Link, Line, BlackLine, SearchBar, SearchContainer, SongsContainer } from '@/utils/styles';

type Props = {
  user: User | null,
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

const editorSortFuncs = {
  "menu-sorting-date": sortFuncs["menu-sorting-date"],
  "menu-sorting-length": sortFuncs["menu-sorting-length"],
  "menu-sorting-name": sortFuncs["menu-sorting-name"],
}
const defaultSort = "menu-sorting-date";

const EditorSongSelect = ({ user } : Props) => {
  if (!user) { // include this in every restricted page
    return <Navigate to='/login' replace={true} />
  }
  const text = getL10nFunc();

  const [mapsets, setMapsets] = useState<Beatmapset[]>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortLabel, setSortLabel] = useState<keyof typeof sortFuncs>(defaultSort);
  const [sortReverse, setSortReverse] = useState<boolean>(true);
  let sortFunc = sortFuncs[sortLabel];
  if (sortReverse) sortFunc = sortFunc.reverse();

  // Scuffed code 2

  // const newDiff = () : BeatmapMetadata => ({
  //   id: "new",
  //   artist: ;
  //   title: ;
  //   artist_original: ;
  //   title_original: ;
  //   yt_id: '';
  //   source?: ; // created from yt_id on backend
  //   preview_point: ;
  //   duration: ;
  //   diffname: "Create new beatmap in this group",
  //   kpm: 0
  // });

  const filteredMapsets = mapsets?.filter((set: Beatmapset) => {  
    const lowercaseQuery = searchQuery.toLowerCase();
    return JSON.stringify(set).toLowerCase().includes(lowercaseQuery);
  })
  // .map((set: Beatmapset) => ({ ...set,
  //   beatmaps: [ ...set.beatmaps,
  //     newDiff(),
  //   ],
  // }));

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
      <h1>{text(`menu-editor-header`)}</h1>
      <SearchContainer>
        <SearchBar value={searchQuery} placeholder={text(`menu-search-placeholder`)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} />
        {withLabel(<select onChange={(e) => setSortLabel(e.target.value as keyof typeof sortFuncs)}>
          {Object.keys(editorSortFuncs).map(k => <option value={k}>{text(k)}</option>)}
        </select>, "song-select-sort", text("menu-label-sort"))}
        {withLabel(<input type="checkbox" checked={sortReverse} onChange={(e) => setSortReverse(e.target.checked)}></input>, 
          "song-select-reverse", text("menu-label-reverse"))}
      </SearchContainer>
      <SongsContainer>
        {(filteredMapsets === undefined) ? <Loading /> :
          <>
            <NewMapset as={Link} to='/edit/new'>
              <Line size="6em" margin="-5px 20px 0 0">+</Line>
              <BlackLine as="h2" size="1.5em">{text(`menu-mapset-new`)}</BlackLine>
            </NewMapset>
            <MapsetList 
              getBeatmapsets={getBeatmapsets}
              mapsets={filteredMapsets}
              includeCreate={true}
              link={(mapsetId, mapId) => `/edit/${mapsetId}/${mapId??''}`} 
            />
          </>}
      </SongsContainer>
    </>
  );
}

export default EditorSongSelect;

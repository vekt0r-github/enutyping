import React, { useEffect, useState }  from "react";
import { Navigate } from "react-router-dom";

import MapsetList from "@/components/modules/MapsetList";
import Loading from "@/components/modules/Loading";

import { getL10nFunc } from '@/providers/l10n';

import { get } from "@/utils/functions";
import { User, Beatmapset } from "@/utils/types";
import { sortFuncs } from "@/components/pages/SongSelect";
import { withLabel } from "@/utils/componentutils";

import '@/utils/styles.css';
import { SearchBar, SearchContainer, SongsContainer } from '@/utils/styles';

type Props = {
  user: User | null,
};

const editorSortFuncs = {
  "menu-sorting-date": sortFuncs["menu-sorting-date"],
  "menu-sorting-length": sortFuncs["menu-sorting-length"],
  "menu-sorting-name": sortFuncs["menu-sorting-name"],
}
const defaultSort = "menu-sorting-date";

const EditorSongSelect = ({ user } : Props) => {
  const text = getL10nFunc();

  const [mapsets, setMapsets] = useState<Beatmapset[]>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortLabel, setSortLabel] = useState<keyof typeof editorSortFuncs>(defaultSort);
  const [sortReverse, setSortReverse] = useState<boolean>(true);
  let sortFunc = editorSortFuncs[sortLabel];
  if (sortReverse) sortFunc = sortFunc.reverse();

  const filteredMapsets = mapsets?.filter((set: Beatmapset) => {  
    const lowercaseQuery = searchQuery.toLowerCase();
    return JSON.stringify(set).toLowerCase().includes(lowercaseQuery);
  });

  filteredMapsets?.sort(sortFunc);

  const getBeatmapsets = () => {
    get("/api/beatmapsets", { search: user?.id }).then((res) => {
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
  
  if (!user) { // include this in every restricted page
    return <Navigate to='/login' replace={true} />
  }
  return (
    <>
      <h1>{text(`menu-editor-header`)}</h1>
      <SearchContainer>
        <SearchBar value={searchQuery} placeholder={text(`menu-search-placeholder`)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} />
        {withLabel(<select onChange={(e) => setSortLabel(e.target.value as keyof typeof editorSortFuncs)}>
          {Object.keys(editorSortFuncs).map(k => <option value={k}>{text(k)}</option>)}
        </select>, "song-select-sort", text("menu-label-sort"))}
        {withLabel(<input type="checkbox" checked={sortReverse} onChange={(e) => setSortReverse(e.target.checked)}></input>, 
          "song-select-reverse", text("menu-label-reverse"))}
      </SearchContainer>
      <SongsContainer>
        {(filteredMapsets === undefined) ? <Loading /> :
          <MapsetList
            user={user}
            getBeatmapsets={getBeatmapsets}
            mapsets={filteredMapsets}
            includeMapsetCreate={true}
            includeMapCreate={true}
            link={(mapsetId, mapId) => `/edit/${mapsetId}/${mapId??''}`} 
          />}
      </SongsContainer>
    </>
  );
}

export default EditorSongSelect;

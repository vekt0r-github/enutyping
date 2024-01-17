import React, { useEffect, useState }  from "react";

import MapsetList from "@/components/modules/MapsetList";
import Loading from "@/components/modules/Loading";

import { getL10nFunc } from '@/providers/l10n';
import { Config } from "@/providers/config";

import { get } from "@/utils/functions";
import { Beatmapset, Beatmap, BeatmapMetadata } from "@/utils/types";
import { withLabel } from "@/utils/componentutils";
import { getSetAvg } from "@/utils/beatmaputils";

import styled from 'styled-components';
import '@/utils/styles.css';
import { SearchBar, SearchContainer, SongsContainer } from '@/utils/styles';

const KPMInput = styled.input`
  width: 60px;
`;

type Props = {};

interface SortFunc {
  (a: Beatmapset, b: Beatmapset): number
  reverse(): SortFunc
}
const makeSortFunc = (f: (a: Beatmapset, b: Beatmapset) => number): SortFunc => {
  const sf = f as SortFunc;
  sf.reverse = () => makeSortFunc((a, b) => -f(a, b));
  return sf
}

const makeSortFuncForProp = (f: (set: Beatmapset) => string): SortFunc => {
  return makeSortFunc((a, b) => {
    const [pa, pb] = [f(a), f(b)].map(s => s.toLowerCase());
    return +(pa > pb) || -(pb > pa)
  });
}

export const sortFuncs = {
  // TODO: need ability to break apart collections in sorting
  ["menu-sorting-date"]: makeSortFunc((a, b) => a.id - b.id),
  ["menu-sorting-length"]: makeSortFunc((a, b) => getSetAvg(a, 'duration') - getSetAvg(b, 'duration')),
  ["menu-sorting-name"]: makeSortFuncForProp(set => set.name),
  ["menu-sorting-owner"]: makeSortFuncForProp(set => set.owner.name),
}
const defaultSort = "menu-sorting-date";

const SongSelect = ({} : Props) => {
  const text = getL10nFunc();
  
  const [mapsets, setMapsets] = useState<Beatmapset[]>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [KPMUpperBound, setKPMUpperBound] = useState<number>();
  const [sortLabel, setSortLabel] = useState<keyof typeof sortFuncs>(defaultSort);
  const [sortReverse, setSortReverse] = useState<boolean>(true);
  let sortFunc = sortFuncs[sortLabel];
  if (sortReverse) sortFunc = sortFunc.reverse();

  const filteredMapsets = mapsets?.filter((set: Beatmapset) => {  
    const lowercaseQuery = searchQuery.toLowerCase();
    return JSON.stringify(set).toLowerCase().includes(lowercaseQuery);
  }).filter((set: Beatmapset) => {
    return KPMUpperBound ? set.beatmaps.some((b: BeatmapMetadata) => (b.kpm && b.kpm < KPMUpperBound)) : true;
  });

  filteredMapsets?.sort(sortFunc);

  const getBeatmapsets = () => {
    get("/api/beatmapsets").then((res) => {
      const beatmapsets = res.beatmapsets;
      if (beatmapsets && beatmapsets.length) {
        setMapsets(beatmapsets);
      } else {
        setMapsets([]);
      }
    });
  }

  useEffect(() => {
    getBeatmapsets();
  }, []);
  
  return (
    <>
      <h1>{text(`menu-header`)}</h1>
      <SearchContainer>
				<SearchBar value={searchQuery} placeholder={text(`menu-search-placeholder`)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} />
        {withLabel(<KPMInput type="number" value={KPMUpperBound} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKPMUpperBound(e.target.value ? parseInt(e.target.value) : undefined)}/>,
          "song-select-filter", text("menu-label-filter"))}
        {withLabel(<select onChange={(e) => setSortLabel(e.target.value as keyof typeof sortFuncs)}>
          {Object.keys(sortFuncs).map(k => <option value={k}>{text(k)}</option>)}
        </select>, "song-select-sort", text("menu-label-sort"))}
        {withLabel(<input type="checkbox" checked={sortReverse} onChange={(e) => setSortReverse(e.target.checked)}></input>, 
          "song-select-reverse", text("menu-label-reverse"))}
      </SearchContainer>
      <SongsContainer>
        {(filteredMapsets === undefined) ? <Loading /> :
          <MapsetList 
            getBeatmapsets={getBeatmapsets}
            mapsets={filteredMapsets}
            includeMapCreate={false}
            includeMapsetCreate={false}
            link={(mapsetId, mapId) => `/play/${mapsetId}/${mapId??''}`} 
          />}
      </SongsContainer>
    </>
  );
}

export default SongSelect;

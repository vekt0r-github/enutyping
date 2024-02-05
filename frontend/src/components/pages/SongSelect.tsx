import React, { useEffect, useState, useMemo }  from "react";
import { Navigate, useNavigate } from "react-router-dom";

import MapList from "@/components/modules/MapList";
import MapsetList from "@/components/modules/MapsetList";
import Loading from "@/components/modules/Loading";

import { getL10nFunc } from '@/providers/l10n';
import { Config } from "@/providers/config";

import { get } from "@/utils/functions";
import { User, Beatmapset, Beatmap, BeatmapMetadata } from "@/utils/types";
import { withLabel } from "@/utils/componentutils";
import { getSetAvg } from "@/utils/beatmaputils";

import styled from 'styled-components';
import '@/utils/styles.css';
import { NeutralButton, Link } from "@/utils/styles";

const KPMInput = styled.input`
  width: 60px;
`;

export const MapsetsContainer = styled.div`
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

const MapsContainer = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  max-width: 1000px;
  justify-content: center;
  margin: 0 var(--s);
`;

const SettingsContainer = styled.div`
  display: flex;
	flex-direction: column;
  align-items: center;
  margin: var(--m) 0;
`;

const SettingsRow = styled.div`
  display: flex;
	flex-direction: row;
	justify-content: center;
  align-items: center;
  min-width: 600px;
  margin: 0 0 var(--s) 0;
`;

const SearchBar = styled.input`
  font-size: 18px;
  min-width: 360px;
  max-width: 500px;
`;

type Props = {
  user: User | null,
  isEditor: boolean,
  groupMapsets: boolean,
};

interface SortFunc<T> {
  (a: T, b: T): number
  reverse(): SortFunc<T>
  editorAllowed: boolean
}
const makeSortFunc = <T,>(f: (a: T, b: T) => number, editorAllowed: boolean): SortFunc<T> => {
  const sf = f as SortFunc<T>;
  sf.reverse = () => makeSortFunc((a, b) => -f(a, b), sf.editorAllowed);
  sf.editorAllowed = editorAllowed;
  return sf
}

const makeSortFuncForProp = <T,>(f: (set: T) => string, editorAllowed: boolean): SortFunc<T> => {
  return makeSortFunc((a, b) => {
    const [pa, pb] = [f(a), f(b)].map(s => s.toLowerCase());
    return +(pa > pb) || -(pb > pa);
  }, editorAllowed);
}

export const beatmapSortFuncs = {
  ["menu-sorting-map-date"]: makeSortFunc<Beatmap>((a, b) => a.id - b.id, true),
  ["menu-sorting-map-length"]: makeSortFunc<Beatmap>((a, b) => a.duration - b.duration, true),
  ["menu-sorting-map-title"]: makeSortFuncForProp<Beatmap>(map => map.title, true),
  ["menu-sorting-map-artist"]: makeSortFuncForProp<Beatmap>(map => map.artist, true),
  ["menu-sorting-map-owner"]: makeSortFuncForProp<Beatmap>(map => map.owner.name, false),
}
export const mapsetSortFuncs = {
  ["menu-sorting-mapset-date"]: makeSortFunc<Beatmapset>((a, b) => a.id - b.id, true),
  ["menu-sorting-mapset-length"]: makeSortFunc<Beatmapset>((a, b) => getSetAvg(a, 'duration') - getSetAvg(b, 'duration'), true),
  ["menu-sorting-mapset-name"]: makeSortFuncForProp<Beatmapset>(set => set.name, true),
  ["menu-sorting-mapset-owner"]: makeSortFuncForProp<Beatmapset>(set => set.owner.name, false),
}
const defaultBeatmapSort = "menu-sorting-map-date";
const defaultMapsetSort = "menu-sorting-mapset-date";

const SongSelect = ({user, isEditor, groupMapsets} : Props) => {
  const text = getL10nFunc();
  const navigate = useNavigate();
  
  const [beatmaps, setBeatmaps] = useState<Beatmap[]>();
  const [mapsets, setMapsets] = useState<Beatmapset[]>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [KPMUpperBound, setKPMUpperBound] = useState<number>();
  const [mapsetSortLabel, setMapsetSortLabel] = useState<keyof typeof mapsetSortFuncs>(defaultMapsetSort);
  const [beatmapSortLabel, setBeatmapSortLabel] = useState<keyof typeof beatmapSortFuncs>(defaultBeatmapSort);
  const [sortReverse, setSortReverse] = useState<boolean>(true);

  const filteredMapsets = useMemo(() => {
    let sortFunc = mapsetSortFuncs[mapsetSortLabel];
    if (sortReverse) sortFunc = sortFunc.reverse();

    return mapsets?.filter((set: Beatmapset) => {  
      const lowercaseQuery = searchQuery.toLowerCase();
      return JSON.stringify(set).toLowerCase().includes(lowercaseQuery);
    }).filter((set: Beatmapset) => {
      return KPMUpperBound ? set.beatmaps.some((b: BeatmapMetadata) => (b.kpm && b.kpm < KPMUpperBound)) : true;
    }).sort(sortFunc);
  }, [mapsetSortLabel, sortReverse, mapsets, searchQuery, KPMUpperBound])

  const filteredBeatmaps = useMemo(() => {
    let sortFunc = beatmapSortFuncs[beatmapSortLabel];
    if (sortReverse) sortFunc = sortFunc.reverse();

    return beatmaps?.filter((map: Beatmap) => {  
      const lowercaseQuery = searchQuery.toLowerCase();
      return JSON.stringify(map).toLowerCase().includes(lowercaseQuery);
    }).filter((map: Beatmap) => {
      return KPMUpperBound ? (map.kpm && map.kpm < KPMUpperBound) : true;
    }).sort(sortFunc);
  }, [beatmapSortLabel, sortReverse, beatmaps, searchQuery, KPMUpperBound])

  const getBeatmaps = () => {
    const params = isEditor ? { search: user?.id } : {};
    get("/api/beatmaps", params).then((res) => {
      const beatmaps = res.beatmaps;
      if (beatmaps && beatmaps.length) {
        setBeatmaps(beatmaps);
      } else {
        setBeatmaps([]);
      }
    });
  }

  const getBeatmapsets = () => {
    const params = isEditor ? { search: user?.id } : {};
    get("/api/beatmapsets", params).then((res) => {
      const beatmapsets = res.beatmapsets;
      if (beatmapsets && beatmapsets.length) {
        setMapsets(beatmapsets);
      } else {
        setMapsets([]);
      }
    });
  }

  useEffect(() => {
    getBeatmaps();
    getBeatmapsets();
  }, [isEditor]);

  const makeNavigateTarget = (isEditor: boolean, groupMapsets: boolean) =>
    `/${isEditor ? 'edit' : 'play'}${groupMapsets ? '/collection' : ''}`;
  
  if (isEditor && !user) { // include this in every restricted page
    return <Navigate to='/login' replace={true} />
  }
  return (
    <>
      <h1>{isEditor ? text(`menu-editor-header`) : text(`menu-header`)}</h1>
      <SettingsContainer>
        <SettingsRow>
          <SearchBar value={searchQuery} placeholder={text(`menu-search-placeholder`)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} />
          {withLabel(<KPMInput type="number" value={KPMUpperBound} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKPMUpperBound(e.target.value ? parseInt(e.target.value) : undefined)}/>,
            "song-select-filter", text("menu-label-filter"))}
        </SettingsRow>
        <SettingsRow>
          {withLabel(
            <select onChange={(e) => { groupMapsets
              ? setMapsetSortLabel(e.target.value as keyof typeof mapsetSortFuncs)
              : setBeatmapSortLabel(e.target.value as keyof typeof beatmapSortFuncs)
            }}>
              {Object.entries(groupMapsets ? mapsetSortFuncs : beatmapSortFuncs)
                .filter(([_,v]) => !isEditor || v.editorAllowed)
                .map(([k,_]) => <option key={k} value={k}>{text(k)}</option>)}
            </select>,
            "song-select-sort", text("menu-label-sort"))}
          {withLabel(<input type="checkbox" checked={sortReverse} onChange={(e) => setSortReverse(e.target.checked)}></input>, 
            "song-select-reverse", text("menu-label-reverse"))}
        </SettingsRow>
        <SettingsRow>
          <NeutralButton as={Link} to={makeNavigateTarget(isEditor, !groupMapsets)}>
            {groupMapsets ? text('menu-hide-collections') : text('menu-show-collections')}
          </NeutralButton>
        </SettingsRow>
      </SettingsContainer>
      { groupMapsets ?
      <MapsetsContainer>
        {(filteredMapsets === undefined) ? <Loading /> :
          <MapsetList 
            getBeatmapsets={getBeatmapsets}
            mapsets={filteredMapsets}
            includeMapCreate={isEditor}
            includeMapsetCreate={isEditor}
            link={(mapsetId, mapId) => {
              if (isEditor && mapId === "new") return `/edit/${mapId}?collection=${mapsetId}`;
              const base = isEditor ? 'edit' : 'play';
              return mapId === undefined ? `/${base}/collection/${mapsetId}` : `/${base}/${mapId}`;
            }} 
          />}
      </MapsetsContainer>
        :
      <MapsContainer>
        {(filteredBeatmaps === undefined) ? <Loading /> :
          <MapList 
            getBeatmaps={getBeatmaps}
            beatmaps={filteredBeatmaps}
            includeMapCreate={isEditor}
            link={(mapId) => `/${isEditor ? 'edit' : 'play'}/${mapId}`} 
          />}
      </MapsContainer>
      }
    </>
  );
}

export default SongSelect;

import React, { useEffect, useState }  from "react";
import { Navigate, useParams, useLocation } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import NotFound from "@/components/pages/NotFound";
import YTThumbnail from "@/components/modules/YTThumbnail";
import {MapInfoDisplay, MapsetInfoDisplay} from "@/components/modules/InfoDisplay";

import { get } from "@/utils/functions";
import { Config, Beatmapset, BeatmapMetadata } from "@/utils/types";
import { getArtist, getTitle } from "@/utils/beatmaputils"
import { withParamsAsKey } from "@/utils/componentutils";

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox, Line, Link, Sidebar, GamePageContainer, Thumbnail } from '@/utils/styles';

import { GameContainer, BottomHalf, StatBox, Overlay as GameOverlay } from "@/components/modules/GameAreaDisplay";

type Props = {
  config: Config,
};

export const Overlay = styled(GameOverlay)`
  padding: var(--m) 0;
  justify-content: flex-start;
  & > ${Line} {
    font-style: normal;
  }
`;

export const DiffsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
`;

export const Diff = styled(MainBox)`
  max-width: 300px;
  height: 68px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: var(--tt-short);
  padding: var(--s) var(--l);
  margin: var(--m);
  border-radius: var(--m);
  &:hover, &:focus {
    background-color: var(--clr-primary-light);
  }
`;

const StyledThumbnail = (base: Parameters<typeof styled>[0]) => styled(base)`
  position: absolute;
  z-index: 1;
`;
const MainYTThumbnail = StyledThumbnail(YTThumbnail);
const MainThumbnail = Thumbnail;

const DiffSelect = ({ config } : Props) => {
  const [goback, setGoback] = useState<boolean>(false);

  const { mapsetId } = useParams();
  
  useEffect(() => {
    get(`/api/beatmapsets/${mapsetId}`).then((beatmapset) => {
      if (!beatmapset || !beatmapset.id) {
        setMapset(null); // mapset not found
      }
      setMapset(beatmapset);
    }).catch(() => {
      setMapset(null);
    });
  }, []);

  const onKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setGoback(true);
    }
  };
  
  useEffect(() => {
    document.addEventListener("keydown", onKeyPress);
    return () => {
      document.removeEventListener("keydown", onKeyPress);
    }
  }, []); // may eventually depend on other things

  const [mapset, setMapset] = useState<Beatmapset | null>();
  const [selectedMap, setSelectedMap] = useState<BeatmapMetadata>();
  if (mapset === undefined) { return <Loading />; }
  if (mapset === null) { return <NotFound />; }
  const {name, icon_url, owner, beatmaps} = mapset;
  const [artist, title] = selectedMap ?
    [getArtist(selectedMap, config), getTitle(selectedMap, config)] : [undefined, undefined];
  
  if (goback) {
    return <Navigate to={`/play`} replace={true} />;
  }
  
  return (
    <>
      <Line as="h1" size="2em">{name}</Line>
      <Line as="p" margin="0 0 0.5em 0">Collection created by <Link to={`/user/${owner.id}`}>{owner.name}</Link></Line>
      <GamePageContainer>
        <Sidebar>
          <MapsetInfoDisplay {...mapset} />
          <p>{mapset.description}</p>
        </Sidebar>
        <GameContainer>
          <BottomHalf>
            <StatBox />
            {selectedMap 
            ? <MainYTThumbnail yt_id={selectedMap?.yt_id ?? ''} width={400} height={300} />
            : <MainThumbnail src={icon_url} width={400} height={300} />
            }
            <StatBox />
          </BottomHalf>
          <Overlay>
            <Line as="h2" size="1.5em" margin="1.5em 0">Select Beatmap:</Line>
            <DiffsContainer>
              {beatmaps.map((map) => 
                <Diff
                  as={Link}
                  to={`/play/${mapset.id}/${map.id}`}
                  key={map.id}
                  tabindex={0}
                  onMouseEnter={() => setSelectedMap(map)}
                  onFocus={() => setSelectedMap(map)}
                  onMouseLeave={() => setSelectedMap(undefined)}
                  onFocusOut={() => setSelectedMap(undefined)}
                >
                  <YTThumbnail yt_id={map.yt_id} width={32} height={24} />
                  <Line as="p" size="1em" margin="0">{getArtist(map, config)} - {getTitle(map, config)} [{map.diffname}]</Line>
                  <Line as="p" size="1em" margin="0">({Math.round(map.kpm ?? 0)} kpm)</Line>
                </Diff>
              )}
            </DiffsContainer>
          </Overlay>
        </GameContainer>
        <Sidebar>
          {selectedMap ? <MapInfoDisplay {...selectedMap} /> : null}
        </Sidebar>
      </GamePageContainer>
    </>
  );
}

export default withParamsAsKey(DiffSelect);

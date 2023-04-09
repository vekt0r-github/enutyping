import React, { useEffect, useState }  from "react";
import { Navigate, useParams, useLocation } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import NotFound from "@/components/pages/NotFound";
import YTThumbnail from "@/components/modules/YTThumbnail";
import MapInfoDisplay from "@/components/modules/MapInfoDisplay";

import { get } from "@/utils/functions";
import { Config, Beatmapset, BeatmapMetadata } from "@/utils/types";
import { getArtist, getTitle } from "@/utils/beatmaputils"
import { withParamsAsKey } from "@/utils/componentutils";

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox, Line, Link, Sidebar, GamePageContainer } from '@/utils/styles';

import { GameContainer, BottomHalf, StatBox, Overlay as GameOverlay } from "@/components/modules/GameAreaDisplay";

type Props = {
  config: Config,
};

const Overlay = styled(GameOverlay)`
  padding: var(--m) 0;
  justify-content: flex-start;
  & > ${Line} {
    font-style: normal;
  }
`;

const DiffsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
`;

const Diff = styled(MainBox)`
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

const MainThumbnail = styled(YTThumbnail)`
  position: absolute;
  z-index: 1;
`;

const DiffSelect = ({ config } : Props) => {
  const [goback, setGoback] = useState<boolean>(false);

  const { mapsetId } = useParams();
  
  useEffect(() => {
    get(`/api/beatmapsets/${mapsetId}`).then((beatmapset) => {
      if (!beatmapset || !beatmapset.id) {
        setMapset(null); // mapset not found
      }
      setMapset(beatmapset);
      setSelectedMap(beatmapset.beatmaps[0]);
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
  const {name, owner, beatmaps} = mapset;
  const [artist, title] = selectedMap ?
    [getArtist(selectedMap, config), getTitle(selectedMap, config)] : [undefined, undefined];
  
  if (goback) {
    return <Navigate to={`/play`} replace={true} />;
  }
  
  return (
    <>
      <h1>{name}</h1>
      <GamePageContainer>
        <Sidebar>
          <MapInfoDisplay 
            title={title ?? ''}
            artist={artist ?? ''}
            source={selectedMap?.source ?? ''}
          />
        </Sidebar>
        <GameContainer>
          <BottomHalf>
            <StatBox />
            <MainThumbnail yt_id={selectedMap?.yt_id ?? ''} width={400} height={300} />
            <StatBox />
          </BottomHalf>
          <Overlay>
            <Line as="p" size="1em">Collection created by {owner.name}</Line>
            <Line as="h2" size="1.5em" margin="1.5em 0">Select Beatmap:</Line>
            <DiffsContainer>
              {beatmaps.map((map) => 
                <Diff
                  as={Link}
                  to={`/play/${mapset.id}/${map.id}`}
                  key={map.id}
                  onMouseEnter={() => setSelectedMap(map)}
                  onFocus={() => setSelectedMap(map)}
                >
                  <YTThumbnail yt_id={map.yt_id} width={32} height={24} />
                  <Line as="p" size="1em">{getArtist(map, config)} - {getTitle(map, config)} [{map.diffname}]</Line>
                  <Line as="p" size="1em">({Math.round(map.kpm ?? 0)} kpm)</Line>
                </Diff>
              )}
            </DiffsContainer>
          </Overlay>
        </GameContainer>
        <Sidebar>
          <p>{mapset.description}</p>
        </Sidebar>
      </GamePageContainer>
    </>
  );
}

export default withParamsAsKey(DiffSelect);

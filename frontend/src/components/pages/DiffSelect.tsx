import React, { useEffect, useState }  from "react";
import { Navigate, useParams, useLocation } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import NotFound from "@/components/pages/NotFound";
import YTThumbnail from "@/components/modules/YTThumbnail";

import { get } from "@/utils/functions";
import { Config, Beatmapset } from "@/utils/types";
import { getArtist, getTitle } from "@/utils/beatmaputils"

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox, Line, Link } from '@/utils/styles';

import { Sidebar, PageContainer } from "@/components/pages/Game";
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
  color: black;
  transition: var(--tt-short);
  padding: var(--m) var(--l);
  margin: var(--m);
  border-radius: var(--m);
  &:hover, &:focus {
    color: black;
    background-color: var(--clr-primary-light);
  }
`;

const Thumbnail = styled(YTThumbnail)`
  position: absolute;
  z-index: 1;
`;

const DiffSelect = ({ config } : Props) => {
  const [goback, setGoback] = useState<boolean>(false);

  const { mapsetId } = useParams();
  const { pathname } = useLocation();
  const base = pathname.split("/").filter(s => s)[0];
  
  useEffect(() => {
    get(`/api/beatmapsets/${mapsetId}`).then((beatmapset) => {
      if (!beatmapset || !beatmapset.id) {
        setMapset(null); // mapset not found
      }
      setMapset(beatmapset);
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
  if (mapset === undefined) { return <Loading />; }
  if (mapset === null) { return <NotFound />; }
  const {yt_id, source, preview_point, owner, beatmaps} = mapset;
  const [artist, title] = [getArtist(mapset, config), getTitle(mapset, config)];
  
  if (goback) {
    return <Navigate to={`/${base}`} replace={true} />;
  }
  
  return (
    <>
      <h1>{(base === "edit") && "Editing: "}{artist} - {title}</h1>
      <PageContainer>
        <Sidebar>
          <h2>Map info and stats etc.</h2>
          <Line>Title: {title}</Line>
          <Line>Artist: {artist}</Line>
          <Line>Map ID: </Line>
          <Line>Set ID: {mapset.id}</Line>
          <Line>Source: {source}</Line>
        </Sidebar>
        <GameContainer>
          <BottomHalf>
            <StatBox />
            <Thumbnail yt_id={yt_id} width={400} height={300} />
            <StatBox />
          </BottomHalf>
          <Overlay>
            <Line as="h2" size="1.5em" margin="1.5em 0">Select Difficulty:</Line>
            <DiffsContainer>
              {beatmaps.map((map) => 
                <Diff as={Link} to={`/${base}/${mapset.id}/${map.id}`} key={map.id}>
                  {map.diffname}
                </Diff>
              )}
            </DiffsContainer>
          </Overlay>
        </GameContainer>
        <Sidebar>
          <h2>Is this still leaderboard</h2>
          <Line>i have no fucking clue what goes here</Line>
        </Sidebar>
      </PageContainer>
    </>
  );
}

export default DiffSelect;

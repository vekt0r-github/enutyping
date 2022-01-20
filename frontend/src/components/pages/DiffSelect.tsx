import React, { useEffect, useState }  from "react";
import { Navigate, useParams } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import NotFound from "@/components/pages/NotFound";
import GameVideo from "@/components/modules/GameVideo";

import { get } from "@/utils/functions";
import { User, Beatmapset } from "@/utils/types";

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox, Line, Link } from '@/utils/styles';

import { Sidebar, PageContainer } from "@/components/pages/Game";
import { Status, GameContainer, BottomHalf, StatBox, Overlay as GameOverlay } from "@/components/modules/GameArea";

type Props = {
  user: User | null,
};

const Overlay = styled(GameOverlay)`
  padding: 0;
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
  transition: 0.0727s;
  padding: var(--m);
  margin: var(--m);
  border-radius: var(--m);
  &:hover, &:focus {
    color: black;
    background-color: var(--clr-primary-light);
  }
`;

const DiffSelect = ({ user } : Props) => {
  if (!user) { // include this in every restricted page
    return <Navigate to='/login' replace={true} />
  }

  const [goback, setGoback] = useState<boolean>(false);

  const { mapsetId } = useParams();
  
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
  }, [status]); // may eventually depend on other things

  const [mapset, setMapset] = useState<Beatmapset | null>();
  if (mapset === undefined) { return <Loading />; }
  if (mapset === null) { return <NotFound />; }
  const {artist, title, artist_original, title_original, yt_id, source, preview_point, owner, beatmaps} = mapset;
  
  if (goback) {
    return <Navigate to={`/play`} replace={true} />;
  }
  
  return (
    <>
      <h1>{artist} - {title}</h1>
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
            <GameVideo
              yt_id={mapset.yt_id}
              status={Status.UNSTARTED}
              startGame={() => {}}
              volume={0}
            />
            <StatBox />
          </BottomHalf>
          <Overlay>
            <Line as="h2" size="1.5em" margin="1em 0">Select Difficulty:</Line>
            <DiffsContainer>
              {beatmaps.map((map) => 
                <Diff as={Link} to={`/play/${mapset.id}/${map.id}`}>
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

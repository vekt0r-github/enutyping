import React, { useEffect, useState }  from "react";
import { Navigate, useParams } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import GameArea from "@/components/modules/GameArea";

import { get } from "@/utils/functions";
import { User, Beatmap } from "@/utils/types";

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox } from '@/utils/styles';

type Props = {
  user: User,
  volume: number,
  setVolume: React.Dispatch<React.SetStateAction<number>>,
};

const PageContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
`;

const Game = ({ user, volume, setVolume } : Props) => {
  if (!user) { // include this in every restricted page
    return <Navigate to='/login' replace={true} />
  }

  const { mapId } = useParams();

  const [map, setMap] = useState<Beatmap>();
  
  useEffect(() => {
    get(`/api/beatmaps/${mapId}`).then((beatmap) => {
      if (beatmap && beatmap.id) {
        setMap(beatmap);
      }
    });
  }, []);

  if (!map) { return <Loading />; }
  
  return (
    <>
      <h1>{map.artist} - {map.title}</h1>
      <PageContainer>
        <MainBox>
          <h2>Map info and stats etc.</h2>
          <p>{map.artist} - {map.title}</p>
          <p>ID: {map.id}</p>
          <p>Source: {map.source}</p>
        </MainBox>
        <GameArea
          user={user}
          beatmap={map}
          volume={volume}
          setVolume={setVolume}
        />
        <MainBox>
          <h2>Leaderboard</h2>
          <ul>
            { map?.scores?.map((score) =>
              // XXX: hmm is this okay to be optional?
              <li>{score.user?.name}: {score.score}</li>
            )}
          </ul>
        </MainBox>
      </PageContainer>
    </>
  );
}

export default Game;

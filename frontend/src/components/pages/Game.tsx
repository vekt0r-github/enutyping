import React, { useEffect, useState }  from "react";
import { Navigate, useParams } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import GameArea from "@/components/modules/GameArea";

import { get } from "@/utils/functions";
import { User, Beatmap, LineData } from "@/utils/types";

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox, Line } from '@/utils/styles';

type Props = {
  user: User,
  volume: number,
};

const Sidebar = styled(MainBox)`
  min-width: 300px;
  max-width: 400px;
  height: var(--game-height);
  flex-basis: 300px;
  flex-grow: 1;
  flex-shrink: 0;
  box-sizing: content-box;
  margin: 0 var(--s);
`;

const PageContainer = styled.div`
  width: 100%;
  min-width: var(--game-width);
  display: flex;
  flex-direction: row;
  justify-content: center;
  @media (max-width: 1496px) { // 800 + 2*(300+2*3*8)
    width: calc(var(--game-width) + 4*var(--s));
    flex-wrap: wrap;
    & ${Sidebar} {
      order: 1;
      margin-top: var(--s);
    }
  }
`;

/**
 * process beatmap "file", mutating the object
 * @param beatmap 
 * @returns void
 */
const processBeatmap = (beatmap : Beatmap & {content: string}) => {
  let lines : LineData[] = [];
  if (!beatmap.content) { return null; } // idk man
  const objects = beatmap.content.split(/\r?\n/);
  let line : LineData;
  objects.forEach((obj_str) => {
    const obj = obj_str.split(',');
    const type = obj[0];
    const time = parseInt(obj[1]);
    const text = obj.slice(2).join(',');
    
    if (line && ['L','E'].includes(type)) {
      line.endTime = time;
      lines.push(line);
    }
    if (type === 'L') {
      line = {
        startTime: time,
        endTime: 0, // set when line ends
        lyric: text,
        syllables: [],
      };
    } else if (type === 'S') {
      line.syllables.push({ time, text });
    }
  });
  beatmap.lines = lines;
};

const Game = ({ user, volume } : Props) => {
  if (!user) { // include this in every restricted page
    return <Navigate to='/login' replace={true} />
  }

  const { mapId } = useParams();

  const [map, setMap] = useState<Beatmap>();
  
  useEffect(() => {
    get(`/api/beatmaps/${mapId}`).then((beatmap) => {
      if (beatmap && beatmap.id) {
        processBeatmap(beatmap); // mutates
        setMap(beatmap);
      }
    });
  }, []);

  if (!map) { return <Loading />; }
  
  return (
    <>
      <h1>{map.artist} - {map.title}</h1>
      <PageContainer>
        <Sidebar>
          <h2>Map info and stats etc.</h2>
          <Line>Title: {map.title}</Line>
          <Line>Artist: {map.artist}</Line>
          <Line>ID: {map.id}</Line>
          <Line>Source: {map.source}</Line>
        </Sidebar>
        <GameArea
          user={user}
          beatmap={map}
          volume={volume}
        />
        <Sidebar>
          <h2>Leaderboard</h2>
          <ul>
            { map?.scores?.map((score) =>
              // XXX: hmm is this okay to be optional?
              <li key={score.id}>{score.user?.name}: {score.score}</li>
            )}
          </ul>
        </Sidebar>
      </PageContainer>
    </>
  );
}

export default Game;

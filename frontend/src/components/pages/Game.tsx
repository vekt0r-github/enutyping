import React, { useEffect, useState }  from "react";
import { Navigate, useParams } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import GameArea from "@/components/modules/GameArea";
import NotFound from "@/components/pages/NotFound";

import { get } from "@/utils/functions";
import { User, Config, Beatmap, LineData } from "@/utils/types";

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox, Line } from '@/utils/styles';
import { Link } from "react-router-dom";

type Props = {
  user: User | null,
  config: Config,
};

export const Sidebar = styled(MainBox)`
  min-width: 300px;
  max-width: 400px;
  height: var(--game-height);
  flex-basis: 300px;
  flex-grow: 1;
  flex-shrink: 0;
  box-sizing: content-box;
  margin: 0 var(--s);
`;

export const PageContainer = styled.div`
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

const Game = ({ user, config } : Props) => {
  const { mapId, mapsetId } = useParams();
  
  useEffect(() => {
    get(`/api/beatmaps/${mapId}`).then((beatmap) => {
      if (!beatmap || !beatmap.id || beatmap.beatmapset.id !== mapsetId) {
        setMap(null); // map not found or param is wrong
      }
      processBeatmap(beatmap); // mutates
      setMap(beatmap);
    });
  }, []);

  const [map, setMap] = useState<Beatmap | null>();
  if (map === undefined) { return <Loading />; }
  if (map === null) { return <NotFound />; }
  const {beatmapset, diffname, lines, scores} = map;
  const {artist, title, artist_original, title_original, yt_id, source, preview_point, owner, beatmaps} = beatmapset;
  
  return (
    <>
      <h1>{artist} - {title} [{diffname}]</h1>
      <PageContainer>
        <Sidebar>
          <h2>Map info and stats etc.</h2>
          <Line>Title: {title}</Line>
          <Line>Artist: {artist}</Line>
          <Line>Map ID: {map.id}</Line>
          <Line>Set ID: {beatmapset.id}</Line>
          <Line>Source: {source}</Line>
        </Sidebar>
        <GameArea
          user={user}
          beatmap={map}
          config={config}
        />
        <Sidebar>
          <h2>Leaderboard</h2>
          <ul>
            { map?.scores?.map((score) =>
              // XXX: hmm is this okay to be optional?
              <li key={score.id}>
                <Link to={`/user/${score.user?.id}`}>
                  <img src={score.user?.avatar_url} />
                  {score.user?.name}
                </Link>
                : {score.score}
              </li>
            )}
          </ul>
        </Sidebar>
      </PageContainer>
    </>
  );
}

export default Game;

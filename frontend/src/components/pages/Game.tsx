import React, { useEffect, useState }  from "react";
import { Navigate, useParams } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import GameArea from "@/components/modules/GameArea";
import NotFound from "@/components/pages/NotFound";

import { get } from "@/utils/functions";
import { User, Config, Beatmap } from "@/utils/types";
import { getArtist, getTitle, processBeatmap } from '@/utils/beatmaputils';

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox, Line, Link, SubBox } from '@/utils/styles';

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
  align-items: center;
  @media (max-width: 1496px) { // 800 + 2*(300+2*3*8)
    width: calc(var(--game-width) + 4*var(--s));
    flex-wrap: wrap;
    & ${Sidebar} {
      order: 1;
      margin-top: var(--s);
    }
  }
`;

const LBContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const LBEntry = styled(SubBox)`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	min-width: 80%;
`;

const UserAvatar = styled.img`
	width:30px;
`;

const Game = ({ user, config } : Props) => {
  const { mapId, mapsetId } = useParams();
  
  const refreshBeatmap = () => {
    get(`/api/beatmaps/${mapId}`).then((beatmap) => {
      if (!beatmap || (beatmap.id === undefined) || beatmap.beatmapset.id != mapsetId) {
        setMap(null); // map not found or param is wrong
      } else {
        processBeatmap(beatmap, config); // mutates
        setMap(beatmap);
      }
    });
  };
  useEffect(refreshBeatmap, []);

  const [map, setMap] = useState<Beatmap | null>();
  if (map === undefined) { return <Loading />; }
  if (map === null) { return <NotFound />; }
  const {beatmapset, diffname, lines, scores} = map;
  const {yt_id, source, preview_point, owner, beatmaps} = beatmapset;
  const [artist, title] = [getArtist(beatmapset, config), getTitle(beatmapset, config)];

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
          afterGameEnd={refreshBeatmap}
        />
        <Sidebar>
          <h2>Leaderboard</h2>
					<LBContainer>
						{ map?.scores?.map((score) =>
							// XXX: hmm is this okay to be optional?
							<LBEntry key={score.id}>
								<Link to={`/user/${score.user?.id}`}>
									<UserAvatar src={score.user?.avatar_url} />
								</Link>
								<Link to={`/user/${score.user?.id}`}>
									{score.user?.name + ":"}
								</Link>
								{score.score}
							</LBEntry>
						)}
					</LBContainer>
        </Sidebar>
      </PageContainer>
    </>
  );
}

export default Game;

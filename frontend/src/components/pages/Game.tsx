import React, { useEffect, useState }  from "react";
import { Navigate, useParams } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import GameArea from "@/components/modules/GameArea";
import NotFound from "@/components/pages/NotFound";
import MapInfoDisplay from "@/components/modules/MapInfoDisplay";

import { get } from "@/utils/functions";
import { User, Config, Beatmap } from "@/utils/types";
import { getArtist, getTitle, processBeatmap } from '@/utils/beatmaputils';
import { withParamsAsKey } from "@/utils/componentutils";

import styled from 'styled-components';
import '@/utils/styles.css';
import { 
  Line, Link, SubBox, Sidebar, 
  GamePageContainer, 
} from '@/utils/styles';
import SpeedSelect from "../modules/SpeedSelect";

type Props = {
  user: User | null,
  config: Config,
};

const MAX_NUM_LEADERBOARD = 6;

const LBContainer = styled.div`
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LBEntry = styled(SubBox)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-width: 100%;
	margin: var(--s);
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
    }).catch(() => {
      setMap(null);
    });;
  };
  useEffect(refreshBeatmap, []);

	const [availableSpeeds, setAvailableSpeeds] = useState<number[]>([1]);
	const [speed, setSpeed] = useState<number>(1);

  const [map, setMap] = useState<Beatmap | null>();
  if (map === undefined) { return <Loading />; }
  if (map === null) { return <NotFound />; }
  const {beatmapset, yt_id, source, preview_point, diffname, lines, kpm, scores} = map;
  const {owner, beatmaps} = beatmapset;
  const [artist, title] = map ? [getArtist(map, config), getTitle(map, config)] : [undefined, undefined];


  return (
    <>
      <h1>{artist} - {title} [{diffname}]</h1>
      <GamePageContainer>
        <Sidebar>
          <MapInfoDisplay 
            title={title ?? ''}
            artist={artist ?? ''}
            source={source!}
            diffname={diffname}
            kpm={kpm}
          />
          <SpeedSelect
            speed={speed}
            setSpeed={setSpeed}
            availableSpeeds={availableSpeeds}
          />
        </Sidebar>
        <GameArea
          user={user}
          beatmap={map}
          config={config}
          afterGameEnd={refreshBeatmap}
					speed={speed}
					setAvailableSpeeds={setAvailableSpeeds}
        />
        <Sidebar>
          <h2>Leaderboard</h2>
          <LBContainer>
            { map?.scores?.slice(0, MAX_NUM_LEADERBOARD).map((score) =>
              // XXX: hmm is this okay to be optional?
              <LBEntry key={score.id}>
                <Link to={`/user/${score.user?.id}`}>
                  <UserAvatar src={score.user?.avatar_url} />
                </Link>
                <Link to={`/user/${score.user?.id}`}>
                  {score.user?.name + ":"}
                </Link>
                {`${score.score} pts (${score.speed_modification}x)`}
              </LBEntry>
            )}
          </LBContainer>
        </Sidebar>
      </GamePageContainer>
    </>
  );
}

export default withParamsAsKey(Game);

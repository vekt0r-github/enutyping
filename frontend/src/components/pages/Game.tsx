import React, { useContext, useEffect, useState }  from "react";
import { Navigate, useLocation, useParams, useSearchParams } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import GameArea from "@/components/modules/GameArea";
import NotFound from "@/components/pages/NotFound";
import { MapInfoDisplay } from "@/components/modules/InfoDisplay";

import { getL10nFunc } from '@/providers/l10n';
import { Config, configContext } from "@/providers/config";

import { get, post } from "@/utils/functions";
import { User, Beatmap, getModCombo, ModCombo } from "@/utils/types";
import { getArtist, getTitle, processBeatmap } from '@/utils/beatmaputils';
import { withParamsAsKey } from "@/utils/componentutils";

import styled from 'styled-components';
import '@/utils/styles.css';
import { 
  Line, Link, SubBox, Sidebar, 
  GamePageContainer, NeutralButton, NewButton
} from '@/utils/styles';
import ModSelect from "../modules/ModSelect";
import MapsetSelectPopup from "../modules/MapsetSelectPopup";

type Props = {
  user: User | null,
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

const ActionsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  & a, & button {
    box-sizing: border-box;
    width: 150px;
    /* text-align: center; */
    display: flex;
    justify-content: center;
  }
`;

const Game = ({ user } : Props) => {
  const text = getL10nFunc();
  const config = useContext(configContext);

  const { mapId } = useParams();
  
  const refreshBeatmap = () => {
    get(`/api/beatmaps/${mapId}`).then((beatmap) => {
      if (!beatmap || (beatmap.id === undefined)) {
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
  const [modCombo, setModCombo] = useState<ModCombo>(getModCombo(0));

  const [map, setMap] = useState<Beatmap | null>();
  if (map === undefined) { return <Loading />; }
  if (map === null) { return <NotFound />; }
  const {owner, diffname} = map;
  const [artist, title] = map ? [getArtist(map, config), getTitle(map, config)] : [undefined, undefined];

  const ModSelectComponent = 
    <ModSelect
      speed={speed}
      setSpeed={setSpeed}
      modCombo={modCombo}
      setModCombo={setModCombo}
      availableSpeeds={availableSpeeds}
    />

  return (
    <>
      <h1>{artist} - {title} [{diffname}]</h1>
      <GamePageContainer>
        <Sidebar>
          <MapInfoDisplay {...map} />
          <ActionsContainer>
            {/* TODO: turn Editor example into an "add to collection" */}
            {user && user.id === owner.id ?
              <NeutralButton as={Link} to={`/edit/${mapId}`}>
                {text(`to-editor`)}
              </NeutralButton>
            : null}
          </ActionsContainer>
        </Sidebar>
        <GameArea
          user={user}
          beatmap={map}
          afterGameEnd={refreshBeatmap}
					setAvailableSpeeds={setAvailableSpeeds}
					speed={speed}
          modCombo={modCombo}
          modSelectComponent={ModSelectComponent}
        />
        <Sidebar>
          <h2>{text(`game-leaderboard-header`)}</h2>
          <LBContainer>
            { map?.scores?.slice(0, MAX_NUM_LEADERBOARD).map(({id, user, score, speed_modification, mod_flag}) => {
              // XXX: hmm is this okay to be optional?
              const {hidden} = getModCombo(mod_flag);
              return <LBEntry key={id}>
                <Link to={`/user/${user?.id}`}>
                  <UserAvatar src={user?.avatar_url} />
                </Link>
                <Link to={`/user/${user?.id}`}>
                  {user?.name}
                </Link>
                {text(`game-leaderboard-score`, {
                  score: score,
                  speed: speed_modification,
                  mods: hidden ? ' +HD' : '',
                })}
              </LBEntry>
            })}
          </LBContainer>
        </Sidebar>
      </GamePageContainer>
    </>
  );
}

export default withParamsAsKey(Game);

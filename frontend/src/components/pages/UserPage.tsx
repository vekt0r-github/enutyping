import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import NotFound from "@/components/pages/NotFound";
import Loading from "@/components/modules/Loading";
import { InfoDisplay } from "@/components/modules/InfoDisplay";

import { getL10nFunc, getL10nElementFunc } from "@/providers/l10n";
import { configContext } from "@/providers/config";

import { get } from "@/utils/functions";
import { Beatmap, Score, User, UserStats, getModCombo, rankColors } from "@/utils/types";
import { getArtist, getTitle } from "@/utils/beatmaputils";

import styled from 'styled-components';
import { InfoBox, RankDisplay, SubBox } from '@/utils/styles';
import { withParamsAsKey } from "@/utils/componentutils";
import { getRank } from "@/utils/gameplayutils";

type Props = {
  yourUser: User | null,
};

const StatBox = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 500px;
  justify-content: center;
  border-radius: var(--s);
  padding: var(--s);
  background-color: var(--clr-secondary);
`;

const NameAndProfile = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
`;

const UserAvatar = styled.img`
  width: 150px;
  height: 150px;
  margin: var(--s);
  border-radius: 25%;
`;

const UserBanner = styled.div`
  border-radius: var(--s);
  background-color: var(--clr-primary);
  display: flex;
  margin: var(--s);
  min-width: 900px;
  padding: 1rem;
  margin-top: 2em;
`;

const Scores = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--clr-primary);
  min-width: 900px;
  padding: 1rem;
  align-items: center;
  border-radius: var(--s);
`;

const ScoreBox = styled(SubBox)`
  display: flex;
  flex-direction: row;
  width: 100%;
  padding: var(--s);
  box-sizing: border-box;
  & + & {
    margin-top: var(--s);
  }
`;

const ScoreLeftSide = styled(RankDisplay)`
  width: 50px;
  font-size: 2.4rem;
  margin: 0 4px 0 0;
  text-align: center;
`;

const ScoreRightSide = styled.div`
  /* width: calc(100% - 100px); */
  display: flex;
  flex-grow: 1;
  flex-direction: column;
`;

const ScoreLine = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 2px 0;
`;

const UserInfoDisplay = InfoDisplay("", (stats: UserStats) => [
  // ["Username", user.name],
  ["user-info-join-date", new Date(stats.join_time * 1000).toDateString()],
  ["user-info-key-acc", (stats.key_accuracy * 100).toFixed(2)],
  ["user-info-kana-acc", (stats.kana_accuracy * 100).toFixed(2)],
  ["user-info-play-count", stats.play_count],
  ["user-info-total-score", stats.total_score]
]);

const UserPage = ({ yourUser }: Props) => {
  const text = getL10nFunc();
  const elem = getL10nElementFunc();
  const config = useContext(configContext);

  const { userId } = useParams();
  const [user, setUser] = useState<User | null>();
  const [scores, setScores] = useState<Score[]>([]);
  const [stats, setStats] = useState<UserStats | null>();
  const [scoreBeatmaps, setScoreBeatmaps] = useState<{[map_id: number]: Beatmap}>([]);

  useEffect(() => {
    get(`/api/users/${userId}`).then((res) => {
      if (!res || !res.user) {
        setUser(null);
      } else {
        setUser(res.user);
        setScores(res.scores);
        setStats(res.stats);
      }
    });
  }, [yourUser]);

  useEffect(() => {
    let beatmaps: {[map_id: number]: Beatmap} = {};
    let beatmap_ids: number[] = []; // just to get unique set
    for (const score of scores) {
      if (!beatmap_ids.includes(score.beatmap_id)) beatmap_ids.push(score.beatmap_id);
    }

    Promise.all(beatmap_ids.map(async (beatmap_id: number) => {
      const res = await get(`/api/beatmaps/${beatmap_id}`);
      if (!res)
          console.log("wtf happened");
      else
          beatmaps[beatmap_id] = res;
    })).then(() => setScoreBeatmaps(beatmaps));
  }, [scores]);

  const prettyScore = (scoreInfo: Score, beatmap: Beatmap) => {
    const {score, speed_modification, mod_flag, time_unix, key_accuracy, kana_accuracy} = scoreInfo;
    const {diffname} = beatmap;
    const [artist, title] = [getArtist(beatmap, config), getTitle(beatmap, config)];
    const modCombo = getModCombo(mod_flag);
    const rank = getRank(score, speed_modification, modCombo);

    return (
      <ScoreBox key={scoreInfo.id}>
        <ScoreLeftSide color={rankColors[rank]}>
          {rank}
        </ScoreLeftSide>
        <ScoreRightSide>
          <ScoreLine>
            {elem((<span></span>), `userpage-score-map-display`, {
              elems: {emph: <b></b>},
              vars: {artist, title, diffname},
            })}
            {elem((<span></span>), `userpage-score-score`, {
              elems: {emph: <b></b>},
              vars: {
                score: score,
                speed: speed_modification,
                mods: modCombo.hidden ? 'HD' : '-',
              },
            })}
          </ScoreLine>
          <ScoreLine>
            <span>{text(`userpage-score-date`, {date: new Date(time_unix * 1000).toLocaleString()})}</span>
            {elem((<span></span>), `userpage-score-acc`, {
              elems: {emph: <b></b>},
              vars: {
                keyAcc: (key_accuracy * 100).toFixed(2),
                kanaAcc: (kana_accuracy * 100).toFixed(2),
              },
            })}
          </ScoreLine>
        </ScoreRightSide>
      </ScoreBox>
    );
  };

  if (user === undefined || stats === undefined) {
    return <Loading />;
  }

  if (user === null || stats === null) {
    return <NotFound />;
  }

  return (
    <>
      <UserBanner>
        <NameAndProfile>
          <UserAvatar src={user.avatar_url} />
          <h2 style={{paddingLeft: "0.5em"}}>{user.name}</h2>
        </NameAndProfile>
        <StatBox>
          <UserInfoDisplay {...stats} />
        </StatBox>
      </UserBanner>

      <div>
        <h2>{text(`userpage-section-scores`)}</h2>
        <Scores>
          { (scores && scores.length > 0) ?
            <>
              {scores.map((score, i) =>
                scoreBeatmaps[score.beatmap_id] ? prettyScore(score, scoreBeatmaps[score.beatmap_id]) : null
              )}
            </>
            :
            <p>{text(`userpage-no-scores`)}</p>
          }
        </Scores>
      </div>
    </>
  );
};

export default withParamsAsKey(UserPage);

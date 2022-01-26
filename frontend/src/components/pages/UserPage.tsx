import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { get } from "@/utils/functions";
import { Beatmap, Score, User, UserStats, Config } from "@/utils/types";
import { InfoBox, InfoEntry } from '@/utils/styles';
import { withParamsAsKey } from "@/utils/componentutils";

import styled from 'styled-components';

import Loading from "../modules/Loading";

const StatBox = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 500px;
  justify-content: center;
  border-radius: var(--s);
  padding: 1em;
  background-color: var(--clr-secondary);
`;

const NameAndProfile = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
`;

const UserAvatar = styled.img`
  width: 150px;
  margin: var(--s);
  border-radius: 25%;
`;

const UserBanner = styled.div`
  border-radius: var(--s);
  background-color: var(--clr-primary);
  display: flex;
  margin: var(--s);
  min-width: 1200px;
  padding: 1rem;
  margin-top: 2em;
`;

const Scores = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--clr-primary);
  min-width: 1200px;
  padding: 1rem;
  align-items: center;
  border-radius: var(--s);
`;

type Props = {
  yourUser: User | null,
  config: Config,
};

const UserPage = ({ yourUser, config }: Props) => {
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>();
  const [scores, setScores] = useState<Score[]>([]);
  const [stats, setStats] = useState<UserStats | null>();
  const [scoreBeatmaps, setScoreBeatmaps] = useState<Beatmap[]>([]);


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
    let beatmaps: Beatmap[] = [];
    Promise.all(scores.map(async (score: Score) => {
      const res = await get(`/api/beatmaps/${score.beatmap_id}`);
            if (!res)
                console.log("wtf happened");
            else
                beatmaps.push(res);
    })).then(() => setScoreBeatmaps(beatmaps));
  }, [scores]);


  if (user === undefined || stats === undefined) {
    return (
      <Loading />
    );
  }

  if (user === null || stats === null) {
    return (
      <p>User not found!</p>
    );
  }

  const prettyScore = (score: Score, beatmap: Beatmap) => {
    const [title, artist]: string[] = (config.localizeMetadata) ? [beatmap.beatmapset.title, beatmap.beatmapset.artist] : [beatmap.beatmapset.title_original, beatmap.beatmapset.artist_original]; 
    return (
      <>
        <InfoEntry>
          <span><b>{artist}-{title}</b> [{beatmap.diffname}]</span>
          <span><b>{score.score}</b> points</span>
        </InfoEntry>
        <InfoEntry>
          <span>Played at {new Date(score.time_unix * 1000).toLocaleString()}</span>
          <span><b>{(score.key_accuracy * 100).toFixed(2)}%</b> key, <b>{(score.kana_accuracy * 100).toFixed(2)}%</b> kana</span>
        </InfoEntry>
      </>
    );
  };

  const userInfoPairs = [
    // ["Username", user.name],
    ["Join Date", new Date(stats.join_time * 1000).toDateString()],
    ["Overall Kana Accuracy", (stats.kana_accuracy * 100).toFixed(2)],
    ["Overall Key Accuracy", (stats.key_accuracy * 100).toFixed(2)],
    ["Play Count", stats.play_count],
    ["Total Score", stats.total_score]
  ];

  const userStatsElements = userInfoPairs.map((entry: (string | number)[]) => (
    <InfoEntry key={entry[0]}>
      <span><b>{entry[0]}:</b></span>
      <span>{entry[1]}</span>
    </InfoEntry>
  ));

  return (
    <>
      <UserBanner>
        <NameAndProfile>
          <UserAvatar src={user.avatar_url} />
          <h2>{user.name}</h2>
        </NameAndProfile>
        <StatBox>
            {userStatsElements}
        </StatBox>
      </UserBanner>

      <div>
        <h2>Recent Scores</h2>
        <Scores>
          { (scores && scores.length > 0) ?
            <>
              {scores.map((score, i) =>
                <InfoBox width={100} key={score.id}>
                  {scoreBeatmaps[i] ? prettyScore(score, scoreBeatmaps[i]): "Couldn't load map"} 
                </InfoBox>
              )}
            </>
            :
            <p>No recent plays for this player!</p>
          }
        </Scores>
      </div>
    </>
  );
};

export default withParamsAsKey(UserPage);

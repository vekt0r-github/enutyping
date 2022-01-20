import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { get } from "@/utils/functions";
import { Score, User } from "@/utils/types";
import Loading from "../modules/Loading";


const userPage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>();
  const [scores, setScores] = useState<Score[]>();

  useEffect(() => {
    get(`/api/users/${userId}`).then((res) => {
      if (!res || !res.user) {
        setUser(null);
      } else {
        setUser(res.user);
        setScores(res.scores);
      }
    });
  }, [])

  if (user === undefined) {
    return (
      <Loading />
    );
  }

  if (user === null) {
    return (
      <p>User not found!</p>
    );
  }

  return (
    <>
      <img src={user.avatar_url} />
      <p>This is {user.name} with id {user.id}</p>
      { (scores && scores.length > 0) &&
        <>
          <h2>Recent Scores</h2>
          <ul>
            {scores.map((score) =>
              <li>Beatmap {score.beatmap_id}: Score {score.score}</li>
            )}
          </ul>
        </>
      }
    </>
  );
};

export default userPage;

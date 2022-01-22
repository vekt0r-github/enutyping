import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { get, post } from "@/utils/functions";
import { Score, User } from "@/utils/types";
import Loading from "../modules/Loading";

type Props = {
  yourUser: User | null,
  setYourUser: React.Dispatch<React.SetStateAction<User>>, 
}

const UserPage = ({ yourUser, setYourUser }: Props) => {
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>();
  const [scores, setScores] = useState<Score[]>();

  // Account name change state
  const [requestedName, setRequestedName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    get(`/api/users/${userId}`).then((res) => {
      if (!res || !res.user) {
        setUser(null);
      } else {
        setUser(res.user);
        setScores(res.scores);
      }
    });
  }, [yourUser])

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

  // TODO: Possible refactor but fuck this right now with shared form hooks
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRequestedName(event.target.value);
  }
  const handleSubmit = () => {
    post('/api/me/changename', { requested_name: requestedName }).then((res) => {
      console.log(res);
      if (res.success) {
        setYourUser((old) => {
          return {...old, 'name': requestedName }
        });
        setErrorMessage("");
      } else {
        setErrorMessage("Username was taken! Please choose another one.");
      }
      setRequestedName("");
    })
  }

  const editUser = (
    <>
    { (user && yourUser && user.id == yourUser.id) &&
      <>
        <label>Requested Name:</label>
        <input value={requestedName} onChange={handleChange} />
        <input onClick={handleSubmit} type="button" value="Submit" />
        {errorMessage && <div>{errorMessage}</div>}
      </>
    }
    </>
  );

  return (
    <>
      <img src={user.avatar_url} />
      <p>This is {user.name} with id {user.id}</p>
      { editUser }
      { (scores && scores.length > 0) &&
        <>
          <h2>Recent Scores</h2>
          <ul>
            {scores.map((score) =>
              <li key={score.id}>
                Beatmap {score.beatmap_id}: Score {score.score}
              </li>
            )}
          </ul>
        </>
      }
    </>
  );
};

export default UserPage;

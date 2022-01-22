import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { get, post } from "@/utils/functions";
import { Beatmap, Score, User, Config } from "@/utils/types";
import { MainBox, SubBox } from '@/utils/styles';


import styled from 'styled-components';

import Loading from "../modules/Loading";

const SideBox = styled(MainBox)`
	display: flex;
	flex-direction: column;
	align-items: center;
	margin: var(--s);
	min-width: 50%;
`;

const UserInfoContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: center;
	min-width: 90%;
`;

const ScoreBox = styled(SubBox)`
	display: flex;
	flex-direction: row;
	min-width: 90%;
	margin: var(--s);
	justify-content: space-between;
`;



type Props = {
  yourUser: User | null,
  setYourUser: React.Dispatch<React.SetStateAction<User>>, 
	config: Config,
};

const UserPage = ({ yourUser, setYourUser, config }: Props) => {
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>();
  const [scores, setScores] = useState<Score[]>([]);
	const [scoreBeatmaps, setScoreBeatmaps] = useState<Beatmap[]>([]);

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
    if (!requestedName) {
      setErrorMessage("We don't like blank names! Pick something else.");
      return;
    }
    if (/_(osu|github|google)$/.test(requestedName)) {
      setErrorMessage("You sneaky rat! Pick something else.");
      return;
    }
    post('/api/me/changename', { requested_name: requestedName }).then((res) => {
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
        <form>
          <label>Requested Name: </label>
          <input value={requestedName}
                 onChange={handleChange}
          />
          <input onClick={handleSubmit} type="button" value="Submit" />
          {errorMessage && <div>{errorMessage}</div>}
        </form>
      </>
    }
    </>
  );

	const prettyBeatmap = (beatmap: Beatmap) => {
		const [title, artist]: string[] = (config.localizeMetadata) ? [beatmap.beatmapset.title, beatmap.beatmapset.artist] : [beatmap.beatmapset.title_original, beatmap.beatmapset.artist_original]; 
		return (
			<span><b>{artist + " - " + title}</b>[{beatmap.diffname}]</span>
		);
	};

  return (
    <>
      <img src={user.avatar_url} />
      <p>This is {user.name} with id {user.id}</p>
      { editUser }
			<UserInfoContainer>
				<SideBox>
					<h2>User Statistics</h2>
					<p>Honestly idk what to put here</p>
				</SideBox>
				<SideBox>
					{ (scores && scores.length > 0) &&
						<>
							<h2>Recent Scores</h2>
							{scores.map((score, i) =>
								<ScoreBox key={score.id}>
									<span>{scoreBeatmaps[i] ? prettyBeatmap(scoreBeatmaps[i]): "fuck"}</span> <span>Score {score.score}</span>
								</ScoreBox>
							)}
						</>
					}
				</SideBox>
			</UserInfoContainer>
    </>
  );
};

export default UserPage;

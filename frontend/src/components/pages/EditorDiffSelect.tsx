import React, { useEffect, useState }  from "react";
import { Navigate, useParams } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import YTVideo from "@/components/modules/YTVideo";
import MapInfoDisplay from "@/components/modules/MapInfoDisplay";
import EditorShortcutsDisplay from "@/components/modules/EditorShortcutsDisplay";

import { get, post } from "@/utils/functions";
import { Config, Beatmapset, User } from "@/utils/types";
import { getArtist, getTitle, makeSetFunc } from "@/utils/beatmaputils"
import { withParamsAsKey } from "@/utils/componentutils";

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox, Line, Link, GamePageContainer, Sidebar } from '@/utils/styles';

import { GameContainer, BottomHalf, StatBox, Overlay as GameOverlay } from "@/components/modules/GameAreaDisplay";

type NewSetProps = {
  field: keyof Beatmapset,
  label: string, // Label: stuff
  description?: string,
  active?: boolean,
  setActive?: (active: boolean) => void,
};

const NewSetForm = styled.form`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const NewSetContainer = styled.div`
  margin-bottom: var(--s);
`;

const NewSetSubcontainer = styled.div`
  height: 32px;
  display: flex;
  align-items: center;
`;

const NewSetLabel = styled.label<{size: string}>`
  font-size: ${({size}) => size};
  display: inline-block;
  padding-right: var(--s);
  width: 350px;
  box-sizing: border-box;
  text-align: right;
`;

const NewSetInput = styled.input`
  font-size: 1em;
  font-family: "Open Sans";
  width: 200px;
`;

const NewSetDescription = styled(Line)`
  width: fit-content !important;
  position: relative;
  left: 350px;
`;

const FormWarning = styled(Line)`
  background-color: var(--clr-warn);
  padding: var(--xs) 0;
  font-style: italic !important;
`;

type Props = {
  user: User | null,
  config: Config,
};

enum Status { LOADING, LOADED, INVALID, GOBACK, CREATED_SET };
const { LOADING, LOADED, INVALID, GOBACK, CREATED_SET } = Status;

type State = {
  status: Status,
  mapset: Beatmapset,
}

const Overlay = styled(GameOverlay)`
  padding: var(--m) 0;
  justify-content: flex-start;
  align-items: center;
  & ${Line} {
    font-style: normal;
  }
`;

const DiffsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
`;

const Diff = styled(MainBox)`
  max-width: 400px;
  height: 60px;
  display: flex;
  align-items: center;
  transition: var(--tt-short);
  padding: 0 var(--l);
  margin: var(--m);
  border-radius: var(--m);
  &:hover, &:focus {
    background-color: var(--clr-primary-light);
  }
`;

export const NewDiff = styled(Diff)`
  align-self: center;
  font-size: 1em;
  font-family: "Open Sans";
  border: 0;
  background-color: var(--clr-create);
	color: black;
  cursor: pointer;
  &:hover, &:focus {
    background-color: var(--clr-create-light);
		color: black;
  }
`;

export const DeleteDiff = styled(NewDiff)`
  background-color: var(--red);
  &:hover, &:focus {
    background-color: var(--maroon);
  }
`;

const FormSubmit = styled(NewDiff)`
  margin: var(--m) 0 0 0;
`

const EditorDiffSelect = ({ user, config } : Props) => {
  if (!user) { // include this in every restricted page
    return <Navigate to='/login' replace={true} />
  }


  const [state, setState] = useState<State>({
    status: LOADING,
    mapset: {
      id: -1,
      artist: '',
      title: '',
      artist_original: '',
      title_original: '',
      yt_id: '',
      preview_point: 0, // not set here
      duration: 0, // will be automatically set
      owner: user, // probably doesn't get sent to backend
      beatmaps: [], // not set here
    },
  });
  const {status, mapset} = state;
  const setStatus = makeSetFunc(setState)('status');
  const setMapset = makeSetFunc(setState)('mapset');
  const set = makeSetFunc(setMapset);
  const [artistRoman, setArtistRoman] = useState<boolean>(false);
  const [titleRoman, setTitleRoman] = useState<boolean>(false);
  const [player, setPlayer] = useState<YT.Player>();

  const { mapsetId } = useParams();
  const isNewMapset = (mapsetId === "new");

  const createMapset = () => {
    const {artist, title, artist_original, title_original, yt_id, preview_point} = mapset;
    let duration = (player?.getDuration() ?? 0) * 1000;
    if (!artist || !title || !artist_original || !title_original || !yt_id || !duration) { return; }
    const data = {artist, title, artist_original, title_original, yt_id, preview_point, duration};
    post(`/api/beatmapsets`, data).then((beatmapset) => {
      setState(({mapset}) => ({
        status: CREATED_SET,
        mapset: { ...mapset,
          id: beatmapset.id,
        },
      }));
    })
  };  
  
  useEffect(() => {
    if (!isNewMapset) {
      get(`/api/beatmapsets/${mapsetId}`).then((beatmapset) => {
        if (!beatmapset || !beatmapset.id) {
          setStatus(INVALID); // mapset not found
        } else if (beatmapset.owner.id !== user.id) {
          setStatus(INVALID); // no perms
        } else {
          setMapset(beatmapset);
          setStatus(LOADED);
        }
      }).catch(err => setStatus(INVALID));
    } else {
      setStatus(LOADED);
    }
  }, []);

  const onKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setStatus(GOBACK);
    }
  };
  
  useEffect(() => {
    document.addEventListener("keydown", onKeyPress);
    return () => {
      document.removeEventListener("keydown", onKeyPress);
    }
  }, []); // may eventually depend on other things

  const Invalid = <p>This beatmapset doesn't exist, or you don't have the permissions to edit it. <Link to="/edit/new">Create a new one?</Link></p>;
  if (status === GOBACK) { return <Navigate to={`/edit`} replace={true} />; }
  if (status === INVALID) { return Invalid; }
  if (status === LOADING || !mapset) { return <Loading />; }
  if (status === CREATED_SET) { return <Navigate to={`/edit/${mapset.id}/new`} replace={true} />; }
  const {yt_id, preview_point, owner, beatmaps} = mapset;
  const [artist, title] = [getArtist(mapset, config), getTitle(mapset, config)];

  const formInput = ({field, label, description, active, setActive} : NewSetProps) => {
    const id = field.replace("_", "-");
    const toRoman = (field : keyof Beatmapset) => {
      return field.endsWith("_original") ? (field.substring(0, field.length-9) as keyof Beatmapset) : undefined;
    }
    const roman = toRoman(field);
    const onChange = (field : keyof Beatmapset) => (e : React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      set(field)(value);
      const roman = toRoman(field);
      if (roman && !active) { set(roman)(value) }
    };
    return (
      <NewSetContainer key={id}>
        <NewSetLabel htmlFor={id} size="1.25em">{label}: </NewSetLabel>
        <NewSetInput
          id={id}
          type="text" 
          value={mapset[field] as string}
          onChange={onChange(field)}
        />
        {description ? <NewSetDescription size="0.8em">{description}</NewSetDescription> : null}
        {roman ? <NewSetSubcontainer>
          <NewSetLabel htmlFor={roman} size="1em">Romanized {roman}</NewSetLabel>
          <input type="checkbox" onChange={(e) => {
            setActive!(e.target.checked);
            set(roman)(mapset[field]);
          }}></input>
          {active ? 
            <NewSetInput
              id={roman}
              type="text" 
              value={mapset[roman] as string}
              onChange={onChange(roman)}
            /> : null}
        </NewSetSubcontainer> : null}
      </NewSetContainer>
    );
  }

  const onPlayerReady = (e : YT.PlayerEvent) => {
    setPlayer(e.target);
  };

  return (
    <>
      <h1>Editing: {artist.length ? artist : "<artist>"} - {title.length ? title : "<title>"}</h1>
      <GamePageContainer>
        <Sidebar>
          <MapInfoDisplay 
            title={title}
            artist={artist}
            source={yt_id.length ? `https://www.youtube.com/watch?v=${yt_id}` : ''}
          />
        </Sidebar>
        <GameContainer>
          <BottomHalf>
            <StatBox />
            <YTVideo yt_id={yt_id} volume={0} show={false} options={{onReady: onPlayerReady}} />
            <StatBox />
          </BottomHalf>
          <Overlay>
            {isNewMapset ? <NewSetForm onSubmit={(e : React.FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              createMapset();
            }}>
              <Line as="h2" size="1.5em" margin="0.75em 0 1em 0">Enter Mapset Metadata:</Line>
              {([
                {field: "yt_id", label: "YouTube Video ID", description: "11 character video code"},
                {field: "artist_original", label: "Artist", active: artistRoman, setActive: setArtistRoman},
                {field: "title_original", label: "Title", active: titleRoman, setActive: setTitleRoman},
              ] as NewSetProps[]).map(formInput)}
              <FormWarning size="1em">Make sure your metadata is correct; you can't change it once you've started mapping!</FormWarning>
              <FormSubmit as="button" type="submit">
                <Line size="1em">Create Mapset and Continue</Line>
              </FormSubmit>
            </NewSetForm> : <>
              <Line as="h2" size="1.5em" margin="1.5em 0">Select Difficulty:</Line>
              <DiffsContainer>
                {beatmaps.map((map) => 
                  <Diff as={Link} to={`/edit/${mapset.id}/${map.id}`} key={map.id}>
                    <Line size="1em">{map.diffname}</Line>
                  </Diff>
                )}
                <NewDiff as={Link} to={`/edit/${mapset.id}/new`}>
                  <Line size="3.5em" margin="-3px 12px 0 0" style={{'width': '40px'}}>+</Line>
                  <Line size="1em">Create New Difficulty</Line>
                </NewDiff>
              </DiffsContainer>
            </>}
          </Overlay>
        </GameContainer>
        <EditorShortcutsDisplay />
      </GamePageContainer>
    </>
  );
}

export default withParamsAsKey(EditorDiffSelect);

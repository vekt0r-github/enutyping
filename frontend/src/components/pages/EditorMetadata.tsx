import React, { useEffect, useState }  from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import YTVideo from "@/components/modules/YTVideo";
import { MapInfoDisplay, MapsetInfoDisplay } from "@/components/modules/InfoDisplay";
import EditorShortcutsDisplay from "@/components/modules/EditorShortcutsDisplay";

import { Config } from "@/utils/config";
import { get, httpDelete, post, put } from "@/utils/functions";
import { Beatmapset, User, BeatmapMetadata } from "@/utils/types";
import { getArtist, getTitle, makeSetFunc } from "@/utils/beatmaputils"
import { withParamsAsKey } from "@/utils/componentutils";

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox, Line, Link, GamePageContainer, Sidebar, Button, DeleteButton, NewButton } from '@/utils/styles';

// importing styles
import { GameContainer, BottomHalf, StatBox, Overlay as GameOverlay } from "@/components/modules/GameAreaDisplay";

type NewMapProps = {
  field: keyof BeatmapMetadata,
  label: string, // Label: stuff
  description?: string,
  active?: boolean,
  setActive?: (active: boolean) => void,
};

const NewMapForm = styled.form`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const NewMapContainer = styled.div`
  margin-bottom: var(--s);
`;

const NewMapSubcontainer = styled.div`
  height: 32px;
  display: flex;
  align-items: center;
`;

const NewMapLabel = styled.label<{size: string}>`
  font-size: ${({size}) => size};
  display: inline-block;
  padding-right: var(--s);
  width: 350px;
  box-sizing: border-box;
  text-align: right;
`;

const NewMapInput = styled.input`
  font-size: 1em;
  font-family: "Open Sans";
  width: 200px;
`;

const NewMapDescription = styled(Line)`
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

enum Status { LOADING, LOADED, INVALID, GOBACK, FINISHED };
const { LOADING, LOADED, INVALID, GOBACK, FINISHED } = Status;

type State = {
  status: Status,
  map: BeatmapMetadata,
  mapset?: Beatmapset,
}

const Overlay = styled(GameOverlay)`
  padding: var(--m) 0;
  justify-content: flex-start;
  align-items: center;
  & ${Line} {
    font-style: normal;
  }
`;

const FormSubmit = styled(NewButton)`
  margin: var(--m) 0 0 0;
`

const EditorDiffSelect = ({ user, config } : Props) => {
  if (!user) { // include this in every restricted page
    return <Navigate to='/login' replace={true} />
  }

  const navigate = useNavigate();
  const [state, setState] = useState<State>({
    status: LOADING,
    map: {
      id: -1,
      artist: '',
      title: '',
      artist_original: '',
      title_original: '',
      yt_id: '',
      preview_point: 0, // not set here
      duration: 0, // will be automatically set
      diffname: '',
    },
    mapset: undefined,
  });
  const {status, map, mapset} = state;
  const setStatus = makeSetFunc(setState)('status');
  const setMap = makeSetFunc(setState)('map');
  const setMapset = makeSetFunc(setState)('mapset');
  const set = makeSetFunc(setMap);
  const [artistRoman, setArtistRoman] = useState<boolean>(false);
  const [titleRoman, setTitleRoman] = useState<boolean>(false);
  const [player, setPlayer] = useState<YT.Player>();

  // this component has two paths leading to it!
  // if creating a new map, mapId is undefined
  // if editing an existing map's metadata, it's not
  const { mapsetId, mapId } = useParams();
  const isNewMap = (mapId === undefined);

  const createOrUpdateMap = () => {
    const {artist, title, artist_original, title_original, yt_id, preview_point, diffname} = map;
    let duration = (player?.getDuration() ?? 0) * 1000;
    duration = 150000 // TODO: REMOVE THIS TEMP OFFLINE TESTiNG
    if (!mapset || !artist || !title || !artist_original || !title_original || !yt_id || !duration || !diffname) { return; }
    const data = {
      artist, title, artist_original, title_original, yt_id, preview_point, duration, diffname,
      beatmapset_id: mapset.id,
    };
    const callback = (beatmap : BeatmapMetadata) => {
      setState(({map, mapset}) => ({
        status: FINISHED,
        map: { ...map,
          id: beatmap.id,
        },
        mapset: mapset,
      }));
    }
    if (isNewMap) {
      // add default values for content
      post(`/api/beatmaps`, {
        ...data,
        content: "ishpytoing file format v1\n\n[TimingPoints]\n\n\n[Lines]\n",
      }).then(callback);
    } else {
      put(`/api/beatmaps/${mapId}`, data).then(callback);
    }
  };  
  
  useEffect(() => {
    get(`/api/beatmapsets/${mapsetId}`)
      .then((beatmapset) => {
        if (!beatmapset || !beatmapset.id) {
          throw new Error; // mapset not found
        } else if (beatmapset.owner.id !== user.id) {
          throw new Error; // no perms
        } else {
          setMapset(beatmapset);
        }
      })
      .then(() => {
        if (mapId === undefined) {
          setStatus(LOADED);
          return;
        }
        get(`/api/beatmaps/${mapId}`)
          .then((beatmap) => {
            if (!beatmap || !beatmap.id) {
              throw new Error; // mapset not found
            } else if (beatmap.owner.id !== user.id) {
              throw new Error; // no perms
            } else {
              setMap(beatmap);
              setStatus(LOADED);
            }
          })
      })
      .catch(err => setStatus(INVALID));
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

  const Invalid = <p>This collection doesn't exist, or you don't have the permissions to edit it. <Link to="/edit/new">Create a new one?</Link></p>;
  if (status === GOBACK) { return <Navigate to={`/edit/${mapsetId}`} replace={true} />; }
  if (status === INVALID) { return Invalid; }
  if (status === LOADING || !mapset) { return <Loading />; }
  if (status === FINISHED) { return <Navigate to={`/edit/${mapsetId}/${map.id}`} replace={true} />; }
  const {yt_id, preview_point} = map;
  const [artist, title] = [getArtist(map, config), getTitle(map, config)];

  const formInput = ({field, label, description, active, setActive} : NewMapProps) => {
    const id = field.replace("_", "-");
    const toRoman = (field : keyof BeatmapMetadata) => {
      return field.endsWith("_original") ? (field.substring(0, field.length-9) as keyof BeatmapMetadata) : undefined;
    }
    const roman = toRoman(field);
    const onChange = (field : keyof BeatmapMetadata) => (e : React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      set(field)(value);
      const roman = toRoman(field);
      if (roman && !active) { set(roman)(value) }
    };
    return (
      <NewMapContainer key={id}>
        <NewMapLabel htmlFor={id} size="1.25em">{label}: </NewMapLabel>
        <NewMapInput
          id={id}
          type="text" 
          value={map[field] as string}
          onChange={onChange(field)}
        />
        {description ? <NewMapDescription size="0.8em">{description}</NewMapDescription> : null}
        {roman ? <NewMapSubcontainer>
          <NewMapLabel htmlFor={roman} size="1em">Romanized {roman}</NewMapLabel>
          <input type="checkbox" onChange={(e) => {
            setActive!(e.target.checked);
            set(roman)(map[field]);
          }}></input>
          {active ? 
            <NewMapInput
              id={roman}
              type="text" 
              value={map[roman] as string}
              onChange={onChange(roman)}
            /> : null}
        </NewMapSubcontainer> : null}
      </NewMapContainer>
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
            {...map}
            source={yt_id.length ? `https://www.youtube.com/watch?v=${yt_id}` : ''}
          />
          <MapsetInfoDisplay {...mapset} />
          <p>{mapset.description}</p>
        </Sidebar>
        <GameContainer>
          <BottomHalf>
            <StatBox />
            <YTVideo yt_id={yt_id} volume={0} show={false} options={{onReady: onPlayerReady}} />
            <StatBox />
          </BottomHalf>
          <Overlay>
            <NewMapForm onSubmit={(e : React.FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              createOrUpdateMap();
            }}>
              <Line as="h2" size="1.5em" margin="0.75em 0 1em 0">Map Metadata:</Line>
              {([
                {field: "yt_id", label: "YouTube Video ID", description: "11 character video code"},
                {field: "artist_original", label: "Artist", active: artistRoman, setActive: setArtistRoman},
                {field: "title_original", label: "Title", active: titleRoman, setActive: setTitleRoman},
                {field: "diffname", label: "Description", description: "[TODO] short description"},
              ] as NewMapProps[]).map(formInput)}
              {/* <FormWarning size="1em">Make sure your metadata is correct; you can't change it once you've started mapping!</FormWarning> */}
              <FormSubmit as="button" type="submit">
                <Line size="1em" margin="0">
                  {isNewMap ? `Create Map and Continue` : `Update Map Metadata`}
                </Line>
              </FormSubmit>
            </NewMapForm>
          </Overlay>
        </GameContainer>
        <EditorShortcutsDisplay />
      </GamePageContainer>
    </>
  );
}

export default withParamsAsKey(EditorDiffSelect);

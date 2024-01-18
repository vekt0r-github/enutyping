import React, { useContext, useEffect, useState }  from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import YTVideo from "@/components/modules/YTVideo";
import { MapInfoDisplay, MapsetInfoDisplay } from "@/components/modules/InfoDisplay";
import EditorShortcutsDisplay from "@/components/modules/EditorShortcutsDisplay";
import FormInput from "@/components/modules/FormInput";

import { getL10nFunc, getL10nElementFunc } from '@/providers/l10n';
import { Config, configContext } from "@/providers/config";

import { get, httpDelete, post, put } from "@/utils/functions";
import { Beatmapset, User, BeatmapMetadata } from "@/utils/types";
import { getArtist, getTitle, makeSetFunc } from "@/utils/beatmaputils"
import { withParamsAsKey } from "@/utils/componentutils";

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox, Line, Link, GamePageContainer, Sidebar, Button, DeleteButton, NewButton } from '@/utils/styles';

// importing styles
import { GameContainer, BottomHalf, StatBox, Overlay as GameOverlay } from "@/components/modules/GameAreaDisplay";

const FormWarning = styled(Line)`
  background-color: var(--clr-warn);
  padding: var(--xs) 0;
  font-style: italic !important;
`;

const NewMapForm = styled.form`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

type Props = {
  user: User | null,
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

const EditorMetadata = ({ user } : Props) => {
  const text = getL10nFunc();
  const elem = getL10nElementFunc();
  const config = useContext(configContext);

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
  const { mapId } = useParams();
  const [searchParams, _] = useSearchParams();
  const mapsetId = searchParams.get('collection');
  const isNewMap = (mapId === undefined);

  const createOrUpdateMap = async () => {
    const {artist, title, artist_original, title_original, yt_id, preview_point, diffname} = map;
    const duration = (player?.getDuration() ?? 0) * 1000;
    if (!artist || !title || !artist_original || !title_original || !yt_id || !duration || !diffname) { return; }
    const data = {
      artist, title, artist_original, title_original, yt_id, preview_point, duration, diffname,
      beatmapset_id: mapset?.id,
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
    if (!mapsetId && isNewMap) {
      setStatus(LOADED);
      return;
    }
    if (mapsetId) {
      get(`/api/beatmapsets/${mapsetId}`)
        .then((beatmapset) => {
          if (!beatmapset || !beatmapset.id) {
            throw new Error; // mapset not found
          } else if (beatmapset.owner.id !== user?.id) {
            throw new Error; // no perms
          } else {
            setMapset(beatmapset);
            if (isNewMap) {
              setStatus(LOADED);
            }
          }
        })
        .catch(err => setStatus(INVALID));
    }
    if (!isNewMap) {
      get(`/api/beatmaps/${mapId}`)
        .then((beatmap) => {
          if (!beatmap || !beatmap.id) {
            throw new Error; // map not found
          } else {
            setMap(beatmap);
            setStatus(LOADED);
          }
        })
        .catch(err => setStatus(INVALID));
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

  if (!user) { // include this in every restricted page
    return <Navigate to='/login' replace={true} />
  }
  const Invalid = elem((<p></p>), `invalid-access-map`, {elems: {LinkTo: <Link to="/edit/collection/new" />}});
  if (status === GOBACK) { return <Navigate to={`/edit`} replace={true} />; }
  if (status === INVALID) { return Invalid; }
  if (status === LOADING) { return <Loading />; }
  if (status === FINISHED) { return <Navigate to={`/edit/${map.id}`} replace={true} />; }
  const {yt_id, diffname} = map;
  const [artist, title] = [getArtist(map, config), getTitle(map, config)];

  const onPlayerReady = (e : YT.PlayerEvent) => {
    setPlayer(e.target);
  };

  return (
    <>
      <h1>
        {text(`editor-header`, {
          artist: artist.length ? artist : text(`map-display-default-artist`),
          title: title.length ? title : text(`map-display-default-title`),
          diffname: diffname.length ? diffname : text(`map-display-default-diffname`),
        })}
      </h1>
      <GamePageContainer>
        <Sidebar>
          <MapInfoDisplay 
            {...map}
            source={yt_id.length ? `https://www.youtube.com/watch?v=${yt_id}` : ''}
          />
          {mapset ? <>
            <MapsetInfoDisplay {...mapset} />
            <p>{mapset.description}</p>
          </> : null}
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
              <Line as="h2" size="1.5em" margin="0.75em 0 1em 0">{text(`form-map-header`)}</Line>
              <FormInput obj={map} set={set} field="yt_id" label="form-map-ytid" description="form-map-ytid-desc" />
              <FormInput obj={map} set={set} field="artist_original" label="form-map-artist" active={artistRoman} setActive={setArtistRoman} />
              <FormInput obj={map} set={set} field="title_original" label="form-map-title" active={titleRoman} setActive={setTitleRoman} />
              <FormInput obj={map} set={set} field="diffname" label="form-map-diffname" description="form-map-diffname-desc" />
              <FormWarning size="1em">{text(`form-warning-metadata`)}</FormWarning>
              <FormSubmit as="button" type="submit">
                <Line size="1em" margin="0">
                  {text(`form-map-submit-${isNewMap ? `create` : `update`}`)}
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

export default withParamsAsKey(EditorMetadata);

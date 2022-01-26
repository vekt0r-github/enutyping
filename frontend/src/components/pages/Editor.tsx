import React, { useEffect, useState }  from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import EditorArea from "@/components/modules/EditorArea";
import MapInfoDisplay from "@/components/modules/MapInfoDisplay";
import EditorShortcutsDisplay from "@/components/modules/EditorShortcutsDisplay";

import { get, post, put } from "@/utils/functions";
import { User, Config, Beatmap } from "@/utils/types";
import { getArtist, getTitle, processBeatmap } from '@/utils/beatmaputils';
import { withParamsAsKey } from "@/utils/componentutils";

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox, Line, Sidebar, GamePageContainer, Link } from '@/utils/styles';
import { NewDiff } from "@/components/pages/EditorDiffSelect";

type Props = {
  user: User | null,
  config: Config,
};

enum Status { LOADING, LOADED, SUBMITTING, INVALID, NO_PERMS, CREATED_DIFF };
const { LOADING, LOADED, SUBMITTING, INVALID, NO_PERMS, CREATED_DIFF } = Status;

type BeatmapState = {
  status: Status,
  beatmap?: Beatmap,
};

const GameFile = styled.textarea`
  width: 100%;
  max-width: fill-available;
  height: 450px;
  resize: none;
`;

const DiffName = styled.input`
  width: 170px;
  font-size: 1em;
  font-family: "Open Sans";
`;

const Editor = ({ user, config } : Props) => {
  if (!user) { // include this in every restricted page
    return <Navigate to='/login' replace={true} />
  }

  const { mapId, mapsetId } = useParams();
  const isNewMap = (mapId === "new");
  const [searchParams] = useSearchParams();
  const copyOf = searchParams.get('copy');

  const [state, setState] = useState<BeatmapState>({ status: LOADING });
  const processAndLoad = (beatmap : (oldBeatmap?: Beatmap) => Beatmap | undefined) => {
    setState((oldState) => {
      const newBeatmap = beatmap(oldState.beatmap);
      newBeatmap && processBeatmap(newBeatmap, config); // mutates
      return { status: LOADED, beatmap: newBeatmap }
    });
  };
  const {status, beatmap} = state;

  const saveBeatmap = () => {
    setState((state) => ({...state, status: SUBMITTING}))
  }
  
  useEffect(() => {
    if (state.status !== SUBMITTING) { return; }
    if (!beatmap) { return; }
    if (!beatmap.content.length || !beatmap.diffname.length) { return; }
    if (isNewMap) {
      const data = {
        beatmapset_id: mapsetId,
        diffname: diffname,
        kpm: kpm,
        content: beatmap.content,
      }
      post('/api/beatmaps', data)
        .then((beatmapRes) => {
          setState({
            status: CREATED_DIFF, 
            beatmap: { ...beatmap, id: beatmapRes.id}
          });
        })
        .catch((err) => console.log(err));
    } else {
      const data = {
        diffname: diffname,
        content: beatmap.content,
      }
      put(`/api/beatmaps/${mapId}`, data)
        .then(() => {
          // do something to indicate map is saved
        })
        .catch((err) => console.log(err));
    }
  }, [state]);
  
  useEffect(() => {
    if (!isNewMap || copyOf) { // load existing diff
      const loadMapId = isNewMap ? copyOf : mapId;
      get(`/api/beatmaps/${loadMapId}`).then((beatmap) => {
        if (!beatmap || !beatmap.id || beatmap.beatmapset.id != mapsetId) {
          setState({ status: INVALID }); // map not found or param is wrong
        } else if (beatmap.beatmapset.owner.id !== user.id) {
          setState({ status: NO_PERMS }); // user doesn't own mapset
        } else {
          if (isNewMap) {
            beatmap = { ...beatmap,
              id: -1,
              diffname: "",
            };
          }
          processAndLoad(() => beatmap);
        }
      }).catch((err) => {
        setState({ status: INVALID }); // map not found or param is wrong
      });
    } else { // create actual new diff
      get(`/api/beatmapsets/${mapsetId}`).then((beatmapset) => {
        if (!beatmapset || !beatmapset.id) {
          setState({ status: INVALID }); // mapset not found
        } else if (beatmapset.owner.id !== user.id) {
          setState({ status: NO_PERMS }); // user doesn't own mapset
        } else {
          processAndLoad(() => ({
            id: -1,
            beatmapset: beatmapset,
            diffname: "",
            content: "ishpytoing file format v1\n\n[TimingPoints]\n\n\n[Lines]\n",
            timingPoints: [],
            lines: [],
          }));
        }
      }).catch((err) => {
        setState({ status: INVALID }); // map not found or param is wrong
      });
    }
  }, []);

  useEffect(() => {
    if (!beatmap) { return; }
    processBeatmap(beatmap, config);
  }, [beatmap?.content]);

  const Invalid = <p>This beatmap doesn't exist, or you don't have the permissions to edit it. <Link to="/edit/new">Create a new one?</Link></p>;
  if (status === LOADING) { return <Loading />; }
  if (status === CREATED_DIFF) { return <Navigate to={`/edit/${mapsetId}/${beatmap!.id}`} />; }
  if (status === NO_PERMS) { return Invalid; }
  if (status === INVALID || !beatmap) { return Invalid; }
  const {beatmapset, content, diffname, lines, kpm, scores} = beatmap;
  const {yt_id, source, preview_point, owner, beatmaps} = beatmapset;
  const [artist, title] = [getArtist(beatmapset, config), getTitle(beatmapset, config)];
  
  const setContent = (content : string) => 
    processAndLoad((oldBeatmap) => oldBeatmap ? { ...oldBeatmap,
      content: content,
    } : undefined);
  const setDiffname = (diffname : string) => 
    processAndLoad((oldBeatmap) => oldBeatmap ? { ...oldBeatmap,
      diffname: diffname,
    } : undefined);

  return (
    <>
      <h1>Editing: {artist} - {title} [{diffname}]</h1>
      <GamePageContainer>
        <Sidebar>
          <MapInfoDisplay 
            title={title}
            artist={artist}
            source={source!}
            diffname={
              <DiffName
                value={diffname}
                onChange={(e : React.ChangeEvent<HTMLInputElement>) => {
                  setDiffname(e.target.value);
                }}
              />}
            kpm={kpm}
          />
          {!isNewMap ? <NewDiff as={Link} to={`/edit/${mapsetId}/new?copy=${mapId}`}>
            <Line size="3.5em" margin="-3px 12px 0 0" style={{'width': '40px'}}>+</Line>
            <Line size="1em">Create a Copy</Line>
          </NewDiff> : null}
        </Sidebar>
        <EditorArea
          user={user}
          beatmap={beatmap}
          setContent={setContent}
          saveBeatmap={saveBeatmap}
          config={config}
        />
        <EditorShortcutsDisplay />
        {/* <Sidebar as="form" onSubmit={(e : React.FormEvent<HTMLFormElement>) => {
            saveBeatmap();
            e.preventDefault();
          }}>
          <h2>Beatmap File</h2>
          <GameFile value={content} readOnly={true} />
          <button type='submit'>SUbSMIT</button>
        </Sidebar> */}
      </GamePageContainer>
    </>
  );
}

export default withParamsAsKey(Editor);

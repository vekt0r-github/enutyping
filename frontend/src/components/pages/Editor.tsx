import React, { useEffect, useState }  from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import EditorArea from "@/components/modules/EditorArea";
import {MapInfoDisplay} from "@/components/modules/InfoDisplay";
import EditorShortcutsDisplay from "@/components/modules/EditorShortcutsDisplay";
import ConfirmPopup from "@/components/modules/ConfirmPopup";

import { get, post, put, httpDelete } from "@/utils/functions";
import { User, Config, Beatmap } from "@/utils/types";
import { getArtist, getTitle, processBeatmap } from '@/utils/beatmaputils';
import { withParamsAsKey } from "@/utils/componentutils";

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox, Line, Sidebar, GamePageContainer, Link, NewButton, DeleteButton } from '@/utils/styles';

type Props = {
  user: User | null,
  config: Config,
};

enum Status { LOADING, LOADED, SUBMITTING, INVALID, NO_PERMS, CREATED_DIFF };
const { LOADING, LOADED, SUBMITTING, INVALID, NO_PERMS, CREATED_DIFF } = Status;

type BeatmapState = {
  status: Status,
  beatmap?: Beatmap,
  lastSavedBeatmap?: Beatmap,
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

  // TODO: button to edit metadata

  const navigate = useNavigate();
  const { mapId, mapsetId } = useParams();
  const [searchParams] = useSearchParams();
  const copyOf = searchParams.get('copy');

  const [state, setState] = useState<BeatmapState>({ status: LOADING });
  /**
   * applies beatmapTransform to state and updates lastSavedBeatmap
   * @param beatmapTransform function from old beatmap state to new
   * @param saved whether map has just been saved to database
   */
  const processAndLoad = (beatmapTransform : (oldBeatmap?: Beatmap) => Beatmap | undefined, saved = false) => {
    setState((oldState) => {
      const newBeatmap = beatmapTransform(oldState.beatmap);
      let newBeatmapCopy : Beatmap | undefined;
      if (saved) { newBeatmapCopy = newBeatmap && {...newBeatmap}; }
      newBeatmap && processBeatmap(newBeatmap, config); // mutates
      console.log(newBeatmap)
      return { status: LOADED, beatmap: newBeatmap, lastSavedBeatmap: newBeatmapCopy ?? oldState.lastSavedBeatmap };
    });
  };
  const {status, beatmap, lastSavedBeatmap} = state;

  const saveBeatmap = () => {
    setState((state) => ({...state, status: SUBMITTING}))
  }

  const handleDeleteBeatmap = async () => {
    setState((state) => ({...state, status: LOADING}))
    const res = await httpDelete(`/api/beatmaps/${mapId}`) 
    if (res && res.success && res.beatmapset_id) {
      navigate(`/edit/${res.beatmapset_id}`)
    }
  };
  
  // handle saving map when status is "SUBMITTING"
  useEffect(() => {
    if (state.status !== SUBMITTING) { return; }
    if (!beatmap) { return; }
    if (!beatmap.content.length || !beatmap.diffname.length) { return; }
    const data = {
      diffname: diffname,
      kpm: kpm,
      content: beatmap.content,
    }
    put(`/api/beatmaps/${mapId}`, data)
      .then((beatmapRes) => {
        // do something to indicate map is saved
        // unsure whether should use current state value or returned value
        processAndLoad((beatmap) => beatmap, true);
      })
      .catch((err) => console.log(err));
  }, [state]);
  
  // handle loading map
  useEffect(() => {
    get(`/api/beatmaps/${mapId}`).then((beatmap) => {
      if (!beatmap || !beatmap.id || beatmap.beatmapset.id != mapsetId) {
        setState({ status: INVALID }); // map not found or param is wrong
      } else if (beatmap.beatmapset.owner.id !== user.id) {
        setState({ status: NO_PERMS }); // user doesn't own mapset
      } else {
        processAndLoad(() => beatmap, true);
      }
    }).catch((err) => {
      setState({ status: INVALID }); // map not found or param is wrong
    });
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
  const {beatmapset, yt_id, source, preview_point, content, diffname, lines, kpm, scores} = beatmap;
  const [artist, title] = [getArtist(beatmap, config), getTitle(beatmap, config)];
  
  const setContent = (content : string, saved = false) => 
    processAndLoad((oldBeatmap) => oldBeatmap ? { ...oldBeatmap,
      content: content,
    } : undefined, saved);
  const setDiffname = (diffname : string) => {
    
    processAndLoad((oldBeatmap) => oldBeatmap ? { ...oldBeatmap,
      diffname: diffname,
    } : undefined);
  }

  return (
    <>
      <h1>Editing: {artist} - {title} [{diffname}]</h1>
      <GamePageContainer>
        <Sidebar>
          <MapInfoDisplay 
            {...beatmap}
          />
          <p>
            Change diffname:
            <DiffName
              value={diffname}
              onChange={(e : React.ChangeEvent<HTMLInputElement>) => {
                setDiffname(e.target.value);
              }}
            />
          </p>
          <NewButton as={Link} to={`/edit/${mapsetId}/new?copy=${mapId}`}>
            <Line size="3.5em" margin="-3px 12px 0 0" style={{'width': '40px'}}>+</Line>
            <Line size="1em" margin="0">Create a Copy</Line>
          </NewButton>
          <ConfirmPopup 
            button={<DeleteButton>
              <Line size="3.5em" margin="-12px 0px 0 0" style={{'width': '40px'}}>-</Line>
              <Line size="1em" margin="0">Delete Beatmap</Line>
            </DeleteButton>}
            warningText={<>
              <Line size="1.25em" margin="1.5em 0 0 0">Are you sure you want to delete this beatmap:</Line>
              <Line size="1.75em" margin="1.5em">{artist} - {title} [{diffname}]?</Line>
              <Line size="1.25em" margin="0">This action is permanent and cannot be undone.</Line>
            </>}
            onConfirm={handleDeleteBeatmap}
          />
        </Sidebar>
        <EditorArea
          user={user}
          beatmap={beatmap}
          lastSavedBeatmap={lastSavedBeatmap!}
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

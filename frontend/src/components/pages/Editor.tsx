import React, { useContext, useEffect, useState }  from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import EditorArea from "@/components/modules/EditorArea";
import {MapInfoDisplay} from "@/components/modules/InfoDisplay";
import EditorShortcutsDisplay from "@/components/modules/EditorShortcutsDisplay";
import ConfirmPopup from "@/components/modules/ConfirmPopup";

import { getL10nFunc, getL10nElementFunc } from '@/providers/l10n';
import { configContext } from "@/providers/config";

import { get, put, httpDelete } from "@/utils/functions";
import { User, Beatmap } from "@/utils/types";
import { getArtist, getTitle, processBeatmap } from '@/utils/beatmaputils';
import { withParamsAsKey } from "@/utils/componentutils";

import styled from 'styled-components';
import '@/utils/styles.css';
import { Line, Sidebar, GamePageContainer, Link, NeutralButton, DeleteButton } from '@/utils/styles';

type Props = {
  user: User | null,
};

enum Status { LOADING, LOADED, SUBMITTING, INVALID, NO_PERMS };
const { LOADING, LOADED, SUBMITTING, INVALID, NO_PERMS } = Status;

type BeatmapState = {
  status: Status,
  beatmap?: Beatmap,
  lastSavedBeatmap?: Beatmap,
};

const DiffName = styled.input`
  width: 170px;
  font-size: 1em;
  font-family: "Open Sans";
`;

const Editor = ({ user } : Props) => {
  const text = getL10nFunc();
  const elem = getL10nElementFunc();
  const config = useContext(configContext);

  const navigate = useNavigate();
  const { mapId, mapsetId } = useParams();

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
      } else if (beatmap.beatmapset.owner.id !== user?.id) {
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

  if (!user) { // include this in every restricted page
    return <Navigate to='/login' replace={true} />
  }
  const Invalid = elem((<p></p>), `invalid-access-map`, {elems: {LinkTo: <Link to="/edit/new" />}});
  if (status === LOADING) { return <Loading />; }
  if (status === NO_PERMS) { return Invalid; }
  if (status === INVALID || !beatmap) { return Invalid; }
  const {diffname, kpm} = beatmap;
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
      <h1>
        {text(`editor-header`, {artist, title, diffname})}
      </h1>
      <GamePageContainer>
        <Sidebar>
          <MapInfoDisplay 
            {...beatmap}
          />
          <Line as="h2" size="1.5em">{text(`editor-section-actions`)}</Line>
          <NeutralButton as={Link} to={`/play/${mapsetId}/${mapId}`}>
            <Line size="1em" margin="0">{text(`to-play`)}</Line>
          </NeutralButton>
          <NeutralButton as={Link} to={`/edit/${mapsetId}/${mapId}/metadata`}>
            <Line size="1em" margin="0">{text(`editor-map-edit-metadata`)}</Line>
          </NeutralButton>
          <ConfirmPopup 
            button={<DeleteButton>
              <Line size="3.5em" margin="-12px 0px 0 0" style={{'width': '40px'}}>-</Line>
              <Line size="1em" margin="0">{text(`editor-map-delete`)}</Line>
            </DeleteButton>}
            warningText={elem((<></>), `editor-warning-map-delete`, {
              elems: {
                Line: <Line size="1.25em" margin="1.5em 0 0 0" />,
                BigLine: <Line size="1.75em" margin="1.5em 0 0 0" />,
              },
              vars: {title, artist, diffname}
            })}
            onConfirm={handleDeleteBeatmap}
          />
        </Sidebar>
        <EditorArea
          user={user}
          beatmap={beatmap}
          lastSavedBeatmap={lastSavedBeatmap!}
          setContent={setContent}
          saveBeatmap={saveBeatmap}
        />
        <EditorShortcutsDisplay />
      </GamePageContainer>
    </>
  );
}

export default withParamsAsKey(Editor);

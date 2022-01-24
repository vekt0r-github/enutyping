import React, { useEffect, useState }  from "react";
import { Navigate, useParams } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import EditorArea from "@/components/modules/EditorArea";
import NotFound from "@/components/pages/NotFound";
import MapInfoDisplay from "@/components/modules/MapInfoDisplay";

import { get, post, put } from "@/utils/functions";
import { User, Config, Beatmap } from "@/utils/types";
import { getArtist, getTitle, processBeatmap } from '@/utils/beatmaputils';

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox, Line, Sidebar, GamePageContainer } from '@/utils/styles';

type Props = {
  user: User | null,
  config: Config,
};

enum Status { LOADING, LOADED, INVALID, CREATED_DIFF };
const { LOADING, LOADED, INVALID, CREATED_DIFF } = Status;

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

`;

const Editor = ({ user, config } : Props) => {
  if (!user) { // include this in every restricted page
    return <Navigate to='/login' replace={true} />
  }

  const { mapId, mapsetId } = useParams();
  const isNewMap = (mapId === "new");

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
    if (!beatmap || !beatmap.content.length) { return; }
    if (isNewMap) {
      const data = {
        beatmapset_id: mapsetId,
        diffname: diffname,
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
  };
  
  useEffect(() => {
    if (!isNewMap) {
      get(`/api/beatmaps/${mapId}`).then((beatmap) => {
        if (!beatmap || !beatmap.id || beatmap.beatmapset.id != mapsetId) {
          setState({ status: INVALID }); // map not found or param is wrong
        } else {
          processAndLoad(() => beatmap);
        }
      });
    } else {
      get(`/api/beatmapsets/${mapsetId}`).then((beatmapset) => {
        if (!beatmapset || !beatmapset.id) {
          setState({ status: INVALID }); // mapset not found
        } else {
          processAndLoad(() => ({
            id: -1,
            beatmapset: beatmapset,
            diffname: "",
            content: "",
            lines: [],
          }));
        }
      });
    }
      // TODO: support this later, in EditorNewMapset.tsx

      // load({
      //   id: -1,
      //   beatmapset: {
      //     id: -1,
      //     artist: "",
      //     title: "",
      //     artist_original: "",
      //     title_original: "",
      //     yt_id: "",
      //     preview_point: 0,
      //     owner: user,
      //     beatmaps: [],
      //   },
      //   diffname: "",
      // });
  }, []);

  useEffect(() => {
    if (!beatmap) { return; }
    processBeatmap(beatmap, config);
  }, [beatmap?.content]);

  if (status === LOADING) { return <Loading />; }
  if (status === CREATED_DIFF) { return <Navigate to={`/edit/${mapsetId}/${beatmap!.id}`} />; }
  if (status === INVALID || !beatmap) { return <NotFound />; }
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
        <EditorArea
          user={user}
          beatmap={beatmap}
          setContent={setContent}
          saveBeatmap={saveBeatmap}
          config={config}
        />
        <Sidebar as="form" onSubmit={(e : React.FormEvent<HTMLFormElement>) => {
            setContent((e.currentTarget.elements[0] as HTMLInputElement).value);
            e.preventDefault();
          }}>
          <h2>Beatmap File</h2>
          <GameFile value={content} />
          <button type='submit'>SUbSMIT</button>
        </Sidebar>
      </GamePageContainer>
    </>
  );
}

const EditorWithKey = (props : Props) => {
  const params = useParams();
  // etc... other react-router-dom v6 hooks

  return (
    <Editor
      key={`${params.mapsetId}-${params.mapId}`}
      {...props}
    />
  );
};

export default EditorWithKey;

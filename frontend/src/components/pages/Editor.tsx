import React, { useEffect, useState }  from "react";
import { Navigate, useParams } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import EditorArea from "@/components/modules/EditorArea";
import NotFound from "@/components/pages/NotFound";

import { get } from "@/utils/functions";
import { User, Config, Beatmap } from "@/utils/types";
import { getArtist, getTitle, processBeatmap } from '@/utils/beatmaputils';

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox, Line } from '@/utils/styles';
import { Sidebar, PageContainer } from '@/components/pages/Game';

type Props = {
  user: User | null,
  config: Config,
};

enum Status { LOADING, LOADED, INVALID };
const { LOADING, LOADED, INVALID } = Status;

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

const Editor = ({ user, config } : Props) => {
  if (!user) { // include this in every restricted page
    return <Navigate to='/login' replace={true} />
  }

  const { mapId, mapsetId } = useParams();
  // const isNewMapset = (mapsetId === "new");
  const isNewMapset = false;
  const isNewMap = (mapId === "new");

  const [state, setState] = useState<BeatmapState>({ status: LOADING });
  const load = (beatmap : (oldBeatmap?: Beatmap) => Beatmap | undefined) => 
    setState((oldState) => ({ status: LOADED, beatmap: beatmap(oldState.beatmap) }));
  const {status, beatmap} = state;
  
  useEffect(() => {
    if (!isNewMapset && !isNewMap) {
      get(`/api/beatmaps/${mapId}`).then((beatmap) => {
        if (!beatmap || !beatmap.id || beatmap.beatmapset.id != mapsetId) {
          setState({ status: INVALID }); // map not found or param is wrong
        } else {
          load(() => beatmap);
        }
      });
    } else if (!isNewMapset) {
      get(`/api/beatmapsets/${mapsetId}`).then((beatmapset) => {
        if (!beatmapset || !beatmapset.id) {
          setState({ status: INVALID }); // mapset not found
        } else {
          load(() => ({
            id: -1,
            beatmapset: beatmapset,
            diffname: "",
          }));
        }
      });
    } else {
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
    }
  }, []);

  useEffect(() => {
    if (!beatmap) { return; }
    processBeatmap(beatmap, config);
  }, [beatmap]);

  if (status === LOADING) { return <Loading />; }
  if (status === INVALID || !beatmap) { return <NotFound />; }
  const {beatmapset, diffname, content, lines, scores} = beatmap;
  const {yt_id, source, preview_point, owner, beatmaps} = beatmapset;
  const [artist, title] = [getArtist(beatmapset, config), getTitle(beatmapset, config)];
  
  return (
    <>
      <h1>Editing: {artist} - {title} [{diffname}]</h1>
      <PageContainer>
        <Sidebar>
          <h2>Map info and stats etc.</h2>
          <Line>Title: {title}</Line>
          <Line>Artist: {artist}</Line>
          <Line>Map ID: {beatmap.id}</Line>
          <Line>Set ID: {beatmapset.id}</Line>
          <Line>Source: {source}</Line>
        </Sidebar>
        <EditorArea
          user={user}
          beatmap={beatmap}
          config={config}
        />
        <Sidebar as="form" onSubmit={(e : React.FormEvent<HTMLFormElement>) => {
            load((oldBeatmap) => oldBeatmap ? { ...oldBeatmap,
              content: (e.currentTarget.elements[0] as HTMLInputElement).value,
            } : undefined);
            e.preventDefault();
          }}>
          <h2>Beatmap File</h2>
          <GameFile defaultValue={content} />
          <button type='submit'>SUbSMIT</button>
        </Sidebar>
      </PageContainer>
    </>
  );
}

export default Editor;

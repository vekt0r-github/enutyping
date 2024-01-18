import React, { useContext, useEffect, useState }  from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import YTThumbnail from "@/components/modules/YTThumbnail";
import {MapInfoDisplay, MapsetInfoDisplay} from "@/components/modules/InfoDisplay";
import EditorShortcutsDisplay from "@/components/modules/EditorShortcutsDisplay";
import ConfirmPopup from "@/components/modules/ConfirmPopup";

import { getL10nFunc, getL10nElementFunc } from '@/providers/l10n';
import { configContext } from "@/providers/config";

import { get, httpDelete } from "@/utils/functions";
import { Beatmapset, User, BeatmapMetadata } from "@/utils/types";
import { getArtist, getTitle, makeSetFunc } from "@/utils/beatmaputils"
import { withParamsAsKey } from "@/utils/componentutils";

import styled from 'styled-components';
import '@/utils/styles.css';
import { Line, Link, GamePageContainer, Sidebar, NeutralButton, DeleteButton, NewButton, Thumbnail } from '@/utils/styles';

import { GameContainer, BottomHalf, StatBox } from "@/components/modules/GameAreaDisplay";
import { Overlay, DiffsContainer, Diff } from "@/components/pages/DiffSelect";

/**
 * note: localization for this file uses a lot of keys from
 * other areas of the app; use caution when editing those keys
 * 
 * (this file should get its own keys if they ever need to diverge)
 */

type Props = {
  user: User | null,
};

enum Status { LOADING, LOADED, INVALID, GOBACK };
const { LOADING, LOADED, INVALID, GOBACK } = Status;

type State = {
  status: Status,
  mapset?: Beatmapset,
  selectedMap?: BeatmapMetadata,
}

const MainYTThumbnail = styled(YTThumbnail)`
  position: absolute;
  z-index: 1;
`;

const ActionsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    'a b'
    'c c';
  /* this whole thing is so scuffed i hate it */
  & > a, & > button {
    box-sizing: border-box;
    width: 150px;
    display: flex;
    justify-content: center;
  }
  & > div {
    margin: auto;
    grid-area: c;
  }
`;

const EditorDiffSelect = ({ user } : Props) => {
  const text = getL10nFunc();
  const elem = getL10nElementFunc();
  const config = useContext(configContext);

  const navigate = useNavigate();
  const [state, setState] = useState<State>({ status: LOADING });
  const {status, mapset, selectedMap} = state;
  const setStatus = makeSetFunc(setState)('status');
  const setMapset = makeSetFunc(setState)('mapset');
  const setSelectedMap = makeSetFunc(setState)('selectedMap');

  const { mapsetId } = useParams();
  
  useEffect(() => {
    get(`/api/beatmapsets/${mapsetId}`).then((beatmapset) => {
      if (!beatmapset || !beatmapset.id) {
        setStatus(INVALID); // mapset not found
      } else if (beatmapset.owner.id !== user?.id) {
        setStatus(INVALID); // no perms
      } else {
        setMapset(beatmapset);
        setStatus(LOADED);
      }
    }).catch(err => setStatus(INVALID));
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
  const Invalid = elem((<p></p>), `invalid-access-mapset`, {elems: {LinkTo: <Link to="/edit/collection/new" />}});
  if (status === GOBACK) { return <Navigate to={`/edit`} replace={true} />; }
  if (status === INVALID) { return Invalid; }
  if (status === LOADING || !mapset) { return <Loading />; }
  
  const {name, icon_url, owner, beatmaps} = mapset;
  
  const handleDeleteBeatmapset = async () => {
    const res = await httpDelete(`/api/beatmapsets/${mapsetId}`);
    if (res && res.success) {
      navigate(`/edit`);
    }
  };

  return (
    <>
      <Line as="h1" size="2em">{text(`editing-prefix`)}{name}</Line>
      {elem((<Line as="p" margin="0 0 0.5em 0" />), `diffs-mapset-owner`, {
        elems: {LinkTo: <Link to={`/user/${owner.id}`}></Link>},
        vars: {owner: owner.name},
      })}
      <GamePageContainer>
        <Sidebar>
          <MapsetInfoDisplay {...mapset} />
          <p>{mapset.description}</p>
          <Line as="h2" size="1.5em">{text(`diffs-section-actions`)}</Line>
          <ActionsContainer>
            <NeutralButton as={Link} to={`/play/collection/${mapsetId}`}>
              {text(`to-play`)}
            </NeutralButton>
            <NeutralButton as={Link} to={`/edit/collection/${mapsetId}/metadata`}>
              {text(`editor-map-edit-metadata`)}
            </NeutralButton>
            <ConfirmPopup
              button={<DeleteButton>
                <Line size="3.5em" margin="-12px 0 0 -16px" style={{'width': '40px'}}>-</Line>
                <Line size="1em" margin="0">{text(`menu-mapset-delete`)}</Line>
              </DeleteButton>}
              warningText={elem((<></>), `menu-warning-mapset-delete`, {
                elems: {
                  Line: <Line size="1.25em" margin="1em 0 0 0"/>,
                  BigLine: <Line size="1.75em" margin="1em 0 0.5em 0"/>,
                },
                vars: {
                  name: mapset.name,
                  mapCount: beatmaps.length,
                }
              })}
              onConfirm={handleDeleteBeatmapset}
            />
          </ActionsContainer>
        </Sidebar>
        <GameContainer>
          <BottomHalf>
            <StatBox />
            {selectedMap 
            ? <MainYTThumbnail yt_id={selectedMap?.yt_id ?? ''} width={400} height={300} />
            : <Thumbnail src={icon_url} width={400} height={300} />
            }
            <StatBox />
          </BottomHalf>
          <Overlay>
            <Line as="h2" size="1.5em" margin="1.5em 0">{text(`diffs-header`, {name})}</Line>
            <DiffsContainer>
              {beatmaps.map((map) => 
                <Diff
                  as={Link}
                  to={`/edit/${map.id}`}
                  key={map.id}
                  onMouseEnter={() => setSelectedMap(map)}
                  onFocus={() => setSelectedMap(map)}
                  onMouseLeave={() => setSelectedMap(undefined)}
                  onBlur={() => setSelectedMap(undefined)}
                >
                  <YTThumbnail yt_id={map.yt_id} width={32} height={24} />
                  {elem((<></>), `diffs-map-display`, {
                    elems: {
                      Line: <Line as="p" size="1em" margin="0" />
                    },
                    vars: {
                      artist: getArtist(map, config),
                      title: getTitle(map, config),
                      diffname: map.diffname,
                      kpm: Math.round(map.kpm ?? 0)
                    },
                  })}
                </Diff>
              )}
              <NewButton as={Link} to={`/edit/collection/${mapset.id}/new`}>
                <Line size="3.5em" margin="-3px -4px 0 -8px" style={{'width': '40px'}}>+</Line>
                <Line size="1em" margin="0">{text(`menu-map-new-diff`)}</Line>
              </NewButton>
            </DiffsContainer>
          </Overlay>
        </GameContainer>
        {selectedMap 
          ? <Sidebar><MapInfoDisplay {...selectedMap} /></Sidebar>
          : <EditorShortcutsDisplay />
        }
      </GamePageContainer>
    </>
  );
}

export default withParamsAsKey(EditorDiffSelect);

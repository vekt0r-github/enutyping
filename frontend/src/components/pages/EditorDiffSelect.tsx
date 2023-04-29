import React, { useContext, useEffect, useState }  from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import YTThumbnail from "@/components/modules/YTThumbnail";
import {MapInfoDisplay, MapsetInfoDisplay} from "@/components/modules/InfoDisplay";
import EditorShortcutsDisplay from "@/components/modules/EditorShortcutsDisplay";
import ConfirmPopup from "@/components/modules/ConfirmPopup";
import FormInput from "@/components/modules/FormInput";

import { getL10nFunc, getL10nElementFunc } from '@/providers/l10n';
import { Config, configContext } from "@/providers/config";

import { get, httpDelete, post } from "@/utils/functions";
import { Beatmapset, User, BeatmapMetadata } from "@/utils/types";
import { getArtist, getTitle, makeSetFunc } from "@/utils/beatmaputils"
import { withParamsAsKey } from "@/utils/componentutils";

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox, Line, Link, GamePageContainer, Sidebar, Button, DeleteButton, NewButton, Thumbnail } from '@/utils/styles';

import { GameContainer, BottomHalf, StatBox, Overlay as GameOverlay } from "@/components/modules/GameAreaDisplay";
import { Overlay, DiffsContainer, Diff } from "@/components/pages/DiffSelect";

/**
 * note: localization for this file uses a lot of keys from
 * other areas of the app; use caution when editing those keys
 * 
 * (this file should get its own keys if they ever need to diverge)
 */

const NewSetForm = styled.form`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const FormWarning = styled(Line)`
  background-color: var(--clr-warn);
  padding: var(--xs) 0;
  font-style: italic !important;
`;

type Props = {
  user: User | null,
};

enum Status { LOADING, LOADED, INVALID, GOBACK, CREATED_SET };
const { LOADING, LOADED, INVALID, GOBACK, CREATED_SET } = Status;

type State = {
  status: Status,
  mapset: Beatmapset,
  selectedMap?: BeatmapMetadata,
}

const FormSubmit = styled(NewButton)`
  margin: var(--m) 0 0 0;
`;

const StyledThumbnail = (base: Parameters<typeof styled>[0]) => styled(base)`
  position: absolute;
  z-index: 1;
`;
const MainYTThumbnail = StyledThumbnail(YTThumbnail);
const MainThumbnail = Thumbnail;

const EditorDiffSelect = ({ user } : Props) => {
  if (!user) { // include this in every restricted page
    return <Navigate to='/login' replace={true} />
  }
  const text = getL10nFunc();
  const elem = getL10nElementFunc();
  const config = useContext(configContext);

  const navigate = useNavigate();
  const [state, setState] = useState<State>({
    status: LOADING,
    mapset: {
      id: -1,
      name: '',
      description: '',
      icon_url: '',
      owner: user, // probably doesn't get sent to backend
      beatmaps: [], // not set here
    },
    selectedMap: undefined,
  });
  const {status, mapset, selectedMap} = state;
  const setStatus = makeSetFunc(setState)('status');
  const setMapset = makeSetFunc(setState)('mapset');
  const setSelectedMap = makeSetFunc(setState)('selectedMap');
  const set = makeSetFunc(setMapset);

  const { mapsetId } = useParams();
  const isNewMapset = (mapsetId === "new");

  const createMapset = () => {
    const {name, description, icon_url} = mapset;
    if (!name || !description || !icon_url) { return; }
    const data = {name, description, icon_url};
    post(`/api/beatmapsets`, data).then((beatmapset) => {
      setState(({mapset, selectedMap}) => ({
        status: CREATED_SET,
        mapset: { ...mapset,
          id: beatmapset.id,
        },
        selectedMap: selectedMap,
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

  const Invalid = elem((<p></p>), `invalid-access-mapset`, {elems: {Link: <Link to="/edit/new" />}});
  if (status === GOBACK) { return <Navigate to={`/edit`} replace={true} />; }
  if (status === INVALID) { return Invalid; }
  if (status === LOADING || !mapset) { return <Loading />; }
  if (status === CREATED_SET) { return <Navigate to={`/edit/${mapset.id}/new`} replace={true} />; }
  
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
        elems: {Link: <Link to={`/user/${owner.id}`}></Link>},
        vars: {owner: owner.name},
      })}
      <GamePageContainer>
        <Sidebar>
          <MapsetInfoDisplay {...mapset} />
          <p>{mapset.description}</p>
          {!isNewMapset ?
            <>
              <ConfirmPopup 
                button={<DeleteButton>
                  <Line size="3.5em" margin="-12px 0px 0 0" style={{'width': '40px'}}>-</Line>
                  <Line size="1em" margin="0">{text(`menu-mapset-delete`)}</Line>
                </DeleteButton>}
                warningText={elem((<></>), `menu-warning-mapset-delete`, {
                  elems: {
                    Line: <Line size="1.25em" margin="1.5em 0 0 0" />,
                    BigLine: <Line size="1.75em" margin="1.5em 0 0 0" />,
                  },
                  vars: {
                    name: mapset.name,
                    mapCount: beatmaps.length,
                  }
                })}
                onConfirm={handleDeleteBeatmapset}
              />
            </>
          : null }
        </Sidebar>
        <GameContainer>
          <BottomHalf>
            <StatBox />
            {selectedMap 
            ? <MainYTThumbnail yt_id={selectedMap?.yt_id ?? ''} width={400} height={300} />
            : <MainThumbnail src={icon_url} width={400} height={300} />
            }
            <StatBox />
          </BottomHalf>
          <Overlay>
            {isNewMapset ? <NewSetForm onSubmit={(e : React.FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              createMapset();
            }}>
              <Line as="h2" size="1.5em" margin="0.75em 0 1em 0">{text(`form-mapset-header`)}</Line>
              <FormInput obj={mapset} set={set} field="name" label="form-mapset-name" />
              <FormInput obj={mapset} set={set} field="description" label="form-mapset-desc" />
              <FormInput obj={mapset} set={set} field="icon_url" label="form-mapset-icon" description="form-mapset-icon-desc" />
              <FormWarning size="1em">{text(`form-warning-metadata`)}</FormWarning>
              <FormSubmit as="button" type="submit">
                <Line size="1em" margin="0">{text(`form-mapset-submit-create`)}</Line>
              </FormSubmit>
            </NewSetForm> : <>
              <Line as="h2" size="1.5em" margin="1.5em 0">{text(`diffs-header`)}</Line>
              <DiffsContainer>
                {beatmaps.map((map) => 
                  <Diff
                    as={Link}
                    to={`/edit/${mapset.id}/${map.id}`}
                    key={map.id}
                    tabindex={0}
                    onMouseEnter={() => setSelectedMap(map)}
                    onFocus={() => setSelectedMap(map)}
                    onMouseLeave={() => setSelectedMap(undefined)}
                    onFocusOut={() => setSelectedMap(undefined)}
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
                <NewButton as={Link} to={`/edit/${mapset.id}/new`}>
                  <Line size="3.5em" margin="-3px -4px 0 -8px" style={{'width': '40px'}}>+</Line>
                  <Line size="1em" margin="0">{text(`menu-map-new`)}</Line>
                </NewButton>
              </DiffsContainer>
            </>}
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

import React, { useEffect, useState }  from "react";
import { Navigate, useParams } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import { MapsetInfoDisplay } from "@/components/modules/InfoDisplay";
import EditorShortcutsDisplay from "@/components/modules/EditorShortcutsDisplay";
import FormInput from "@/components/modules/FormInput";

import { getL10nFunc, getL10nElementFunc } from '@/providers/l10n';

import { get, post, put } from "@/utils/functions";
import { Beatmapset, User } from "@/utils/types";
import { makeSetFunc } from "@/utils/beatmaputils"
import { withParamsAsKey } from "@/utils/componentutils";

import styled from 'styled-components';
import '@/utils/styles.css';
import { Line, Link, GamePageContainer, Sidebar, NewButton, Thumbnail } from '@/utils/styles';

// importing styles
import { GameContainer, BottomHalf, StatBox, Overlay as GameOverlay } from "@/components/modules/GameAreaDisplay";

/**
 * note: localization for this file uses a lot of keys from
 * other areas of the app; use caution when editing those keys
 * 
 * (this file should get its own keys if they ever need to diverge)
 */

const FormWarning = styled(Line)`
  background-color: var(--clr-warn);
  padding: var(--xs) 0;
  font-style: italic !important;
`;

const NewSetForm = styled.form`
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

const FormSubmit = styled(NewButton)`
  margin: var(--m) 0 0 0;
`;

const EditorMapsetMetadata = ({ user } : Props) => {
  const text = getL10nFunc();
  const elem = getL10nElementFunc();

  const [state, setState] = useState<State>({
    status: LOADING,
    mapset: {
      id: -1,
      name: '',
      description: '',
      icon_url: '',
      owner: user!, // probably doesn't get sent to backend
      beatmaps: [], // not set here
    },
  });
  const {status, mapset} = state;
  const setStatus = makeSetFunc(setState)('status');
  const setMapset = makeSetFunc(setState)('mapset');
  const set = makeSetFunc(setMapset);

  // this component has two paths leading to it!
  // if creating a new collection, mapsetId is undefined
  // if editing an existing collection's metadata, it's not
  const { mapsetId } = useParams();
  const isNewMapset = (mapsetId === undefined);

  const createOrUpdateMapset = () => {
    const {name, description, icon_url} = mapset;
    if (!name || !description || !icon_url) { return; }
    const data = {name, description, icon_url};
    const callback = (beatmapset : Beatmapset) => {
      setState(({mapset}) => ({
        status: FINISHED,
        mapset: { ...mapset,
          id: beatmapset.id,
        },
      }));
    };
    
    if (isNewMapset) {
      post(`/api/beatmapsets`, data).then(callback);
    } else {
      put(`/api/beatmapsets/${mapsetId}`, data).then(callback);
    }
  };  

  useEffect(() => {
    if (mapsetId === undefined) {
      setStatus(LOADED);
      return;
    }
    get(`/api/beatmapsets/${mapsetId}`)
      .then((beatmapset) => {
        if (!beatmapset || !beatmapset.id) {
          throw new Error; // mapset not found
        } else if (beatmapset.owner.id !== user?.id) {
          throw new Error; // no perms
        } else {
          setMapset(beatmapset);
          setStatus(LOADED);
        }
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

  if (!user) { // include this in every restricted page
    return <Navigate to='/login' replace={true} />
  }
  const Invalid = elem((<p></p>), `invalid-access-mapset`, {elems: {LinkTo: <Link to="/edit/new" />}});
  if (status === GOBACK) { return <Navigate to={`/edit`} replace={true} />; }
  if (status === INVALID) { return Invalid; }
  if (status === LOADING || !mapset) { return <Loading />; }
  if (status === FINISHED) { return <Navigate to={`/edit/${mapset.id}${isNewMapset ? '/new' : ''}`} replace={true} />; }

  const {name, icon_url, owner} = mapset;

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
        </Sidebar>
        <GameContainer>
          <BottomHalf>
            <StatBox />
            <Thumbnail src={icon_url} width={400} height={300} />
            <StatBox />
          </BottomHalf>
          <Overlay>
            <NewSetForm onSubmit={(e : React.FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              createOrUpdateMapset();
            }}>
              <Line as="h2" size="1.5em" margin="0.75em 0 1em 0">{text(`form-mapset-header`)}</Line>
              <FormInput obj={mapset} set={set} field="name" label="form-mapset-name" />
              <FormInput obj={mapset} set={set} field="description" label="form-mapset-desc" />
              <FormInput obj={mapset} set={set} field="icon_url" label="form-mapset-icon" description="form-mapset-icon-desc" />
              <FormWarning size="1em">{text(`form-warning-metadata`)}</FormWarning>
              <FormSubmit as="button" type="submit">
                <Line size="1em" margin="0">
                  {text(`form-mapset-submit-${isNewMapset ? `create` : `update`}`)}
                </Line>
              </FormSubmit>
            </NewSetForm>
          </Overlay>
        </GameContainer>
        <EditorShortcutsDisplay />
      </GamePageContainer>
    </>
  );
}

export default withParamsAsKey(EditorMapsetMetadata);

import React, { useEffect, useState } from "react";
import styled from "styled-components";

import MapsetList from "@/components/modules/MapsetList";
import { Container as ConfirmContainer } from "@/components/modules/ConfirmPopup"

import { getL10nElementFunc, getL10nFunc } from '@/providers/l10n';

import { get } from "@/utils/functions";
import { Beatmapset, MapsetID, User } from "@/utils/types";

import '@/utils/styles.css';
import { Line, MainBox, NewButton, NeutralButton } from '@/utils/styles';
import { MapsetsContainer } from '@/components/pages/SongSelect';

/**
 * in the future this can be more general;
 * right now the text assumes copying a beatmap to a collection
 * 
 * TODO: actually rework what this does
 */

type Props = {
  user: User,
  button: JSX.Element,
  onSelect: (mapsetId: MapsetID) => void,
}

const OverlayContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  background-color: var(--clr-overlay);
`;

const SelectContainer = styled(MainBox)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SongsScrollContainer = styled.div`
  max-width: 1000px;
  max-height: 500px;
  overflow-x: hidden;
  overflow-y: scroll;
`;

const Buttons = styled.div`
  margin: auto 0;
  display: flex;
`;

enum OpenState { CLOSED, SELECT, CONFIRM }
const { CLOSED, SELECT, CONFIRM } = OpenState;

const MapsetSelectPopup = ({ user, button, onSelect }: Props) => {
  const [mapsets, setMapsets] = useState<Beatmapset[]>();
  const [openState, setOpenState] = useState<OpenState>(CLOSED);
  const [selectedMapsetId, setSelectedMapsetId] = useState<MapsetID>();
  const text = getL10nFunc();
  const elem = getL10nElementFunc();

  const selectedMapset = mapsets?.filter(mapset => mapset.id === selectedMapsetId).at(0);

  useEffect(() => {
    get("/api/beatmapsets", { search: user?.id }).then((res) => {
      const beatmapsets = res.beatmapsets;
      if (beatmapsets && beatmapsets.length) {
        setMapsets(beatmapsets);
      } else {
        setMapsets([]);
      }
    });
  }, []);


  useEffect(() => {
    if (openState === CLOSED) {
      setSelectedMapsetId(undefined);
    }
  }, [openState])

  useEffect(() => {
    if (selectedMapsetId !== undefined) {
      setOpenState(CONFIRM);
    }
  }, [selectedMapsetId])

  return (<>
    <div onClick={() => setOpenState(SELECT)}>{button}</div>
    {(mapsets && openState !== CLOSED) ?
      <OverlayContainer onClick={() => setOpenState(CLOSED)}>
        {(() => {
          switch (openState) {
          case SELECT:
            return <SelectContainer onClick={(e) => {
              e.stopPropagation();
            }}>
              <Line as="h1">{text(`copy-map-header`)}</Line>
              <SongsScrollContainer>
                <MapsetsContainer>
                  <MapsetList
                    user={user}
                    mapsets={mapsets}
                    includeMapsetCreate={false}
                    includeMapCreate={false}
                    onObjectClick={(mapsetId: MapsetID) => {
                      setSelectedMapsetId(mapsetId);
                    }}
                  />
                </MapsetsContainer>
              </SongsScrollContainer>
              <Buttons>
                <NeutralButton onClick={() => setOpenState(CLOSED)}>
                  <Line size="1.25em" margin="0">{text(`copy-map-cancel`)}</Line>
                </NeutralButton>
              </Buttons>
            </SelectContainer>
          case CONFIRM:
            if (!selectedMapset) {
              setOpenState(CLOSED);
              return null;
            }
            return <ConfirmContainer onClick={(e) => {
              e.stopPropagation();
            }}>
              {elem((<></>), `copy-map-confirm-dialog`, {
                elems: {
                  Line: <Line size="1.25em" margin="1em 0 0 0"/>,
                  BigLine: <Line size="1.75em" margin="1em 0 0.5em 0"/>,
                },
                vars: {name: selectedMapset.name}
              })}
              <Buttons>
                <NewButton onClick={() => selectedMapsetId && onSelect(selectedMapsetId)}>
                  <Line size="1.25em" margin="0">{text(`copy-map-select`)}</Line>
                </NewButton>
                <NeutralButton onClick={() => {
                  setSelectedMapsetId(undefined);
                  setOpenState(SELECT);
                }}>
                  <Line size="1.25em" margin="0">{text(`copy-map-back`)}</Line>
                </NeutralButton>
              </Buttons>
            </ConfirmContainer>
          }
        })()}
      </OverlayContainer>
    : null}
  </>);
};

export default MapsetSelectPopup;

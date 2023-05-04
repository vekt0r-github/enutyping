import React, { useState } from "react";
import styled from "styled-components";

import { getL10nFunc } from '@/providers/l10n';

import '@/utils/styles.css'
import { Line, MainBox, DeleteButton, NeutralButton } from '@/utils/styles';

type Props = {
  button: JSX.Element,
  warningText: JSX.Element,
  onConfirm: () => void,
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

export const Container = styled(MainBox)`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 600px;
  height: 400px;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Buttons = styled.div`
  margin: auto 0;
  display: flex;
`;

const ConfirmPopup = ({ button, warningText, onConfirm }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const text = getL10nFunc();

  return (<>
    <div onClick={() => setIsOpen(true)}>{button}</div>
    {isOpen ? 
      <OverlayContainer onClick={() => setIsOpen(false)}>
        <Container onClick={(e) => {
          e.stopPropagation();
        }}>
          {warningText}
          <Buttons>
            <DeleteButton onClick={() => onConfirm()}>
              <Line size="1.25em" margin="0">{text(`confirm-delete`)}</Line>
            </DeleteButton>
            <NeutralButton onClick={() => setIsOpen(false)}>
              <Line size="1.25em" margin="0">{text(`confirm-cancel`)}</Line>
            </NeutralButton>
          </Buttons>
        </Container>
      </OverlayContainer> : null}
  </>);
};

export default ConfirmPopup;

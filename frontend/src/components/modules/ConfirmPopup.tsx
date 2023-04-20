import { User } from "@/utils/types";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";

import '@/utils/styles.css'
import { Line, MainBox, DeleteButton } from '@/utils/styles';

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

const Container = styled(MainBox)`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 600px;
  height: 400px;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
/*   
  & ${Line} { 
    background-color: var(--clr-warn);
    color: black;
  }; */
`;

const Buttons = styled.div`
  margin: auto 0;
  display: flex;
`;

const Confirm = styled(DeleteButton)``;

const Cancel = styled(DeleteButton)`
  background-color: var(--clr-darkgrey);
  &:hover, &:focus {
    background-color: var(--clr-medgrey);
  }
`;

const ConfirmPopup = ({ button, warningText, onConfirm }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (<>
    <div onClick={() => setIsOpen(true)}>{button}</div>
    {isOpen ? 
      <OverlayContainer onClick={() => setIsOpen(false)}>
        <Container onClick={(e) => {
          e.stopPropagation();
        }}>
          {warningText}
          <Buttons>
            <Confirm onClick={() => onConfirm()}>
              <Line size="1.25em" margin="0">Delete</Line>
            </Confirm>
            <Cancel onClick={() => setIsOpen(false)}>
              <Line size="1.25em" margin="0">Cancel</Line>
            </Cancel>
          </Buttons>
        </Container>
      </OverlayContainer> : null}
  </>);
};

export default ConfirmPopup;

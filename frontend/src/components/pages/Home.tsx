import React from "react";
import { Navigate } from "react-router-dom";

import { getL10nFunc } from '@/providers/l10n';
import { User } from "@/utils/types";

import gameplayVideo from "@/public/images/gameplay_sample.mp4"

import '@/utils/styles.css';
import styled from "styled-components";
import { Link } from "react-router-dom";

type Props = {
  user: User | null,
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  min-width: 1296px;
  max-width: 1296px;
  min-height: 440px;
`;

const Padded = styled.div`
  max-width: 30%;
  margin-top: 12em;
  padding: 3rem;
  z-index: 1;
`;

const Vid = styled.video`
  border-radius: var(--s);
  position: absolute;
  top: 3em;
  width: 1296px;
  opacity: 0.3;
`;

const Title = styled.h1`
  color: white;
`;

const ButtonContainer = styled.div`
  margin-top: 1.5em;
  display: grid;
  grid-template-columns: 1fr 1fr;
  justify-items: left;
  align-items: left;
`;

const Button = styled(Link)`
  font-size: 1.5em;
  font-weight: bold;
  text-decoration: none;
  background-color: var(--teal);
  border-radius: var(--s);
  padding: 1.35rem;
  color: var(--black0);
  &:hover {
    background-color: var(--lavender);
    cursor: pointer;
  }
`;

const Home = ({ user } : Props) => {
  if (user) {
    return <Navigate to="/play" replace={true} />
  }
  const text = getL10nFunc();

  return (
    <Container>
      <Padded>
        <Title>{text(`home-title`)}</Title>
        <p style={{color:"white"}}>{text(`home-subtitle`)}</p>
        <ButtonContainer>
          <Button to="/play">{text(`home-try-now`)}</Button>
        </ButtonContainer>
      </Padded>
      <Vid autoPlay loop muted playsInline src={gameplayVideo} />
    </Container>
  );
}

export default Home;

import React from "react";

import { User } from "@/utils/types";

import '@/utils/styles.css';
import { Navigate } from "react-router-dom";

import gameplayVideo from "@/public/images/gameplay_sample.mp4"
import styled from "styled-components";

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

const Home = ({ user } : Props) => {
  if (user) {
    return <Navigate to="/play" replace={true} />
  }

  return (
    <Container>
      <Padded>
        <Title>Type your favorite songs as you listen</Title>
        <p style={{color:"white"}}>the second bestest free-to-win rhythm game</p>
      </Padded>
      <Vid autoPlay loop muted playsInline src={gameplayVideo} />
    </Container>
  );
}

export default Home;

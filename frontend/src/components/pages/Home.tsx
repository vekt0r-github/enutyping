import React, { Component } from "react";
import { Navigate } from "react-router-dom";

import { User } from "../App";

import styled, { css } from 'styled-components';
import '../../utilities.css'

type Props = {
  user: User,
};

const Box = styled.div`
  padding: var(--s);
  border-radius: var(--s);
`;

const MainBox = styled(Box)`
  background-color: var(--clr-primary);
  max-width: 300px;
`;

const SubBox = styled(Box)`
  background-color: var(--clr-secondary);
  width: fit-content;
`;

const Home = ({ user } : Props) => {
  if (!user) {
    return <Navigate to='/login' replace={true} />
  }
  return (
    <>
      <h1>Home</h1>
      <p>You are logged in as {user.name} with id {user.id}</p>
      <MainBox>
        HOOLESU
        <SubBox>
          this page is just pretending to be the osu front page i think
        </SubBox>
      </MainBox>
    </>
  );
}

export default Home;

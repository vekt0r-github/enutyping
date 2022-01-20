import React from "react";

import { User } from "@/utils/types";

import styled from 'styled-components';
import '@/utils/styles.css';
import { MainBox, SubBox } from '@/utils/styles';

type Props = {
  user: User | null,
};

const InfoBox = styled(MainBox)`
  max-width: 300px;
`;

const Home = ({ user } : Props) => {
  return (
    <>
      <h1>Home</h1>
      {user ?
        <p>You are logged in as {user.name} with id {user.id}</p>
        :
        <p>You are not logged in.</p>}
      <InfoBox>
        Game where you Type Things
        <SubBox>
          after all this time we still have no content on the front page
        </SubBox>
      </InfoBox>
    </>
  );
}

export default Home;

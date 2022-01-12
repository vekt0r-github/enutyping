import React, { Component } from "react";
import { Navigate } from "react-router-dom";

import { User } from "@/utils/types";

import styled, { css } from 'styled-components';
import '@/utils/styles.css';
import { MainBox, SubBox } from '@/utils/styles';

type Props = {
  user: User,
};

const Home = ({ user } : Props) => {
  // if (!user) { // include this in every restricted page
  //   return <Navigate to='/login' replace={true} />
  // }
  return (
    <>
      <h1>Home</h1>
      {user ?
        <p>You are logged in as {user.name} with id {user.id}</p>
        :
        <p>You are not logged in.</p>}
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

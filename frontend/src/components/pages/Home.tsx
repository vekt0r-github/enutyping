import React, { Component } from "react";
import { Navigate } from "react-router-dom";

import { User } from "../App";

type Props = {
  user: User,
};

const Home = ({ user } : Props) => {
  if (!user) {
    return <Navigate to='/login' replace={true} />
  }
  return (
    <>
      <h1>Home</h1>
      <p>You are logged in as {user.name} with id {user.id}</p>
    </>
  );
}

export default Home;

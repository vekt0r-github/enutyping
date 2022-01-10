import React from "react";
import { Navigate } from "react-router-dom";
import NavBar from "../modules/NavBar";

export type User = { // example
  id: number;
  name: string;
} | undefined;

const Home = ({ user }: { user: User }) => {
  if (!user) {
    return <Navigate to='/login' replace={true} />
  }

  return (
    <>
      <NavBar />
      { user && 
        <p>You are logged in as {user.name} with id {user.id}</p>
      }
    </>
  )
};

export default Home;

import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import NavBar from "./modules/NavBar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

import { get, post } from "../utils/functions";
import { User } from "../utils/types";

type Props = {};

const App = ({} : Props) => {
  const [user, setUser] = useState<User>();

  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user) {
        setUser(user);
      }
    });
  }, []);

  const handleLogin = (code: string|null, state: string|null) => {
    post("/api/login/authorize", { code, state }).then((user) => {
      setUser(user);
    });
  };

  const handleLogout = () => {
    setUser(undefined);
    post("/api/logout");
  };

  return (
    <>
      <BrowserRouter>
        <NavBar
          handleLogout={handleLogout}
          user={user}
        />
        <Routes>
          <Route path="/" element={
            <Home user={user} />
          }/>
          <Route path="/login" element={
            <Login 
              handleLogin={handleLogin}
              user={user}
            />
          }/>
          {/* <Route path="/play" element={
            <SongSelect user={user} />
          }/>
          <Route path="/play/:mapId" element={
            <Game user={user} />
          }/>
          <Route path="/user/:userId" element={
            <UserPage user={user} />
          }/>
          <Route path="/account" element={
            <Account user={user} />
          }/> */}
          <Route path="*" element={
            <NotFound />
          }/>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

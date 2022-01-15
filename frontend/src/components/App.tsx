import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import NavBar from "@/components/modules/NavBar";
import Home from "@/components/pages/Home";
import Login from "@/components/pages/Login";
import SongSelect from "@/components/pages/SongSelect";
import Game from "@/components/pages/Game";
import NotFound from "@/components/pages/NotFound";

import { get, post } from "@/utils/functions";
import { User } from "@/utils/types";

import styled from 'styled-components';
import '@/utils/styles.css';

type Props = {};

const Content = styled.div`
  padding: var(--s); /* if you want */
  margin: 0;
  box-sizing: border-box;
  width: 100%;
  height: calc(100% - var(--content-offset));
  position: absolute;
  top: var(--content-offset);
`;

const App = ({} : Props) => {
  const [user, setUser] = useState<User>();
  const [volume, setVolume] = useState<number>(1.0);

  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user && user.id) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
  }, []);

  const handleLogin = (code: string|null, state: string|null) => {
    post("/api/login/authorize", { code, state }).then((user) => {
      setUser(user);
    });
  };

  const handleLogout = () => {
    setUser(null);
    post("/api/logout");
  };

  if (user === undefined) { return <Loading />; }

  return (
    <>
      <BrowserRouter>
        <NavBar
          handleLogout={handleLogout}
          user={user}
        />
        <Content>
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
            <Route path="/play" element={
              <SongSelect
                user={user}
                volume={volume}
                setVolume={setVolume}
              />
            }/>
            <Route path="/play/:mapId" element={
              <Game
                user={user}
                volume={volume}
                setVolume={setVolume}
              />
            }/>
            {/* <Route path="/user/:userId" element={
              <UserPage user={user} />
            }/>
            <Route path="/account" element={
              <Account user={user} />
            }/> */}
            <Route path="*" element={
              <NotFound />
            }/>
          </Routes>
        </Content>
      </BrowserRouter>
    </>
  );
}

export default App;

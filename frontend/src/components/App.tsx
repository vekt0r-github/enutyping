import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import NavBar from "@/components/modules/NavBar";
import Home from "@/components/pages/Home";
import Login from "@/components/pages/Login";
import SongSelect from "@/components/pages/SongSelect";
import DiffSelect from "@/components/pages/DiffSelect";
import Game from "@/components/pages/Game";
import EditorSongSelect from "@/components/pages/EditorSongSelect";
import Editor from "@/components/pages/Editor";
import NotFound from "@/components/pages/NotFound";
import UserPage from "@/components/pages/UserPage";
import SettingsPage from "@/components/pages/Settings";

import { get, post } from "@/utils/functions";
import { User, Config, defaultConfig } from "@/utils/types";

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
  z-index: -1;

  /* force a default layout onto multi-component pages */
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const App = ({} : Props) => {
  const [user, setUser] = useState<User | null>();
  const [config, setConfig] = useState<Config>(defaultConfig);
  const { volume, offset, kanaSpellings } = config;

  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user && user.id) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    const localConfig: string | null = window.localStorage.getItem('ishotyping-config');
    if(localConfig) {
      setConfig({ ...config, ...JSON.parse(localConfig) });
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('ishotyping-config', JSON.stringify(config));
  }, [config]);

  const handleLogin = (code: string|null, state: string|null, oauthprovider: string) => {
    post(`/api/login/${oauthprovider}/authorize`, { code, state }).then((user) => {
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
          volume={volume}
          setVolume={(v: number) => { setConfig({ ...config, volume: v }); }}
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
              />}>
              {/* This gets the oauth provider for right auth */}
              <Route path=":oauthprovider" element={
                <Login
                  handleLogin={handleLogin}
                  user={user}
                />
              }/>
            </Route>
            <Route path="/play" element={
              <SongSelect
                config={config}
              />
            }/>
            <Route path="/play/:mapsetId" element={
              <DiffSelect
                config={config}
              />
            }/>
            <Route path="/play/:mapsetId/:mapId" element={
              <Game
                user={user}
                config={config}
              />
            }/>
            <Route path="/edit" element={
              <EditorSongSelect
                user={user}
                config={config}
              />
            }/>
            <Route path="/edit/:mapsetId" element={
              <DiffSelect
                config={config}
              />
            }/>
            <Route path="/edit/:mapsetId/:mapId" element={
              <Editor
                user={user}
                config={config}
              />
            }/>
            <Route path="/user/:userId" element={
              <UserPage yourUser={user} config={config} />
            }/>
            <Route path="/settings" element={
              <SettingsPage
                user={user}
                yourUser={user}
                setYourUser={setUser}
                initConfig={config}
                setGlobalConfig={setConfig}
              />
            }/>  
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

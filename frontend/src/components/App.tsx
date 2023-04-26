import React, { useEffect, useState, useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import NavBar from "@/components/modules/NavBar";
import Volume from "@/components/modules/Volume";
import Home from "@/components/pages/Home";
import Login from "@/components/pages/Login";
import SongSelect from "@/components/pages/SongSelect";
import DiffSelect from "@/components/pages/DiffSelect";
import Game from "@/components/pages/Game";
import EditorSongSelect from "@/components/pages/EditorSongSelect";
import EditorDiffSelect from "@/components/pages/EditorDiffSelect";
import EditorMetadata from "./pages/EditorMetadata";
import Editor from "@/components/pages/Editor";
import NotFound from "@/components/pages/NotFound";
import UserPage from "@/components/pages/UserPage";
import SettingsPage from "@/components/pages/Settings";

import { Config, ConfigProvider, Text, configContext, setConfigContext } from "@/utils/config";
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
  z-index: -1;

  /* force a default layout onto multi-component pages */
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MobileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const MobileLogo = styled.div`
  font-family: var(--ff-logo);
  font-size: 2rem;
  text-decoration: none;
  color: var(--mauve);
`;

const App = ({} : Props) => {
  const [user, setUser] = useState<User | null>();
  const config = useContext(configContext);

  const [width, setWidth] = useState<number>(window.innerWidth);

  function handleWindowSizeChange() {
      setWidth(window.innerWidth);
  }
  useEffect(() => {
      window.addEventListener('resize', handleWindowSizeChange);
      return () => {
          window.removeEventListener('resize', handleWindowSizeChange);
      }
  }, []);

  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user && user.id) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
  }, []);

  const handleLogin = (code: string|null, state: string|null, oauthprovider: string) => {
    post(`/api/login/${oauthprovider}/authorize`, { code, state }).then((user) => {
      setUser(user);
    });
  };

  const handleLogout = () => {
    post("/api/logout").then(() => {
      setUser(null);
      window.location.assign('/');
    });
  };

  if (user === undefined) { return <Loading />; }

  const isMobile = width <= 768;
  if (isMobile) {
    return (
      <ConfigProvider>
        <MobileContainer>
          <MobileLogo>{Text`title`}</MobileLogo>
          <h3>{Text`mobile-layout-error-header`}</h3>
          <div>{Text`mobile-layout-error`}</div>
        </MobileContainer>
      </ConfigProvider>
    )
  }

  return (
    <ConfigProvider>
      <BrowserRouter>
        <NavBar
          handleLogout={handleLogout}
          user={user}
        />
				<Volume />
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
              <EditorDiffSelect
                user={user}
                config={config}
              />
            }/>
            <Route path="/edit/:mapsetId/new" element={
              <EditorMetadata
                user={user}
                config={config}
              />
            }/>
            <Route path="/edit/:mapsetId/:mapId" element={
              <Editor
                user={user}
                config={config}
              />
            }/>
            <Route path="/edit/:mapsetId/:mapId/metadata" element={
              <EditorMetadata
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
              />
            }/>  
            <Route path="*" element={
              <NotFound />
            }/>
          </Routes>
        </Content>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;

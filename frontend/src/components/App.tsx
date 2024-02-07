import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import NavBar from "@/components/modules/NavBar";
import Volume from "@/components/modules/Volume";
import Home from "@/components/pages/Home";
import Login from "@/components/pages/Login";
import SongSelect from "@/components/pages/SongSelect";
import DiffSelect from "@/components/pages/DiffSelect";
import Game from "@/components/pages/Game";
import EditorDiffSelect from "@/components/pages/EditorDiffSelect";
import EditorMapsetMetadata from "@/components/pages/EditorMapsetMetadata";
import EditorMetadata from "@/components/pages/EditorMetadata";
import Editor from "@/components/pages/Editor";
import NotFound from "@/components/pages/NotFound";
import UserPage from "@/components/pages/UserPage";
import SettingsPage from "@/components/pages/Settings";

import { getL10nFunc } from "@/providers/l10n";

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
  const text = getL10nFunc();

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
      <MobileContainer>
        <MobileLogo>{text(`title`)}</MobileLogo>
        <h3>{text(`error-mobile-layout-header`)}</h3>
        <div>{text(`error-mobile-layout`)}</div>
      </MobileContainer>
    )
  }

  return (
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
              key='play'
              user={user}
              isEditor={false}
              groupMapsets={false}
            />
          }/>
          <Route path="/play/collection" element={
            <SongSelect
              key='play'
              user={user}
              isEditor={false}
              groupMapsets={true}
            />
          }/>
          <Route path="/play/collection/:mapsetId" element={
            <DiffSelect
              user={user}
            />
          }/>
          <Route path="/play/:mapId" element={
            <Game
              user={user}
            />
          }/>
          <Route path="/edit" element={
            <SongSelect
              key='edit'
              user={user}
              isEditor={true}
              groupMapsets={false}
            />
          }/>
          <Route path="/edit/collection" element={
            <SongSelect
              key='edit'
              user={user}
              isEditor={true}
              groupMapsets={true}
            />
          }/>
          <Route path="/edit/collection/new" element={
            <EditorMapsetMetadata
              user={user}
            />
          }/>
          <Route path="/edit/collection/:mapsetId" element={
            <EditorDiffSelect
              user={user}
            />
          }/>
          <Route path="/edit/collection/:mapsetId/metadata" element={
            <EditorMapsetMetadata
              user={user}
            />
          }/>
          <Route path="/edit/new" element={
            // ?collection= for adding mapset id to created map
            <EditorMetadata
              user={user}
            />
          }/>
          <Route path="/edit/:mapId" element={
            <Editor
              user={user}
            />
          }/>
          <Route path="/edit/:mapId/metadata" element={
            <EditorMetadata
              user={user}
            />
          }/>
          <Route path="/user/:userId" element={
            <UserPage yourUser={user} />
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
  );
}

export default App;

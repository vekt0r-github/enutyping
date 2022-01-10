import React, { Component } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import NavBar from "./modules/NavBar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

import { get, post } from "../utilities";

export type User = { // example
  id: number;
  name: string;
} | undefined;

type Props = {};

type State = {
  user: User,
};

class App extends Component<Props, State> {
  constructor(props : Props) {
    super(props);
    this.state = {
      user: undefined,
    };
  }

  // componentDidMount() {
  //   get("/api/whoami").then((user) => {
  //     if (user) {
  //       this.setState({ user: user });
  //     }
  //   });
  // }

  handleLogin = (code: string, state: string) => {
    post("/api/login/authorize", { code, state }).then((user) => {
      this.setState({ user: user });
    });
  };

  handleLogout = () => {
    this.setState({ user: undefined });
    post("/api/logout");
  };


  render() {
    return (
      <>
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route path="/" element={
              <Home user={this.state.user} />
            }/>
            <Route path="/login" element={
              <Login 
                handleLogin={this.handleLogin}
                handleLogout={this.handleLogout}
                user={this.state.user}
              />
            }/>
            {/* <Route path="/play" element={
              <SongSelect user={this.state.user} />
            }/>
            <Route path="/play/:mapId" element={
              <Game user={this.state.user} />
            }/>
            <Route path="/user/:userId" element={
              <UserPage user={this.state.user} />
            }/>
            <Route path="/account" element={
              <Account user={this.state.user} />
            }/> */}
            <Route path="*" element={
              <NotFound />
            }/>
          </Routes>
        </BrowserRouter>
      </>
    );
  }
}

export default App;

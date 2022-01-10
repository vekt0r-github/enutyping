import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./modules/Login";
import { get, post } from "../utilities";

const App = () => {
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user._id) {
        setUserId(user._id);
      }
    });
  });

  const handleLogin = (res) => {
    console.log(`Logged in as ${res.profileObj.name}`);
    const userToken = res.tokenObj.id_token;
    post("/api/login", { token: userToken }).then((user) => {
      setUserId(user._id);
    });
  };

  const handleLogout = () => {
    setUserId(undefined);
    post("/api/logout");
  };


  // We can nest shit later, so maybe global navbar but w/e
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

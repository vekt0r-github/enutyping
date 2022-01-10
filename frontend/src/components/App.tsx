import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home, { User } from "./pages/Home";
import Login from "./modules/Login";
import { get, post } from "../utilities";

const App = () => {
  const [user, setUser] = useState<User>();
  // useEffect(() => {
  //   get("/api/whoami").then((user) => {
  //     if (user._id) {
  //       setUserId(user._id);
  //     }
  //   });
  // });

  const handleLogin = (code: string, state: string) => {
    post("/api/login/authorize", { code, state }).then((user) => {
      setUser(user);
    });
  };

  const handleLogout = () => {
    setUser(undefined);
    post("/api/logout");
  };


  // We can nest shit later, so maybe global navbar but w/e
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="login" element={<Login handleLogin={handleLogin} handleLogout={handleLogout} user={user} />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

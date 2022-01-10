import React from "react";
import { NavLink } from "react-router-dom";

const NavBar = () => (
  <>
    <nav>
      <NavLink to="/">Home</NavLink>{" "}
      <NavLink to="/play">Play</NavLink>{" "}
      <NavLink to="/account">Account</NavLink>
      {/* Login/Logout will live here as a popup */}
    </nav>
  </>
);

export default NavBar;

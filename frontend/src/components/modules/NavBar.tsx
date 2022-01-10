import React from "react";
import { NavLink } from "react-router-dom";

import styled, { css } from 'styled-components';
import '../../utilities.css'

const Link = styled(NavLink)`
  font-size: 30px;
  margin: var(--s);
`;

const Nav = styled.nav`
  background-color: #eee;
  display: flex;
`;

const Spacer = styled.div`
  flex-grow: 1;
`;

const NavBar = () => (
  <Nav>
    <div>
      Logo
      <Link to="/">Home</Link>
      <Link to="/play">Play</Link>
      <Link to="/account">Account</Link>
    </div>
    <Spacer />
    <div>
      user profile, logout
    </div>
  </Nav>
);

export default NavBar;

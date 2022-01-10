import React from "react";
import { NavLink } from "react-router-dom";

import { User } from "../App";

import styled, { css } from 'styled-components';
import '../../utilities.css'

type Props = {
  handleLogout: () => void,
  user: User,
}

const Link = styled(NavLink)`
  font-size: 30px;
  margin: var(--s);

  // figure out how to use utility styles
  color: var(--link);
  text-decoration: none;
  cursor: pointer;
  &:hover {
    color: var(--link-hover);
  }
`;

const Nav = styled.nav`
  background-color: #eee;
  display: flex;
`;

const Spacer = styled.div`
  flex-grow: 1;
`;

const NavBar = ({ handleLogout, user } : Props) => (
  <Nav>
    <div>
      Logo
      <Link to="/">Home</Link>
      <Link to="/play">Play</Link>
      <Link to="/account">Account</Link>
    </div>
    <Spacer />
    <div>
      {user ? 
        <>
          <span>Welcome, {user.name}!</span>
          <Link as="span" onClick={handleLogout}>Logout</Link>
        </>
        : <Link to="/login">Login</Link>}
    </div>
  </Nav>
);

export default NavBar;

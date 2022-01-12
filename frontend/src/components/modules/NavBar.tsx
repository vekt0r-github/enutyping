import React from "react";
import { NavLink } from "react-router-dom";

import { User } from "../../utils/types";

import styled, { css } from 'styled-components';
import '../../utils/styles.css';
import { Spacer } from '../../utils/styles';

type Props = {
  handleLogout: () => void,
  user: User,
}

const Link = styled(NavLink)`
  font-size: 30px;
  margin: var(--s);

  // figure out how to use utility styles
  color: var(--clr-link);
  text-decoration: none;
  cursor: pointer;
  &:hover {
    color: var(--clr-link-hover);
  }
`;

const Nav = styled.nav`
  background-color: var(--clr-primary-light);
  display: flex;
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

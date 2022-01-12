import React from "react";
import { NavLink } from "react-router-dom";

import { User } from "@/utils/types";

import styled, { css } from 'styled-components';
import '@/utils/styles.css';
import { Link, Spacer } from '@/utils/styles';

type Props = {
  handleLogout: () => void,
  user: User,
}

const NavBarLink = styled(Link)`
  font-size: 30px;
  padding: 0 var(--xs);
  margin: var(--xs);
`;

const AccentLink = styled(NavBarLink)`
  background-color: var(--clr-accent);
  border-radius: var(--s);
`;

const NavContainer = styled.nav`
  background-color: var(--clr-primary-light);
  display: flex;
  padding: var(--xs);
`;

const NavBar = ({ handleLogout, user } : Props) => (
  <NavContainer>
    <div>
      Logo
      <NavBarLink as={NavLink} to="/">Home</NavBarLink>
      <NavBarLink as={NavLink} to="/play">Play</NavBarLink>
      <NavBarLink as={NavLink} to="/account">Account</NavBarLink>
    </div>
    <Spacer />
    <div>
      {user ? 
        <>
          <span>Welcome, {user.name}!</span>
          <NavBarLink as="span" onClick={handleLogout}>Logout</NavBarLink>
        </>
        : <AccentLink href="/login">Login</AccentLink>}
    </div>
  </NavContainer>
);

export default NavBar;

import React from "react";
import { NavLink } from "react-router-dom";

import { User } from "@/utils/types";

import styled from 'styled-components';
import '@/utils/styles.css';
import { Link, Spacer } from '@/utils/styles';

type Props = {
  handleLogout: () => void,
  user: User,
}

const NavBarLink = styled(Link)`
  font-size: 24px;
  padding: var(--m);
  &.active {
    background-color: var(--clr-primary-dim);
    color: white;
  }
  &:not(.active):hover {
    color: var(--clr-link);
    background-color: var(--clr-highlight);
  }
`;

const Button = styled(NavBarLink)`
  border: 3px solid var(--clr-link);
  border-radius: var(--xs);
  padding: var(--xs) var(--m);
  margin: var(--s);
`;

const InvertedButton = styled(Button)`
  background-color: var(--clr-link);
  color: white;
  &:hover {
    border-color: #0000;
  }
`;

const NavContainer = styled.nav`
  background-color: var(--clr-primary-light);
  display: flex;
  padding: var(--m) 0;
  margin: 0;
`;

const NavBar = ({ handleLogout, user } : Props) => (
  <NavContainer>
    <div>
      Logo
      <NavBarLink as={NavLink} to="/">Home</NavBarLink>
      <NavBarLink as={NavLink} to="/play">Play</NavBarLink>
      {user && <NavBarLink as={NavLink} to={`/user/${user.id}`}>Account</NavBarLink>}
    </div>
    <Spacer />
    <div>
      {user ? 
        <>
          <span>Welcome, {user.name}!</span>
          <Button as="span" onClick={handleLogout}>Logout</Button>
        </> :
        <>
          <InvertedButton to="/login">Login</InvertedButton>
        </>}
    </div>
  </NavContainer>
);

export default NavBar;

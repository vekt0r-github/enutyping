import React from "react";
import { Link as RouterLink, NavLink } from "react-router-dom";

import { User, Config } from "@/utils/types";

import styled from 'styled-components';
import '@/utils/styles.css';
import { BasicContainer, Link, Line } from '@/utils/styles';
import ProfileButton from "./ProfileButton";

type Props = {
  handleLogout: () => void,
  user: User | null,
}

const Outer = styled.div`
  background-color: var(--clr-primary-light);
	position: fixed;
	width: 100%;
`;

const NavContainer = styled(BasicContainer)`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
`;

const NavInner = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
`;

const NavLeft = styled(NavInner)`
  justify-content: flex-start;
  text-align: center;
  align-items: center;
`;

const NavMiddle = styled(NavInner)`
  justify-content: center;
  text-align: center;
  align-items: center;
`;

const NavRight = styled(NavInner)`
  justify-content: flex-end;
  &:before {
    content: "";
    height: 75px;
  }
`;

const NavBarLink = styled(Link)`
  font-size: 1em;
  margin-right: 0.75em;
  margin-left: 0.75em;

  box-sizing: border-box;
  transition: var(--tt-short);
  &.active {
    text-decoration: underline var(--clr-warn);
    text-underline-offset: 0.3em; 
    text-decoration-thickness: 0.2em;
  }
  &:not(.active):hover {
    color: var(--clr-highlight);
  }
`;

const Button = styled(NavBarLink)`
  border: 3px solid var(--clr-link);
  border-radius: var(--xs);
  padding: var(--xs) var(--m);
  margin: var(--s);
  height: auto;
`;


const NavBar = ({ handleLogout, user } : Props) => (
  <Outer>
  <NavContainer>
    <NavLeft>
      <RouterLink to="/">Logo</RouterLink>
    </NavLeft>
    <NavMiddle>
      <NavBarLink as={NavLink} to="/play">play</NavBarLink>
      <NavBarLink as={NavLink} to="/edit">create</NavBarLink>
    </NavMiddle>
    <NavRight>
      {user ? 
        <ProfileButton user={user} handleLogout={handleLogout} />
        :
        <>
          <NavBarLink as={NavLink} to="/login">sign in</NavBarLink>
        </>}
    </NavRight>
  </NavContainer>
  </Outer>
);

export default NavBar;

import React from "react";
import { NavLink } from "react-router-dom";

import Volume from "@/components/modules/Volume";

import { User } from "@/utils/types";

import styled from 'styled-components';
import '@/utils/styles.css';
import { Link, Spacer, Line } from '@/utils/styles';

type Props = {
  handleLogout: () => void,
  user: User | null,
  volume: number,
  setVolume: React.Dispatch<React.SetStateAction<number>>,
}

const NavContainer = styled.nav`
  background-color: var(--clr-primary-light);
  display: flex;
  height: var(--content-offset);
  z-index: 1;
`;

const NavHalf = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
`;

const NavBarLink = styled(Link)`
  font-size: 24px; /* text is empirically 33px */
  padding: calc((var(--content-offset) - 33px) / 2) var(--m);
  height: 100%;
  box-sizing: border-box;
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
  height: auto;
`;

const InvertedButton = styled(Button)`
  background-color: var(--clr-link);
  color: white;
  &:hover {
    border-color: #0000;
  }
`;

const NavBar = ({ handleLogout, user, volume, setVolume } : Props) => (
  <NavContainer>
    <NavHalf>
      Logo
      <NavBarLink as={NavLink} to="/">Home</NavBarLink>
      <NavBarLink as={NavLink} to="/play">Play</NavBarLink>
      {user && <NavBarLink as={NavLink} to={`/user/${user.id}`}>Account</NavBarLink>}
    </NavHalf>
    <Spacer />
    <NavHalf>
      <Volume
        volume={volume}
        setVolume={setVolume}
      />
      {user ? 
        <>
          <Line size="1.25em" margin="0 0 0 var(--s)">Welcome, {user.name}!</Line>
          <Button as="span" onClick={handleLogout}>Logout</Button>
        </> :
        <>
          <InvertedButton to="/login">Login</InvertedButton>
        </>}
    </NavHalf>
  </NavContainer>
);

export default NavBar;

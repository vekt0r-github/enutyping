import React, { useContext } from "react";
import { Link as RouterLink, NavLink } from "react-router-dom";
import { Localized } from "@fluent/react";

import { configContext, setConfigContext } from "@/providers/config"
import { User } from "@/utils/types";

import { Language, languageOptions } from "@/localization";

import styled from 'styled-components';
import '@/utils/styles.css';
import { BasicContainer, Link, Line } from '@/utils/styles';
import ProfileButton from "./ProfileButton";

type Props = {
  handleLogout: () => void,
  user: User | null,
}

const Logo = styled(RouterLink)`
  font-family: var(--ff-logo);
  font-size: 2rem;
  text-decoration: none;
  color: var(--mauve);
`;

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

const NavBar = ({ handleLogout, user } : Props) => {
  const config = useContext(configContext);
  const setConfig = useContext(setConfigContext);

  return <Outer>
  <NavContainer>
    <NavLeft>
      <Localized id="title">
        <Logo to="/">enuTyping</Logo>
      </Localized>
    </NavLeft>
      <Localized
        id="navbar-play-create"
        elems={{
          play: <NavBarLink as={NavLink} to="/play">play</NavBarLink>,
          create: <NavBarLink as={NavLink} to="/edit">create</NavBarLink>,
        }}
      >
      <NavMiddle>
        {"<play>play</play><create>create</create>"}
      </NavMiddle>
    </Localized>
    <NavRight>
      <>
      {/* scuffamole */}
        <select name={"localization"} value={config.language} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          setConfig((config) => ({...config, language: e.target.value as Language}));
        }}>
          {Object.entries(languageOptions).map(([lang, label]) => <option value={lang}>{label}</option>)}
        </select>
        {user ? (
          <ProfileButton user={user} handleLogout={handleLogout} />
        ) : (
          <Localized id="navbar-login">
            <NavBarLink as={NavLink} to="/login">sign in</NavBarLink>
          </Localized>
        )}
      </>
    </NavRight>
  </NavContainer>
  </Outer>
};

export default NavBar;

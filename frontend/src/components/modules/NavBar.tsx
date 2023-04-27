import React, { useContext } from "react";
import { Link as RouterLink, NavLink } from "react-router-dom";

import { Config, configContext, setConfigContext, t } from "@/utils/config"
import { User } from "@/utils/types";

import { Language, languageOptions } from "@/languages";

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
      <Logo to="/">{t(`title`)}</Logo>
    </NavLeft>
    <NavMiddle>
      <NavBarLink as={NavLink} to="/play">{t(`navbar-play`)}</NavBarLink>
      <NavBarLink as={NavLink} to="/edit">{t(`navbar-create`)}</NavBarLink>
    </NavMiddle>
    <NavRight>
      <>
      {/* scuffamole */}
        <select name={"localization"} value={config.language} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          setConfig((config) => ({...config, language: e.target.value as Language}));
        }}>
          {Object.entries(languageOptions).map(([lang, label]) => <option value={lang}>{label}</option>)}
        </select>
        {user ? <ProfileButton user={user} handleLogout={handleLogout} />
          : <NavBarLink as={NavLink} to="/login">{t(`navbar-login`)}</NavBarLink>}
      </>
    </NavRight>
  </NavContainer>
  </Outer>
};

export default NavBar;

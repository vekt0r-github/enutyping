import { User } from "@/utils/types";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import '@/utils/styles.css'
import { Line } from '@/utils/styles'

type Props = {
  user: User;
  handleLogout: () => void;
}

const Container = styled.div`
  float: left;
  position: relative;
`;

const ProfileImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
`;

const DropdownContainer = styled.div`
  position: absolute;
  margin-top: 1em;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
`;

const Dropdown = styled.div`
  border-radius: 6px;
  min-width: 150px;
  overflow: hidden;
  background-color: var(--clr-primary-dim);
  color: var(--clr-grey);
`;

const Name = styled(Line)`
  max-width: 200px;
  padding: 1.25rem;
`;

const Option = styled(Link)`
  display: block;
  background-color: var(--clr-darkgrey);
  text-decoration: none;
  color: black;
  cursor: pointer;
  padding: 0.6125rem 1.85rem;
  &:hover {
    background-color: var(--clr-grey);
  };
  &:hover::before {
    content: "»";
    padding-right: 0.2rem;
    font-size: 1.4em;
    border-radius: 10px;
    line-height: 100%;
    color: var(--clr-primary-dim);
  };
`;

const ProfileButton = ({ user, handleLogout }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Container>
      <ProfileImage onClick={() => setIsOpen(old => !old)} src={user.avatar_url} />
      { isOpen && 
        <DropdownContainer>
          <Dropdown>
            <Name>{user.name}</Name>
            <Option onClick={() => setIsOpen(false)} to={`/user/${user.id}`}>My Profile</Option>
            <Option onClick={() => setIsOpen(false)} to="/settings">Settings</Option>
            <Option as="div" onClick={handleLogout}>Logout</Option>
          </Dropdown>
        </DropdownContainer>
      }
    </Container>
  );
};

export default ProfileButton;

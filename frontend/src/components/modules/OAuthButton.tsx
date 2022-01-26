import React from "react"
import { Link } from "react-router-dom";
import styled from "styled-components";

import '@/utils/styles.css';

type Props = {
  text: string,
  link: string,
  svgUrl: string,
  width: number,
}

const StyledLink = styled.a`
  text-decoration: none;
  color: var(--clr-primary);
`;

const Container = styled.div`
  display: flex;
  border: 2px solid;
  border-radius: 5px;
  margin: 1em;
  padding: 0.75rem;
`;

const Text = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  flex-direction: column;
  margin-left: 1em;
  text-decoration: none;
`;

const OAuthButton = ({ text, link, svgUrl, width }: Props) => {
  return (
    <StyledLink href={link}>
      <Container>
        <img src={svgUrl} width={width} />
        <Text>{text}</Text>
      </Container>
    </StyledLink>
  );
}

export default OAuthButton;

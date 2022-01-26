import React from "react"
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
  border-radius: var(--s);
  margin-top: 1em;
  padding: 1.35rem;
  background-color: white;
`;

const Text = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  flex-direction: column;
  text-decoration: none;
  color: black;
  font-family: 'Roboto';
  padding-left: 2.7em;
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

import styled, { css } from 'styled-components';

import { Link as RouterLink } from 'react-router-dom';

const Box = styled.div`
  padding: var(--s);
  border-radius: var(--s);
`;

export const MainBox = styled(Box)`
  background-color: var(--clr-primary);
  max-width: 300px;
`;

export const SubBox = styled(Box)`
  background-color: var(--clr-secondary);
  width: fit-content;
`;

export const Link = styled(RouterLink)`
  color: var(--clr-link);
  text-decoration: none;
  cursor: pointer;
  &:hover {
    color: var(--clr-link-hover);
  }
`;

export const Spacer = styled.div`
  flex-grow: 1;
`;
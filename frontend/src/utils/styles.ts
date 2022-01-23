import styled from 'styled-components';

import { Link as RouterLink } from 'react-router-dom';

const Box = styled.div`
  padding: var(--s);
  border-radius: var(--s);
`;

export const MainBox = styled(Box)`
  background-color: var(--clr-primary);
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

export const Line = styled.span<{
  size?: string,
  margin?: string,
}>`
  max-width: 100%;
  font-size: ${(props) => props.size ?? '1em'};
  margin: ${(props) => props.margin ?? 0};
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const EditorTimelineBox = styled.div`
  width: 100%;
  height: 40px;
  box-sizing: border-box;
  margin: var(--s) 0;
  display: flex;
  align-items: center;
  background-color: var(--clr-secondary-light);
  border: 2px solid var(--clr-secondary-dim);
`;
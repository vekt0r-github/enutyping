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
  text-decoration: none;
	color: var(--clr-link);
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

export const BlackLine = styled(Line)`
	color: black;
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

export const Sidebar = styled(MainBox)`
  min-width: 300px;
  max-width: 400px;
  height: var(--game-height);
	padding-top: 0px;
	padding-bottom: 0px;
  flex-basis: 300px;
  flex-grow: 1;
  flex-shrink: 0;
  box-sizing: content-box;
  margin: 0 var(--s);
`;

export const GamePageContainer = styled.div`
  width: 100%;
  min-width: var(--game-width);
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  @media (max-width: 1496px) { // 800 + 2*(300+2*3*8)
    width: calc(var(--game-width) + 4*var(--s));
    flex-wrap: wrap;
    & ${Sidebar} {
      order: 1;
      margin-top: var(--s);
    }
  }
`;

export const SearchBar = styled.input`
  font-size: 18px;
  width: 80%;
  max-width: 500px;
  margin: var(--s);
`;

export const SongsContainer = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr;
  max-width: 500px;
  @media (min-width: 800px) {
    grid-template-columns: 1fr 1fr;
    max-width: 1000px;
  }
  justify-content: center;
  margin: 0 var(--s);
`;

export const InfoBox = styled(SubBox)<{width: number}>`
  display: flex;
  flex-direction: column;
  width: ${(props) => props.width}%;
  margin: var(--s);
  justify-content: center;
`;

export const InfoEntry = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 2px 0;
`;

export const BasicContainer = styled.div`
  width: 100%;
  max-width: 1296px; // 0.675 ratio
  margin-right: auto;
  margin-left: auto;
  padding-right: 1.5rem;
  padding-left: 1.5rem;
`;

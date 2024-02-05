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
  lineHeightRatio?: number,
  margin?: string,
}>`
  max-width: 100%;
  ${({size}) => size ? `font-size: ${size};` : ''}
  ${({size, lineHeightRatio}) => (lineHeightRatio && size) ? `line-height: calc(${lineHeightRatio} * ${size});` : ''}
  ${({margin}) => margin ? `margin: ${margin};` : ''}
  display: block;
  flex-shrink: 0;
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
  display: flex;
  flex-direction: column;
  align-items: center;
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

export const InputContainer = styled.div`
  margin: 0 var(--s);
  & > label {
    margin: 0 var(--s) 0 0;
  };
  & > input, & > select {
    margin: 0;
  };
`;

export const InfoBox = styled(SubBox)`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: var(--s);
  /* margin: var(--s); */
  justify-content: center;
  box-sizing: border-box;
`;

export const InfoEntry = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
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

export const Button = styled.button`
  /* inherit from mainbox; inheriting twice breaks stuff */
  padding: var(--s);
  border-radius: var(--s);
  background-color: var(--clr-primary);

  max-width: 400px;
  height: 60px;
  display: flex;
  align-items: center;
  transition: var(--tt-short);
  padding: 0 var(--l);
  margin: var(--s);
  border-radius: var(--m);
  &:hover, &:focus {
    background-color: var(--clr-primary-light);
  }
`;

export const NeutralButton = styled(Button)`
  align-self: center;
  font-size: 1em;
  font-family: "Open Sans";
  border: 0;
  background-color: var(--clr-secondary);
	color: black;
  cursor: pointer;
  &:hover, &:focus {
    background-color: var(--clr-secondary-light);
		color: black;
  }
`;

export const NewButton = styled(NeutralButton)`
background-color: var(--clr-create-map);
  &:hover, &:focus {
    background-color: var(--clr-create-map-light);
  }
`;

export const DeleteButton = styled(NeutralButton)`
  background-color: var(--clr-delete-map);
  &:hover, &:focus {
    background-color: var(--clr-delete-map-light);
  }
`;

export const Thumbnail = styled.img<{
  width: number,
  height: number,
}>`
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  object-fit: contain;
`;
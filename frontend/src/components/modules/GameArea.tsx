import React from "react";
import { User, Beatmap } from "@/utils/types";

import styled, { css } from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

type Props = {
  user: User,
  beatmap: Beatmap,
}

const GameContainer = styled.div`
  width: 800px;
  height: 600px;
  background-color: black;
`;

const GameArea = ({ user, beatmap } : Props) => {
  return <GameContainer />
}

export default GameArea;
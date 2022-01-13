import React, { useState } from "react";
import { User, Beatmap } from "@/utils/types";

import GameVideo from "@/components/modules/GameVideo";

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
  const [starting, setStarting] = useState<boolean>(false);

  return (
    <GameContainer onClick={() => setStarting(true)}>
      <GameVideo source={beatmap.source} starting={starting} />
    </GameContainer>
  );
}

export default GameArea;
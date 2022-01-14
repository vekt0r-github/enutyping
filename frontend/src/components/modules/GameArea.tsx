import React, { useState } from "react";
import { User, Beatmap } from "@/utils/types";

import GameVideo from "@/components/modules/GameVideo";
import Volume from "@/components/modules/Volume";

import styled, { css } from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

type Props = {
  user: User,
  beatmap: Beatmap,
  volume: number,
  setVolume: React.Dispatch<React.SetStateAction<number>>,
}

const GameContainer = styled.div`
  width: 800px;
  height: 600px;
  background-color: black;
`;

const GameArea = ({ user, beatmap, volume, setVolume } : Props) => {
  const [started, setStarted] = useState<boolean>(false);

  return (
    <GameContainer>
      <GameVideo
        source={beatmap.source}
        started={started}
        volume={volume}
      />
      <button onClick={() => setStarted(true)}>start</button>
      <Volume
        volume={volume}
        setVolume={setVolume}
      />
    </GameContainer>
  );
}

export default GameArea;
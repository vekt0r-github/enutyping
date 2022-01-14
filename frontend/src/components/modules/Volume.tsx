import React from "react";

import styled, { css } from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

type Props = {
  volume: number,
  setVolume: React.Dispatch<React.SetStateAction<number>>,
}

const Container = styled.div`
  width: 200px;
  height: 20px;
  background-color: var(--clr-primary-light);
  display: flex;
`;

const Label = styled.label`
  width: 50px;
  font-size: 12px;
`;

const SliderContainer = styled.div`
  width: 150px;
  height: var(--xs);
  position: relative;
  margin: auto var(--xs) auto auto;
  opacity: 0.7;
  &:hover {
    opacity: 1;
  }
`;

const Slider = styled.input`
  -webkit-appearance: none;  /* Override default CSS styles */
  appearance: none;
  position: absolute;
  width: 100%;
  height: var(--xs);
  margin: 0;
  background: #0000;
  outline: none;
  -webkit-transition: .2s;
  transition: opacity .2s;
  &::-webkit-slider-thumb {
    -webkit-appearance: none; /* Override default look */
    appearance: none;
    width: var(--m); 
    height: var(--m); 
    border-radius: 100%;
    background: var(--clr-primary-dim); 
    cursor: pointer; 
  }
`;

const SliderBody = styled.div`
  position: absolute;
  width: 100%;
  height: var(--xs);
  background: #ddd;
`;

const SliderFill = styled.div<{value: number}>`
  position: absolute;
  width: ${(props) => props.value}%;
  height: var(--xs);
  background-color: var(--clr-primary);
`;

const Volume = ({ volume, setVolume } : Props) => {
  const handleVolumeChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseInt(e.target.value) / 100;
    setVolume(vol);
  }

  const sliderValue = Math.round(volume * 100);

  return (
    <Container>
      <Label htmlFor="slider-container">vol: {sliderValue}</Label>
      <SliderContainer id="slider-container">
        <SliderBody />
        <SliderFill
          value={sliderValue}
        />
        <Slider
          type="range" 
          min={0} 
          max={100}
          value={sliderValue}
          onChange={handleVolumeChange} 
        />
      </SliderContainer>
    </Container>
  );
}

export default Volume;
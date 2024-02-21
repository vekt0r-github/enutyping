import React, { useContext } from "react";

import { configContext, setConfigContext } from "@/providers/config";

import styled from 'styled-components';
import vicon from '@/public/images/volume.svg';
import '@/utils/styles.css';
import { Line } from '@/utils/styles';

const Icon = styled.img`
  width: var(--container-width);
  height: var(--container-width);
  padding: var(--s);
  border-radius: var(--s);
  background-color: var(--clr-secondary);
  box-sizing: border-box;
  cursor: pointer;
  position: relative;
  z-index: 0;
`;

const IconLabel = styled(Line)`
  font-size: 0.6em;
  color: var(--clr-medgrey);
  /* scuffed alert */
  position: absolute;
  left: 11px;
  top: calc(19px + var(--s));
  z-index: 1;
  pointer-events: none;
  user-select: none;
`;

const SliderLabel = styled(Line)`
  text-align: center;
  width: 100%;
  height: var(--label-height);
  font-size: 1.25em;
  padding-top: 6px;
  pointer-events: none;
  user-select: none;
`;

const SliderOuterContainer = styled.div`
  width: 100%;
  height: calc(var(--label-height) + var(--container-height));
  box-sizing: border-box;
  position: relative;
  display: flex;
  background-color: var(--clr-secondary-light);
  border: 2px solid var(--clr-secondary-dim);
  border-radius: var(--s);
	bottom: calc(var(--container-height) + var(--container-width) * 2 - var(--s));
  animation: fadeIn var(--tt-short);
  @keyframes fadeIn { from { opacity: 0; } };
`;

const SliderContainer = styled.div`
  width: var(--slider-height);
  height: var(--slider-width);
  transform: rotate(-0.25turn);
  margin: auto var(--xs) auto auto;
  position: absolute;
  left: calc(-2px + (var(--container-width) - var(--slider-height)) / 2);
  top: calc(var(--label-height) + (var(--container-height) - var(--slider-width)) / 2);
  opacity: 0.7;
  &:hover {
    opacity: 1;
  }
`;

const Slider = styled.input`
  appearance: none;
  position: absolute;
  width: 100%;
  height: var(--slider-width);
  margin: 0;
  background: #0000;
  outline: none;
  transition: opacity var(--tt-short);
  &::-webkit-slider-thumb,
  &::-moz-range-thumb {
    appearance: none;
    width: var(--thumb-size); 
    height: var(--thumb-size); 
    border-radius: 100%;
    background: var(--clr-primary-dim);
  }
`;

const SliderBody = styled.div`
  position: absolute;
  width: 100%;
  height: var(--slider-width);
  border-radius: calc(var(--slider-width) / 2);
  background: #ddd;
`;

const SliderFill = styled.div<{value: number}>`
  position: absolute;
  width: ${(props) => props.value}%;
  height: var(--slider-width);
  border-radius: calc(var(--slider-width) / 2);
  background-color: var(--clr-primary);
`;

const Container = styled.div`
  --slider-width: 8px;
  --slider-height: 200px;
  --thumb-size: 24px;
  --label-height: 30px;
  --container-width: 50px;
  --container-height: 220px;
  width: var(--container-width);
  height: var(--container-width);
  position: fixed;
	padding-top: var(--s);
	bottom: var(--s);
	right: var(--s);
  z-index: 0;
  & > ${SliderOuterContainer} { display: none; }
  &:hover > ${SliderOuterContainer},
  &:focus-within > ${SliderOuterContainer} { display: block; }
`;

const Volume = () => {
  const config = useContext(configContext);
  const setConfig = useContext(setConfigContext);

  const handleVolumeChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseInt(e.target.value) / 100;
    setConfig({ ...config, volume: vol });
  };

  const sliderValue = Math.round(config.volume * 100);

  return (
    <Container tabIndex={0}>
      <Icon
        src={`${vicon}`}
      />
      <IconLabel>{sliderValue}</IconLabel>
      <SliderOuterContainer>
        <SliderLabel as="label" htmlFor="volume-slider-container">{sliderValue}</SliderLabel>
        <SliderContainer id="volume-slider-container">
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
      </SliderOuterContainer>
    </Container>
  );
}

export default Volume;

import React, { useState, useEffect, useRef } from "react";

import styled from 'styled-components';
import vicon from '@/public/images/volume.svg';
import '@/utils/styles.css';
import { Line } from '@/utils/styles';

type Props = {
  volume: number,
  setVolume: React.Dispatch<React.SetStateAction<number>>,
}

const Container = styled.div`
  --slider-width: 8px;
  --slider-height: 200px;
  --thumb-size: 24px;
  --label-height: 30px;
  --container-width: 50px;
  --container-height: 220px;
  width: var(--container-width);
  height: var(--container-width);
  position: relative;
  z-index: 0;
`;

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
  top: 19px;
  z-index: 1;
`;

const SliderLabel = styled(Line)`
  text-align: center;
  width: 100%;
  height: var(--label-height);
  font-size: 1.25em;
  padding-top: 6px;
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
  -webkit-transition: .2s;
  transition: opacity .2s;
  &::-webkit-slider-thumb {
    appearance: none;
    width: var(--thumb-size); 
    height: var(--thumb-size); 
    border-radius: 100%;
    background: var(--clr-primary-dim); 
    cursor: pointer; 
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

const Volume = ({ volume, setVolume } : Props) => {
  const [active, setActive] = useState<boolean>(false);
  const handleVolumeChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseInt(e.target.value) / 100;
    setVolume(vol);
  }

  const containerRef = useRef<HTMLDivElement>(null);

  const sliderValue = Math.round(volume * 100);

  const handleUnfocus = (e : FocusEvent) => {
    const container = containerRef.current;
    if (!container) { return; }
    if (container.contains(e.relatedTarget as Node) || !document.hasFocus()) { return; }
    setActive(false);
  };
  const handleClickOutside = (e : MouseEvent) => {
    const container = containerRef.current;
    if (!container) { return; }
    if (container.contains(e.target as Node)) { return; }
    setActive(false);
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('focusout', handleUnfocus);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('focusout', handleUnfocus);
    };
  }, []);

  return (
    <Container ref={containerRef}>
      <Icon
        src={`${vicon}`}
        onClick={() => setActive(a => !a)}
      />
      <IconLabel>{sliderValue}</IconLabel>
      {active ?
        <SliderOuterContainer>
          <SliderLabel as="label" htmlFor="slider-container">{sliderValue}</SliderLabel>
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
        </SliderOuterContainer>
        : null}
    </Container>
  );
}

export default Volume;

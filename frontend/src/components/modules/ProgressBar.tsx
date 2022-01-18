import React, { useState, useEffect } from 'react'

import styled, { css } from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

type BarStyle = {
  width?: number,
  height?: number,
  baseColor?: string,
  fillColor?: string,
}

type Props = {
  startTime: number,
  endTime: number,
  barStyle?: BarStyle,
};

const Container = styled.div<BarStyle>`
  ${(props) => css`
    width: ${props.width ?? '100%'};
    height: ${props.height ?? 'var(--xs)'};
    background-color: ${props.baseColor ?? 'var(--clr-medgrey)'};
  `}
  display: flex;
`;

type FillProps = {progress: number, color?: string};
const ProgressFill = styled.div.attrs<FillProps>(({progress, color}) => ({
  style: {
    'width': `${progress * 100}%`,
    'backgroundColor': color ?? 'var(--clr-primary)',
  },
}))<FillProps>`
  height: 100%;
`;

const ProgressBar = ({ startTime, endTime, barStyle }: Props) => {
  const [currTime, setCurrTime] = useState<number>();
  
  useEffect(() => {
    if (!startTime) { return; }
    const intervalId = setInterval(() => {
      if (startTime) { setCurrTime(new Date().getTime() - startTime); }
    }, 50);
    return () => { clearInterval(intervalId); }
  }, [startTime]);

  if (!startTime || !currTime) { return null; }

  const duration = endTime - startTime;

  return (
    <Container {...barStyle}>
      <ProgressFill 
        progress={currTime / duration} 
        color={barStyle ? barStyle.fillColor : undefined}
      />
    </Container>
  );
}

export default ProgressBar;

import React, { useState, useEffect } from 'react'

import styled from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

type Props = {
  startTime: number,
  endTime: number,
};

const Container = styled.div`
  width: 200px;
  height: var(--xs);
  background-color: var(--clr-medgrey);
  display: flex;
`;

const ProgressFill = styled.div.attrs<{progress: number}>((props) => ({
  style: { width: `${props.progress * 100}%` },
}))<{progress: number}>`
  height: var(--xs);
  background-color: var(--clr-primary);
`;

const ProgressBar = ({ startTime, endTime }: Props) => {
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
    <>
      <p>Current time: { currTime }</p>
      <p>Duration: { duration }</p>
      <Container>
        <ProgressFill progress={currTime / duration} />
      </Container>
    </>
  );
}

export default ProgressBar;

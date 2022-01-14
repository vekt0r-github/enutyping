import React from 'react'

type Props = {
  currentTime: number,
  duration: number,
};

const ProgressBar = ({ currentTime, duration }: Props) => {
  return (
    <>
      <p style={{color: "white"}}>Current time: { currentTime }</p>
      <p style={{color: "white"}}>Duration: { duration }</p>
    </>
  );
}

export default ProgressBar;

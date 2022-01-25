import React  from "react";

import styled from 'styled-components';
import '@/utils/styles.css';
import { Line, Link, Sidebar } from '@/utils/styles';

type Props = {
  title: string,
  artist: string,
  source: string,
  diffname?: string | JSX.Element,
  kpm?: number,
};

const MapInfoDisplay = ({ title, artist, diffname, kpm, source } : Props) => {
  return (
    <Sidebar>
      <h2>Map info and stats etc.</h2>
      <Line>Title: {title}</Line>
      <Line>Artist: {artist}</Line>
      <Line>Difficulty level: {diffname}</Line>
      <Line>Average KPM: {kpm}</Line>
      <Line>Difficulty rating: @sampai</Line>
      {source.length ? 
        <Link as="a" href={source}>Link to source video (YouTube)</Link>
        : <Line>Source link not set</Line>}
    </Sidebar>
  );
}

export default MapInfoDisplay;

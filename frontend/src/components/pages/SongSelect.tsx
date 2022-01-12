import React, { useEffect, useState }  from "react";
import { Navigate } from "react-router-dom";

import { get, post } from "@/utils/functions";
import { User, Beatmap } from "@/utils/types";

import styled, { css } from 'styled-components';
import '@/utils/styles.css';
import { MainBox, Link } from '@/utils/styles';

type Props = {
  user: User,
};

const SongSelect = ({ user } : Props) => {
  if (!user) { // include this in every restricted page
    return <Navigate to='/login' replace={true} />
  }

  const [maps, setMaps] = useState<[Beatmap]>();
  
  useEffect(() => {
    get("/api/beatmaps").then((beatmaps) => {
      if (beatmaps && beatmaps.length) {
        setMaps(beatmaps);
      }
    });
  }, []);

  const testMaps = [{ // testing
    id: 727,
    artist: "Nanahira",
    title: "Nanahira singing from the window to a fucking van",
    source: "https://www.youtube.com/watch?v=9USxPiJzdv0",
  }];
  
  return (
    <>
      <h1>Song Select</h1>
      {testMaps?.map((map) => 
        <MainBox>
          <p>{map.artist} - {map.title}</p>
          <p>ID: {map.id}</p>
          <p>Source: {map.source}</p>
          <Link to={`/play/${map.id}`}>osu!</Link>
        </MainBox>
      )}
    </>
  );
}

export default SongSelect;

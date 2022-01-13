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
    get("/api/beatmaps").then((res) => {
      const beatmaps = res.beatmaps;
      if (beatmaps && beatmaps.length) {
        setMaps(beatmaps);
      }
    });
  }, []);
  
  return (
    <>
      <h1>Song Select</h1>
      {maps?.map((map) => 
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

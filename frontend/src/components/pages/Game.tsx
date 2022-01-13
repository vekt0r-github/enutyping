import React, { useEffect, useState }  from "react";
import { Navigate, useParams } from "react-router-dom";

import GameArea from "@/components/modules/GameArea";

import { get, post } from "@/utils/functions";
import { User, Beatmap } from "@/utils/types";

import styled, { css } from 'styled-components';
import '@/utils/styles.css';
import { MainBox, Link } from '@/utils/styles';

type Props = {
  user: User,
};

const PageContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
`;

const Game = ({ user } : Props) => {
  if (!user) { // include this in every restricted page
    return <Navigate to='/login' replace={true} />
  }

  const { mapId } = useParams();

  const [mapData, setMapData] = useState<Beatmap>();
  
  useEffect(() => {
    get(`/api/beatmaps/${mapId}`).then((beatmapData) => {
      if (beatmapData && beatmapData.id) {
        setMapData(beatmapData);
      }
    });
  }, []);

  const testMap = {
    id: 727,
    artist: "Nanahira",
    title: "Nanahira singing from the window to a fucking van",
    source: "https://www.youtube.com/watch?v=9USxPiJzdv0",
    content: content,
  };
  const objects = testMap.content.split(/\r?\n/);
  const map = testMap;
  
  return (
    <>
      <h1>{map.artist} - {map.title}</h1>
      <PageContainer>
        <MainBox>
          <h2>Map info and stats etc.</h2>
          <p>{map.artist} - {map.title}</p>
          <p>ID: {map.id}</p>
          <p>Source: {map.source}</p>
        </MainBox>
        <GameArea
          user={user}
          beatmap={map}
        />
        <MainBox>
          <h2>Leaderboard</h2>
          <ul>
            <li>sampai_: 727</li>
            <li>Erik Demaine: 69</li>
          </ul>
        </MainBox>
      </PageContainer>
    </>
  );
}

export default Game;

const content = `
L,500,ぷるーん
S,500,ぷ
S,544,るーん
L,2617,わらび餅　ぷり
S,2617,わ
S,3014,ら
S,3279,び
S,5264,も
S,5419,ち
S,5838,ぷ
S,5970,り
L,6566,わらび餅　ぷるぷるぷるぷるぷるとした
S,6566,わ
S,6764,ら
S,6985,び
S,7205,も
S,7536,ち
S,8852,ぷ
S,8911,る
S,9102,ぷ
S,9168,る
S,9367,ぷ
S,9433,る
S,9632,ぷ
S,9698,る
S,9985,ぷ
S,10051,る
S,10360,とし
S,10558,た
L,11330,冷たい
S,11330,つ
S,11463,め
S,11595,たい
L,12786,わらび餅はいかがですか
S,12786,わ
S,12897,ら
S,13007,び
S,13117,も
S,13227,ち
S,13338,は
S,13779,い
S,13889,か
S,13999,が
S,14110,です
S,14286,か
L,14794,ぷりぷりぷりぷりぷりぷりーん
S,14794,ぷ
S,14838,り
S,15014,ぷ
S,15058,り
S,15235,ぷ
S,15279,り
S,15433,ぷ
S,15477,り
S,15654,ぷ
S,15698,り
S,15985,ぷ
S,16029,りーん
E,18014
`;
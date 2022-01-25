import React from "react";

import { User } from "@/utils/types";

import '@/utils/styles.css';
import { Navigate } from "react-router-dom";

type Props = {
  user: User | null,
};

const Home = ({ user } : Props) => {
  if (user) {
    return <Navigate to="/play" replace={true} />
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', maxWidth: '60vw', alignItems: 'center' }}>
        <div style={{ gridColumn: 1}}>
          <>
            <h1>Type your favorite songs as you listen</h1>
            <p>I love Yorushika</p>
          </>
        </div>
        <div style={{ gridColumn: 2}}>
          <img width="600" height="600" src="https://cdn.discordapp.com/attachments/576471113069101078/935427255897833592/unknown.png" />
        </div>
      </div>
    </>
  );
}

export default Home;

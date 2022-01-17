import React from "react";

import styled from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

type Props = {
  yt_id: string,
  width: number, // in px
  height: number, 
};

const Thumbnail = styled.img<{
  width: number,
  height: number,
}>`
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  object-fit: contain;
`;

const YTThumbnail = ({ yt_id, width, height } : Props) => {
  let quality = ""; 
  if (width > 120 && height > 90) {
    quality = "hq"; // mq thumbnails are 16:9; don't use
  }
  return (
    <Thumbnail 
      src={`http://img.youtube.com/vi/${yt_id}/${quality}default.jpg`}
      width={width}
      height={height}
    />
  );
};

export default YTThumbnail;

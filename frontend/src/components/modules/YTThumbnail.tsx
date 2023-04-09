import React from "react";

import '@/utils/styles.css';
import { Thumbnail } from '@/utils/styles';

type Props = {
  yt_id: string,
  width: number, // in px
  height: number, 
};

const YTThumbnail = ({ yt_id, width, height } : Props) => {
  let quality = ""; 
  if (width > 120 && height > 90) {
    quality = "hq"; // mq thumbnails are 16:9; don't use
  }
  return (
    <Thumbnail 
      src={yt_id ? `http://img.youtube.com/vi/${yt_id}/${quality}default.jpg` : ''}
      width={width}
      height={height}
    />
  );
};

export default YTThumbnail;

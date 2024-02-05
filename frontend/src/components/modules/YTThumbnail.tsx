import React from "react";

import '@/utils/styles.css';
import { Thumbnail } from '@/utils/styles';

type Props = {
  yt_id: string,
  width: number, // in px
  height: number, 
};

const YTThumbnail = ({ yt_id, width, height } : Props) => {
  let quality = ""; // 4:3 thumbnail
  if (width/height > 1.5) { // more like 16:9 than 4:3
    quality = "mq"; // 16:9 thumbnail
  } else if (width > 120 && height > 90) {
    quality = "hq"; // 4:3 thumbnail
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

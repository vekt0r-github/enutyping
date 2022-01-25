import React from "react";
import YouTube from "@u-wave/react-youtube";

import YTThumbnail from "@/components/modules/YTThumbnail";

import styled, { css } from 'styled-components';
import '@/utils/styles.css';
import {} from '@/utils/styles';

type Props = {
  yt_id: string,
  show: boolean,
  volume: number,
  options: React.ComponentPropsWithoutRef<typeof YouTube>,
}

const VideoContainer = styled.div`
  width: calc(var(--game-width) / 2);
  height: calc(var(--game-height) / 2);
  position: relative;
`;

const Video = styled(YouTube)<{show: boolean}>`
  pointer-events: none;
  position: absolute;
  z-index: 0;
  ${(props) => !props.show ? css`
    display: none
  ` : ''};
`;

const Overlay = styled(YTThumbnail)`
  position: absolute;
  z-index: 1;
`;

const YTVideo = ({ yt_id, show, volume, options } : Props) => {
  // if (!yt_id) { return null; }
  return (
    <VideoContainer>
      <Video
        {...options}
        video={yt_id}
        show={show}
        width={400}
        height={300}
        volume={volume}
        paused={false}
        showCaptions={false}
        controls={false}
        disableKeyboard={true}
        allowFullscreen={false}
        annotations={false}
        modestBranding={true}
        playsInline={true}
        showRelatedVideos={false}
      />
      {!show ? 
        <Overlay yt_id={yt_id} width={400} height={300} />
        : null}
    </VideoContainer>
  );
}

export default YTVideo;

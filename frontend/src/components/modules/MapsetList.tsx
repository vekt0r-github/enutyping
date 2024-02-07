import React, { useContext, useEffect, useState }  from "react";

import ConfirmPopup from "@/components/modules/ConfirmPopup";
import YTThumbnail from "@/components/modules/YTThumbnail";

import { Beatmapset, MapID, MapsetID, Score, User, getModCombo, rankColors } from "@/utils/types";

import { getL10nFunc, getL10nElementFunc } from '@/providers/l10n';
import { Config, configContext } from '@/providers/config';

import { getArtist, getTitle, getSetAvg } from "@/utils/beatmaputils";

import styled, { StyledComponentProps } from 'styled-components';
import '@/utils/styles.css';
import { MainBox, SubBox, Link, Line, BlackLine, Thumbnail, RankDisplay } from '@/utils/styles';
import { get, httpDelete } from "@/utils/functions";
import { getRank } from "@/utils/gameplayutils";

type Props = {
  user: User | null,
  getBeatmapsets?: () => void,
  mapsets: Beatmapset[],
  includeMapsetCreate: boolean,
  includeMapCreate: boolean,
  onObjectClick?: (mapsetId: MapsetID, mapId?: MapID) => void
  link?: (mapsetId: MapsetID, mapId?: MapID) => string
};

const SetLink = styled(MainBox)`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  color: var(--lavender);
  display: flex;
  box-sizing: border-box;
`;

const DiffsContainer = styled.div`
  width: 100%;
  z-index: 1;
`;

const Diff = styled(SubBox)<{color: string, changeHeight?: boolean}>`
  background-color: ${({color}) => `var(--clr-${color})`};
  display: flex;
  align-items: center;
  width: 100%;
  height: 32px;
  padding: var(--xs) var(--s);
  & + &, & + div { margin-top: var(--xs); } /* clap point stupid */
  box-sizing: border-box;
  transition: var(--tt-short);
  z-index: 1;
  &:hover {
    background-color: ${({color}) => `var(--clr-${color}-light)`};
    cursor: pointer;
    ${({changeHeight}) => changeHeight ? "height: auto;" : ''}
    & ${Line} {
      overflow: visible;
      white-space: normal;
    }
  }
`;

const DiffRankDisplay = styled(RankDisplay)`
  position: absolute;
  font-size: 2.4rem;
  left: 18px;
`;

const DiffRightSide = styled.span`
  display: block;
  margin-left: var(--s);
  width: calc(100% - 32px); // why does my life have to be like this
`;

const HoverContainer = styled(MainBox)`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background-color: var(--clr-primary);
  display: flex;
  cursor: pointer;
  transition: var(--tt-long);
  & > ${DiffsContainer} { display: none; }
`;

const SongBox = styled(MainBox)`
  height: 90px;
  min-width: 360px;
  max-width: 480px;
  margin: var(--s);
  box-sizing: content-box;
  position: relative;
  &:hover, &:focus {
    z-index: 1;
    & > ${HoverContainer} {
      padding-top: calc(90px + 2*var(--s));
      background-color: var(--clr-primary-light);
      height: fit-content;
      & > ${DiffsContainer} { display: block; }
    }
  }
`;

const NewMapBox = styled(SongBox)`
  background-color: var(--clr-create-map);
  display: flex;
  justify-content: center;
  align-items: center;
  color: black;
  transition: var(--tt-short);
  &:hover, &:focus {
    background-color: var(--clr-create-map-light);
    color: black;
  }
`;

const NewMapsetBox = styled(NewMapBox)`
  background-color: var(--clr-create-mapset);
  &:hover, &:focus {
    background-color: var(--clr-create-mapset-light);
  }
`;

const Info = styled.div`
  margin-left: var(--s);
  min-width: 0;
`;

type TargetProps = {
  as?: React.ComponentType,
  to?: string,
  onClick?: () => void,
}

const MapsetList = ({ user, getBeatmapsets, mapsets, includeMapsetCreate, includeMapCreate, onObjectClick, link } : Props) => {
  const text = getL10nFunc();
  const elem = getL10nElementFunc();
  const config = useContext(configContext);

  const [userScores, setUserScores] = useState<Score[]>([]);

  const submittedRankOn = (mapId: number) => {
    let bestScore = 0;
    let bestRank = null;
    for (const score of userScores) {
      if (score.beatmap_id === mapId && score.score > bestScore) {
        bestScore = score.score;
        bestRank = getRank(score.score, score.speed_modification, getModCombo(score.mod_flag));
      }
    }
    return bestRank;
  }

  useEffect(() => {
    if (!user) return;
    get(`/api/users/${user.id}`).then((res) => {
      if (!res || !res.user) {
        return;
      } else {
        setUserScores(res.scores);
      }
    });
  }, []);

  const handleDeleteBeatmapset = async (mapsetId: number) => {
    const res = await httpDelete(`/api/beatmapsets/${mapsetId}`);
    if (res && res.success && getBeatmapsets) {
      getBeatmapsets();
    }
  };

  const makeTargetProps = (mapsetId: MapsetID, mapId?: MapID) => {
    let props: TargetProps = link ? {
      as: Link,
      to: link(mapsetId, mapId),
    } : {}
    if (onObjectClick) props = {...props, onClick: () => onObjectClick(mapsetId, mapId)}
    return props;
  }

  return (
    <>
      {/* optional create buttons come first */}
      {includeMapsetCreate ?
        <NewMapsetBox {...makeTargetProps("new")}>
          <Line size="6em" margin="-5px 20px 0 0">+</Line>
          <BlackLine as="h2" size="1.5em">{text(`menu-mapset-new`)}</BlackLine>
        </NewMapsetBox> : null}
      {includeMapCreate ? 
        <NewMapBox {...makeTargetProps("new", "new")}>
          <Line size="6em" margin="-5px 20px 0 0">+</Line>
          <BlackLine as="h2" size="1.5em">{text(`menu-map-new`)}</BlackLine>
        </NewMapBox> : null}
      {/* next, the actual beatmaps */}
      {mapsets?.map((mapset) => {
        const {icon_url, owner, beatmaps} = mapset;
        const mapCount = beatmaps.length;
        return (
          <SongBox key={mapset.id}>
            <HoverContainer>
              <SetLink {...makeTargetProps(mapset.id)}>
                <Thumbnail src={icon_url} width={120} height={90} />
                <Info>
                  <Line size='1.25em' as='h2' margin="0">{mapset.name}</Line>
                  <Line size='1em' margin="0">{mapset.description}</Line>
                  <Line size='0.8em' margin="0">{text(`menu-mapset-owner`, {owner: owner.name})}</Line>
                  <Line size='0.8em' margin="0">{text(`menu-mapset-mapcount`, {mapCount})} | {text(`menu-mapset-kpm`, {kpm: Math.round(getSetAvg(mapset, 'kpm'))})}</Line>
                </Info>
              </SetLink>
              <DiffsContainer>
                {/* the actual diffs come first here */}
                {beatmaps.map((map) => {
                  const rank = submittedRankOn(map.id);
                  return (
                    <Diff {...makeTargetProps(mapset.id, map.id)}
                      color={"secondary"}
                      changeHeight={true}
                      key={map.id}
                    >
                      <YTThumbnail yt_id={map.yt_id} width={32} height={24} />
                      <DiffRightSide>
                        <Line size="1em" margin="0">{text(`menu-map-display`, {
                          artist: getArtist(map, config),
                          title: getTitle(map, config),
                          diffname: map.diffname,
                          kpm: Math.round(map.kpm ?? 0),
                        })}</Line>
                      </DiffRightSide>
                      {rank ? <DiffRankDisplay color={rankColors[rank]}>{rank}</DiffRankDisplay> : null}
                    </Diff>
                  )
                })}
                {/* then optional create diff buttons */}
                {includeMapCreate ? <>
                  <Diff {...makeTargetProps(mapset.id, "new")}
                    color={"create-map"}
                    key={"new"}
                  >
                    <BlackLine size="2.5em" margin="-1.5px 8px 0 0">+</BlackLine>
                    <BlackLine size="1em">{text(`menu-map-new-diff`)}</BlackLine>
                  </Diff>
                  <ConfirmPopup 
                    button={<Diff color="warn">
                    <BlackLine size="2.5em" margin="-8px 14px 0 5px">-</BlackLine>
                      <BlackLine size="1em">{text(`menu-mapset-delete`)}</BlackLine>
                    </Diff>}
                    warningText={
                      elem((<></>), `menu-warning-mapset-delete`, {
                        elems: {
                          Line: <Line size="1.25em" margin="1em 0 0 0"/>,
                          BigLine: <Line size="1.75em" margin="1em 0 0.5em 0"/>,
                        },
                        vars: {
                          name: mapset.name,
                          mapCount: mapCount,
                        }
                      })
                    }
                    onConfirm={() => handleDeleteBeatmapset(mapset.id)}
                  />
                </> : null}
              </DiffsContainer>
            </HoverContainer>
          </SongBox>
        );
      })}
    </>
  );
}

export default MapsetList;

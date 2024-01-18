import React, { useState, useContext } from "react";
import { Navigate } from "react-router-dom";

import GameVideo from "@/components/modules/GameVideo";
import GameLine from "@/components/modules/GameLine";
import { InfoDisplay, InfoPair } from "@/components/modules/InfoDisplay";

import { getL10nFunc } from '@/providers/l10n';
import { configContext } from '@/providers/config';

import { 
  User, Beatmap, GameStatus, GameState, ModCombo,
} from "@/utils/types";
import { computeLineKPM, computeLineKeypresses, getVisualPosition, timeToLineIndex } from '@/utils/beatmaputils';
import { getScoreMultiplier, makeUpdateGameState } from "@/utils/gameplayutils";

import styled from 'styled-components';
import '@/utils/styles.css';
import { SubBox, Line } from '@/utils/styles';

type Props = {
  user: User | null,
  beatmap: Beatmap, 
  gameState: GameState, // data in gameState.lines is a superset of beatmap.lines
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
	setAvailableSpeeds: React.Dispatch<React.SetStateAction<number[]>>, // available speeds pulled from YT
	speed: number,
  modCombo: ModCombo,
  modSelectComponent?: JSX.Element, // hacky fix to place this
};

export const GameContainer = styled.div`
  width: var(--game-width);
  height: var(--game-height);
  min-width: var(--game-width);
  min-height: var(--game-height);
  margin: var(--s);
  padding: 0;
  background-color: var(--clr-primary-light);
  position: relative;
`;

const TopHalf = styled.div`
  width: 100%;
  height: 50%;
  position: absolute;
  left: 0;
  top: 0;
`;

const LyricLine = styled.div<{opacity: number}>`
  font-size: 1.5em;
  color: black;
  width: 100%;
  text-align: center;
  opacity: ${({opacity}) => opacity};
`;

export const BottomHalf = styled(TopHalf)`
  top: 50%;
  display: flex;
`;

// used as the two boxes bordering video
export const StatBox = styled(SubBox)`
  flex-basis: 0;
  flex-grow: 1;
  width: calc(200px - 2*var(--s)); // to fit nicely
  height: 300px;
  margin: var(--s);
	margin-top: 0;
	padding: var(--xs);
  box-sizing: border-box;
`;

const ResultsContainer = styled.div`
	display: flex;
	flex-direction: column;
	position: absolute;
  background-color: var(--clr-primary-light);
	width: calc(100% - 2*var(--s));
	height: calc(100% - 2*var(--s));
  padding: var(--s);
  box-sizing: content-box;
	align-items: center;
	justify-content: space-between;
`;

export const Overlay = styled.div`
  width: 100%;
  height: 100%;
  /* padding-bottom: calc(var(--game-height) / 3); */
  box-sizing: border-box;
  position: absolute;
  left: 0;
  top: 0;
  background-color: var(--clr-overlay);
  color: var(--white);
  display: flex;
  flex-direction: column;
  justify-content: center;
  & ${Line} {
    width: 100%;
    text-align: center;
  }
  & > ${Line} {
    font-style: italic;
  }
`;

const OffsetInput = styled.input`
  font-size: 1em;
  font-family: "Open Sans";
`;

const Warning = styled.div`
  background-color: var(--clr-warn);
  padding: var(--s) 0;
`;

// computation and component utils
const acc = ((hitCount: number, missCount: number) => {
  if (hitCount + missCount == 0) {
    return 100;
  }
  return 100 * hitCount / (hitCount + missCount);
});

type ComputedStats = GameState["stats"] & {
  currentKPM: number;
  keyAcc: string;
  kanaAcc: string;
};

const getComputedStats = (time: number | undefined, {lines, stats}: GameState): ComputedStats => {
  const {hits, misses, kanaHits, kanaMisses} = stats;
  let drainTime: number = 0;
  if (time) {
    for (const {line} of lines) {
      if (computeLineKeypresses(line) === 0) { continue; }
      if (line.endTime > time) {
        drainTime += Math.max(time - line.startTime, 0);
        break;
      }
      drainTime += (line.endTime - line.startTime);
    };
  }
  const currentKPM = drainTime ? (Math.round(hits * 60000 / drainTime)) : 0;
  const keyAcc = acc(hits, misses).toFixed(2);
  const kanaAcc = acc(kanaHits, kanaMisses).toFixed(2);
  return {...stats, currentKPM, keyAcc, kanaAcc};
}

const IngameStatsDisplay = InfoDisplay("", 
  ({keyAcc, kanaAcc, score, currentKPM} : ComputedStats) : InfoPair[] => {
    return [
      [`game-stats-key-acc`, keyAcc],
      [`game-stats-kana-acc`, kanaAcc],
      [`game-stats-score`, Math.round(score)],
      [`game-stats-kpm`, currentKPM],
    ]
  }
);

type IngameMapStatsDisplayProps = {
  beatmap: Beatmap;
  lineIndex: number | null;
  speedMultiplier: number;
}
const IngameMapStatsDisplay = InfoDisplay("", 
  ({beatmap, lineIndex, speedMultiplier}: IngameMapStatsDisplayProps) : InfoPair[] => {
    const lineKPM = (lineIndex === null) ? "N/A" :
      (Math.round(computeLineKPM(beatmap.lines[lineIndex]) * speedMultiplier))
    return [
      [`game-map-stats-kpm`, Math.round((beatmap.kpm ?? 0) * speedMultiplier)],
      [`game-map-stats-line-kpm`, lineKPM],
    ]
  }
);

const FinalStatsDisplay = InfoDisplay("", 
  ({hits, misses, kanaHits, kanaMisses, keyAcc, kanaAcc, score, currentKPM} : ComputedStats) : InfoPair[] => {
    return [
      [`game-stats-correct-keys`, hits],
      [`game-stats-incorrect-keys`, misses],
      [`game-stats-kana-typed`, kanaHits],
      [`game-stats-kana-missed`, kanaMisses],
      [`game-stats-key-acc`, keyAcc],
      [`game-stats-kana-acc`, kanaAcc],
      [`game-stats-kpm`, currentKPM],
    ]
  }
);


const GameAreaDisplay = ({ user, beatmap, gameState, setGameState, setAvailableSpeeds, speed, modCombo, modSelectComponent } : Props) => {
  const config = useContext(configContext);
  const text = getL10nFunc();

  const { volume, useKanaLayout } = config;

  const [offset, setOffset] = useState<number>(0);
  const totalOffset = offset + config.offset;

  const {status, currTime, lines, stats} = gameState;
	const adjustedTime = currTime ? currTime * speed : currTime;
  const computedStats = getComputedStats(adjustedTime, gameState);
  const currIndex = (adjustedTime !== undefined) ? timeToLineIndex(beatmap.lines, adjustedTime) : undefined;
  const lineState = currIndex !== undefined ? lines[currIndex] : undefined;

  const startGame = (offset: number) => {
    if (status !== GameStatus.STARTQUEUED) { return; }
    setGameState((state) => ({ ...state,
      status: GameStatus.PLAYING,
      offset: offset,
    }));
  };
  
  if (status === GameStatus.GOBACK) {
    return <Navigate to={`/play`} replace={true} />;
  }

  const isActive = [GameStatus.PLAYING, GameStatus.PAUSED, GameStatus.AUTOPLAYING].includes(status) &&
    (adjustedTime !== undefined) && (currIndex !== undefined) && (currIndex > -1) && (currIndex < lines.length);
  const isPlayingGame = isActive && status === GameStatus.PLAYING;

  const scoreMultiplier = getScoreMultiplier(speed, modCombo);
  const updateGameState = makeUpdateGameState(useKanaLayout, scoreMultiplier);

  const handleKeyPress = (e: KeyboardEvent) => {
    if (["Escape"].includes(e.key)) { return; } // GameArea is handling it
    if ([GameStatus.PAUSED, GameStatus.AUTOPLAYING].includes(status)) { return; }
    if (lineState === undefined || adjustedTime === undefined) { return; }
    if (lineState.syllables.length === 0) { return; }
    setGameState((state) => updateGameState(state, e.key, adjustedTime));
  };

  // IMPLEMENTATION OF HIDDEN (for lyric line)
  const fadingInterval = 0.4
  const fadingCompletionTime = 0.4
  const currTimeRatio = lineState ? getVisualPosition(adjustedTime ?? 0, lineState.line) : 0;
  const lyricOpacity = (fadingCompletionTime - currTimeRatio) / fadingInterval;

  return (
    <GameContainer>
				<> 
					<TopHalf>
						{isActive ? <>
							<GameLine // current line
								key={currIndex}
								currTime={adjustedTime}
								lineState={lineState!}
								keyCallback={handleKeyPress}
                isPlayingGame={isPlayingGame}
                modCombo={modCombo}
							/>
							<LyricLine
                opacity={modCombo.hidden
                  ? Math.min(Math.max(lyricOpacity, 0), 1)
                  : 1}>{lineState!.line.lyric}</LyricLine>
						</> : null}
						{status === GameStatus.SUBMITTING ?
							<h2>{text(`game-submitting`)}</h2>
							: null}
					</TopHalf>
					<BottomHalf>
						<StatBox>
              <IngameStatsDisplay {...computedStats} />
						</StatBox>
						<GameVideo
							yt_id={beatmap.yt_id}
							status={status}
							currTime={adjustedTime}
							startGame={() => startGame(totalOffset)}
							setAvailableSpeeds={setAvailableSpeeds}
							speed={speed}
							volume={volume}
						/>
						<StatBox>
              <IngameMapStatsDisplay
                beatmap={beatmap}
                lineIndex={isPlayingGame ? currIndex : null}
                speedMultiplier={speed}
              />
						</StatBox>
					</BottomHalf>
					{status === GameStatus.UNSTARTED ? 
						<Overlay>
							{!user && <>
								<Warning>
									<Line size="1.5em" margin="0 0 0.5em 0">{text(`game-start-warning-login`)}</Line>
								</Warning>
							</>}
							<Line size="1.5em" margin="0">{text(`game-start-message-header`)}</Line>
							<Line size="1em" margin="0">{text(`game-start-message-subheader`)}</Line>
							<Line size="1em" margin="0.5em 0 0 0">{text(`game-start-offset`)}
								<OffsetInput size={3} defaultValue={offset} onChange={(e) => {
									const intValue = parseInt(e.target.value)
									if (!isNaN(intValue)) { setOffset(intValue); }
								}}></OffsetInput>
							</Line>
							<Line size="1em" margin="0">{text(`game-start-offset-desc`)}</Line>
              {modSelectComponent ? modSelectComponent : null}
						</Overlay>
						: null}
					{status === GameStatus.ENDED ?
						<ResultsContainer>
							<h1><u>{text(`game-results-header`)}</u></h1>
							<h1>{text(`game-results-score`, {score: Math.round(stats.score)})}</h1>
							<FinalStatsDisplay {...computedStats} />
						</ResultsContainer>
						: null} 

				</>
    </GameContainer>
  );
}

export default GameAreaDisplay;

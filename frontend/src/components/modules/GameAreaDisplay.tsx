import React, { useState, useContext } from "react";
import { Navigate } from "react-router-dom";
import { Localized } from "@fluent/react";

import GameVideo from "@/components/modules/GameVideo";
import GameLine from "@/components/modules/GameLine";
import { InfoDisplay, InfoPair } from "@/components/modules/InfoDisplay";

import { getL10nFunc } from '@/providers/l10n';
import { Config, configContext } from '@/providers/config';

import { 
  User, Beatmap, LineData,
  GameStatus, GameState, LineState, KanaState,
} from "@/utils/types";
import { computeLineKPM, makeSetFunc, timeToLineIndex, timeToSyllableIndex, updateStatsOnKeyPress } from '@/utils/beatmaputils';

import styled from 'styled-components';
import '@/utils/styles.css';
import { SubBox, Line, InfoBox, InfoEntry } from '@/utils/styles';

type Props = {
  user: User | null,
  beatmap: Beatmap, 
  gameState: GameState, // data in gameState.lines is a superset of beatmap.lines
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
	setAvailableSpeeds: React.Dispatch<React.SetStateAction<number[]>>,
	speed: number,
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

const LyricLine = styled.div`
  font-size: 1.5em;
  color: black;
  width: 100%;
  text-align: center;
`;

export const BottomHalf = styled(TopHalf)`
  top: 50%;
  display: flex;
`;

export const StatBox = styled(SubBox)`
  flex-basis: 0;
  flex-grow: 1;
  height: 300px;
  margin: var(--s);
	margin-top: 0;
	padding-top: 0;
	padding-bottom: 0;
`;

const ResultsContainer = styled.div`
	display: flex;
	flex-direction: column;
	position: absolute;
  background-color: var(--clr-primary-light);
	width: 100%;
	height: 100%;
	align-items: center;
	justify-content: space-between;
`;

export const Overlay = styled.div`
  width: 100%;
  height: 100%;
  padding-bottom: calc(var(--game-height) / 3);
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

const getComputedStats = ({currTime, stats}: GameState): ComputedStats => {
  const {hits, misses, kanaHits, kanaMisses} = stats;
  const currentKPM = currTime ? (Math.round(hits * 60000 / currTime)) : 0;
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


const GameAreaDisplay = ({ user, beatmap, gameState, setGameState, setAvailableSpeeds, speed } : Props) => {
  const config = useContext(configContext);
  const text = getL10nFunc();

  const set = makeSetFunc(setGameState);

  const { volume, useKanaLayout } = config;

  const [offset, setOffset] = useState<number>(0);
  const totalOffset = offset + config.offset;

  const {status, currTime, lines, stats} = gameState;
  const computedStats = getComputedStats(gameState);
	const adjustedTime = currTime ? currTime * speed : currTime;
  const currIndex = (adjustedTime !== undefined) ? timeToLineIndex(beatmap.lines, adjustedTime) : undefined;
  const lineState = currIndex !== undefined ? lines[currIndex] : undefined;
  const setLineState = (makeNewLineState: (oldLineState: LineState) => LineState) => {
    if (currIndex === undefined) { return; }
    set('lines')((oldLines) => {
      oldLines[currIndex] = makeNewLineState(oldLines[currIndex]);
      return oldLines;
    });
  }

  const startGame = (offset: number) => {
    if (status !== GameStatus.STARTQUEUED) { return; }
    setGameState((state) => ({ ...state,
      status: GameStatus.PLAYING,
      offset: offset,
    }));
  };
  
  if (status === GameStatus.GOBACK) {
    return <Navigate to={`/play/${beatmap.beatmapset.id}`} replace={true} />;
  }

  const isActive = [GameStatus.PLAYING, GameStatus.PAUSED, GameStatus.AUTOPLAYING].includes(status) &&
    (adjustedTime !== undefined) && (currIndex !== undefined) && (currIndex > -1) && (currIndex < lines.length);
  const isPlayingGame = isActive && status === GameStatus.PLAYING;

  const scoreMultiplier = Math.pow(speed, 1/speed);

  const getKana = (sPos: number) : KanaState | undefined => {
    if (!lineState) { return; }
    const syllable = lineState.syllables[sPos];
    if (!syllable) { return; }
    return syllable.kana[syllable.position];
  }

  const updateKanaAffix = (key : string, sPos: number, useKanaLayout: boolean) : KanaState | undefined => {
    const curKana = getKana(sPos);
    if (!curKana) return;
    const {kana, prefix} = curKana;
    const newPrefix = prefix + key;
    const options = useKanaLayout ? kana.hiraganizations : kana.romanizations
    const filtered = options.filter(s => s.substring(0, newPrefix.length) == newPrefix);
    if (filtered.length == 0) { return; }
    const newSuffix = filtered[0].substring(newPrefix.length);
    return {...curKana, prefix: newPrefix, suffix: newSuffix};
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (["Escape"].includes(e.key)) { return; } // GameArea is handling it
    if ([GameStatus.PAUSED, GameStatus.AUTOPLAYING].includes(status)) { return; }
    if (lineState === undefined || currTime === undefined) { return; }
    if (lineState.syllables.length === 0) { return; }
    let sPos = lineState.position;
    const curKana = getKana(sPos);
    if (!curKana) return; // finished line or something

    const {line, syllables, nBuffer} = lineState ?? {};
    const key = useKanaLayout ? e.key : e.key.toLowerCase();
    const allowedCharacters = // idk if this is comprehensive
      "`1234567890-=qwertyuiop[]\\asdfghjkl;'zxcvbnm,./~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:\"ZXCVBNM<>?";
    if(!allowedCharacters.includes(key)) { return; }
    if(!useKanaLayout && key == "n" && nBuffer) {
      setLineState((s) => {
        s.nBuffer = null;
        s.syllables[nBuffer[0]].kana[nBuffer[1]].prefix += "n";
        return s;
      });
      return;
    }

    const latestActiveSyllable = timeToSyllableIndex(line.syllables, currTime) - 1;
    const error = currTime - syllables![sPos].time;

    const maybeNewKana = updateKanaAffix(key, sPos, useKanaLayout);
    let success = maybeNewKana !== undefined;
    let newKana = maybeNewKana ?? curKana;
    if (!success) { // key is not the next char; set newKana
      for (let newPos = sPos; newPos < latestActiveSyllable; ++newPos) { // try skipping syllables
        const testNewKana = updateKanaAffix(key, newPos, useKanaLayout);
        if (testNewKana) {
          sPos = newPos;
          newKana = testNewKana;
          success = true; // wow it worked
          break;
        }
      }
    }
    const {kana, prefix, suffix, minKeypresses} = newKana; // no updated score
    let hit = 0, miss = 0;
    if (success) {
      if (prefix.length === 1) { hit = 1; } // first hit
      if (suffix === "") { hit += minKeypresses - 1; } // last hit
    } else { miss = 1; }
    newKana.score += calcScoreAndUpdateStats(hit, miss, suffix === "", error);
    setLineState(({line, syllables, nBuffer}) => {
      let {position: kPos, kana: kanaList} = syllables[sPos];
      kanaList[kPos] = newKana; // should be safe
      if (suffix === "") {
        nBuffer = (prefix === "n" && kana.text == "ん") ? [sPos, kPos] : null;
        kPos++;
        syllables[sPos].position = kPos;
        if (!kanaList[kPos]) { sPos++; } 
        // if getKana(position) still undefined, line is over
      }
      return {line, position: sPos, syllables, nBuffer};
    });
  };

  const calcScoreAndUpdateStats = (hit: number, miss: number, endKana: boolean, error: number) => {
    const effectiveError = error < 0 ? -3 * error : error // penalize early hits more
    const timingMultiplier = 1 + 4 * Math.pow(0.5, (effectiveError / 1000));
    let scoreEarned = -5 * miss;
    scoreEarned += 5 * hit * timingMultiplier;
    set('stats')((oldStats) => updateStatsOnKeyPress(oldStats, hit, miss, endKana, scoreMultiplier, scoreEarned));
    return scoreEarned;
  };
  
  return (
    <GameContainer>
				<> 
					<TopHalf>
						{isActive ? <>
							<GameLine // current line
								key={currIndex}
								currTime={adjustedTime}
								lineState={lines[currIndex]}
								keyCallback={handleKeyPress}
                isPlayingGame={isPlayingGame}
							/>
							<LyricLine>{lines[currIndex].line.lyric}</LyricLine>
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

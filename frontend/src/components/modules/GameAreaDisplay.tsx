import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

import GameVideo from "@/components/modules/GameVideo";
import GameLine from "@/components/modules/GameLine";

import { 
  User, Beatmap, LineData, Config,
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
  config: Config,
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

const GameAreaDisplay = ({ user, beatmap, gameState, setGameState, setAvailableSpeeds, speed, config } : Props) => {
  const set = makeSetFunc(setGameState);

  const { volume } = config;

  const [offset, setOffset] = useState<number>(0);
  const totalOffset = offset + config.offset;

  const {status, currTime, lines, stats} = gameState;
  const {hits, misses, kanaHits, kanaMisses, score} = stats;
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

  const acc = ((hitCount: number, missCount: number) => {
    if (hitCount + missCount == 0) {
      return 100;
    }
    return 100 * hitCount / (hitCount + missCount);
  });  

  const keyAcc = acc(hits, misses);
  const kanaAcc = acc(kanaHits, kanaMisses);
  
  const KPM = currTime ? (Math.round(hits * 60000 / currTime)) : 0;

  if (status === GameStatus.GOBACK) {
    return <Navigate to={`/play/${beatmap.beatmapset.id}`} replace={true} />;
  }

  const isActive = [GameStatus.PLAYING, GameStatus.PAUSED, GameStatus.AUTOPLAYING].includes(status) &&
    (adjustedTime !== undefined) && (currIndex !== undefined) && (currIndex > -1) && (currIndex < lines.length);
  const isPlayingGame = isActive && status === GameStatus.PLAYING;

  const scoreMultiplier = Math.pow(speed, 1/speed);
  const scoreInfoPairs: [string, string | number | JSX.Element | undefined][] = [
    ["Correct Keystrokes", hits],
    ["Incorrect Keystrokes", misses],
    ["Kana Typed", kanaHits],
    ["Kana Missed", kanaMisses],
    ["Keystroke Accuracy", keyAcc.toFixed(2)],
		["Kana Accuracy", kanaAcc.toFixed(2)],
  ];

  const scoreInfoEntries = scoreInfoPairs.map((entry: [string, string | number | JSX.Element | undefined]) => (
    <InfoEntry key={entry[0]}>
      <span><b>{entry[0]}:</b></span>
      <span>{entry[1]}</span>
    </InfoEntry>
  ));
  
  const getKana = (sPos: number) : KanaState | undefined => {
    if (!lineState) { return; }
    const syllable = lineState.syllables[sPos];
    if (!syllable) { return; }
    return syllable.kana[syllable.position];
  }

  const updateKanaAffix = (key : string, sPos: number) : KanaState | undefined => {
    const curKana = getKana(sPos);
    if (!curKana) return;
    const {kana, prefix} = curKana;
    const newPrefix = prefix + key;
    const filteredRomanizations = kana.romanizations.filter(s => s.substring(0, newPrefix.length) == newPrefix);
    if (filteredRomanizations.length == 0) { return; }
    const newSuffix = filteredRomanizations[0].substring(newPrefix.length);
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
    const key = e.key.toLowerCase();
    const allowedCharacters = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890-`~ \"'.?!,"; // idk if this is comprehensive
    if(!allowedCharacters.includes(key)) { return; }
    if(key == "n" && nBuffer) {
      setLineState((s) => {
        s.nBuffer = null;
        s.syllables[nBuffer[0]].kana[nBuffer[1]].prefix += "n";
        return s;
      });
      return;
    }

    const latestActiveSyllable = timeToSyllableIndex(line.syllables, currTime) - 1;
    const error = currTime - syllables![sPos].time;

    const maybeNewKana = updateKanaAffix(key, sPos);
    let success = maybeNewKana !== undefined;
    let newKana = maybeNewKana ?? curKana;
    if (!success) { // key is not the next char; set newKana
      for (let newPos = sPos; newPos < latestActiveSyllable; ++newPos) { // try skipping syllables
        const testNewKana = updateKanaAffix(key, newPos);
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
							<h2>Submitting score...</h2>
							: null}
					</TopHalf>
					<BottomHalf>
						<StatBox>
							<p>Keypress Acc: {keyAcc.toFixed(2)}</p>
							<p>Kana Acc: {kanaAcc.toFixed(2)}</p>
							<p>Score: {Math.round(score)}</p>
							<p>KPM: {KPM}</p>
						</StatBox>
						<GameVideo
							yt_id={beatmap.beatmapset.yt_id}
							status={status}
							currTime={adjustedTime}
							startGame={() => startGame(totalOffset)}
							setAvailableSpeeds={setAvailableSpeeds}
							speed={speed}
							volume={volume}
						/>
						<StatBox>
							<p>Beatmap KPM: {Math.round((beatmap.kpm ?? 0) * speed)}</p>
							<p>Line KPM: {isPlayingGame ? 
								(Math.round(computeLineKPM(lines[currIndex].line) * speed))
								: "N/A"}</p>
						</StatBox>
					</BottomHalf>
					{status === GameStatus.UNSTARTED ? 
						<Overlay>
							{!user && <>
								<Warning>
									<Line size="1.5em" margin="0 0 0.5em 0">Warning: You are not logged in, and your score will not be submitted.</Line>
								</Warning>
							</>}
							<Line size="1.5em">Press Space to play</Line>
							<Line size="1em" margin="0 0 0.5em 0">Press Esc to exit during a game</Line>
							<Line size="1em">Set map offset:&nbsp;
								<OffsetInput size={3} defaultValue={offset} onChange={(e) => {
									const intValue = parseInt(e.target.value)
									if (!isNaN(intValue)) { setOffset(intValue); }
								}}></OffsetInput>
							</Line>
							<Line size="1em">(Put negative offset if you think syllables are late; positive if you think they're early)</Line>
						</Overlay>
						: null}
					{status === GameStatus.ENDED ?
						<ResultsContainer>
							<h1><u>RESULTS</u></h1>
							<h1>Final Score: {Math.round(score)}</h1>
							<InfoBox width={90}>
									{scoreInfoEntries}
							</InfoBox>
						</ResultsContainer>
						: null} 

				</>
    </GameContainer>
  );
}

export default GameAreaDisplay;

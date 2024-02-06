import { Config } from '@/providers/config';
import { computeLineKana, getVisualPosition, timeToLineIndex, timeToSyllableIndex } from '@/utils/beatmaputils';

import { LineData, GameState, GameStatus, KanaState, LineState, ModCombo, KeyEvent, Kana, Beatmap, Rank } from '@/utils/types';
import { computeMinKeypresses, parseKana } from './kana';
import getTextWidth from "@/utils/widths";
import { defaultConfig } from '@/providers/config';

const initStatsState = () => ({
  hits: 0,
  misses: 0,
  kanaHits: 0,
  kanaMisses: 0,
  totalKana: 0,
  score: 0,
});

// starting game state for GameArea
// (and for simulating replay function)
export const makeInitGameState = (lines: LineData[], config: Config) : GameState => ({
  status: GameStatus.UNSTARTED,
  offset: 0,
  currTime: undefined, // maintained via timer independent of video
  lines: lines.map((lineData) => makeLineStateAt(0, lineData, config)),
  stats: initStatsState(),
  keyLog: [],
});

export const getScoreMultiplier = (speed: number, modCombo: ModCombo) => {
  if (speed < 0) throw Error("speed cannot be negative");
  let mult = (speed < 1) ? speed ** 1.5 : speed ** 0.4; // https://www.desmos.com/calculator/tfg2xgbexy
  if (modCombo.hidden) mult *= 1.05
  return mult;
};

export const getRank = (score: number, speed: number, modCombo: ModCombo): Rank => {
  const normalizedScore = score / getScoreMultiplier(speed, modCombo)
  if (normalizedScore == 1000000) return 'SS';
  if (normalizedScore >= 980000) return 'S';
  if (normalizedScore >= 900000) return 'A';
  if (normalizedScore >= 750000) return 'B';
  if (normalizedScore >= 500000) return 'C';
  if (normalizedScore >= 250000) return 'D';
  return 'E';
}


/**
 * update stats, including the scoring function
 * @param oldStats 
 * @param hit how many hits to count keypress as
 * @param miss how many misses to count keypress as
 * @param endKana whether this keypress finishes a kana
 * @param scoreEarned how much real score to add (after mod multiplier)
 * @returns object of {newStats: GameState['stats'], scoreEarned: number}
 */
const updateStatsOnKeyPress = (
  oldStats: GameState['stats'], 
  hit: number, 
  miss: number, 
  endKana: boolean,
  scoreEarned: number,
) => {
  const incKana = (endKana ? 1 : 0);
  const {hits, misses, kanaHits, totalKana, score} = oldStats;
  return { ...oldStats,
    hits: hits + hit,
    misses: misses + miss,
    kanaHits: kanaHits + incKana,
    totalKana: totalKana + incKana,
    score: score + scoreEarned,
  };
};

/**
 * assumes gameState can be mutated
 * lineIndex is the next line (after the one that ended)
 * this fixes leftover total kana amounts
 * probably should stay within this file, but whatever
 */
export const updateStateOnLineEnd = (gameState: GameState, lineIndex: number) => {
  const elapsedLines = gameState.lines.slice(0, lineIndex);
  const newTotalKana = elapsedLines.map(x => computeLineKana(x.line)).reduce((a, b) => a + b, 0);
  gameState.stats.totalKana = newTotalKana;
  gameState.stats.kanaMisses = newTotalKana - gameState.stats.kanaHits;
  return gameState;
};

const getKana = (lineState: LineState | undefined, sPos: number) : KanaState | undefined => {
  if (!lineState) { return; }
  const syllable = lineState.syllables[sPos];
  if (!syllable) { return; }
  return syllable.kana[syllable.position];
}

const updateKanaAffix = (key: string, curKana: KanaState | undefined, useKanaLayout: boolean) : KanaState | undefined => {
  if (!curKana) return;
  const {kana, prefix} = curKana;
  const newPrefix = prefix + key;
  const options = useKanaLayout ? kana.hiraganizations : kana.romanizations
  const filtered = options.filter(s => s.substring(0, newPrefix.length) == newPrefix);
  if (filtered.length == 0) { return; }
  const newSuffix = filtered[0].substring(newPrefix.length);
  return {...curKana, prefix: newPrefix, suffix: newSuffix};
}

/**
 * returns raw score (before mods) but updates stats with real score (after mods)
 * also assumes this can mutate gameState and kanaState in place
 */
const calcScoreAndUpdateStats = (kanaState: KanaState, gameState: GameState, baseKeyScore: number, scoreMultiplier: number, hit: number, miss: number, endKana: boolean, error: number) => {
  let effectiveError = error < 0 ? -3 * error : error // penalize early hits more
  effectiveError = Math.max(0, effectiveError - 90); // gives 120ms perfect window
  const timingMultiplier = 0.2 + 0.8 * Math.pow(0.5, (effectiveError / 1000));
  let judgement = 0 * miss; // don't penalize for missing? maybe reconsider later
  judgement += hit * timingMultiplier
  const scoreEarned = judgement * baseKeyScore * scoreMultiplier;
  gameState.stats = updateStatsOnKeyPress(gameState.stats, hit, miss, endKana, scoreEarned);
  kanaState.scoreRatio += judgement;
  kanaState.misses += miss;
};

/**
 * assume that the gameState is safely mutateable
 */
export const makeUpdateGameState = (baseKeyScore: number, scoreMultiplier: number, useKanaLayout: boolean = false) => (gameState: GameState, key: string, timestamp: number) => {
  gameState.keyLog.push({key, timestamp});
  const lines = gameState.lines.map(x => x.line);
  const currIndex = (timestamp !== undefined) ? timeToLineIndex(lines, timestamp) : undefined;
  const lineState = currIndex !== undefined ? gameState.lines[currIndex] : undefined;
  if (!lineState) { return gameState; }
  let sPos = lineState.position;
  const curKana = getKana(lineState, sPos);
  if (!curKana) return gameState; // finished line or something

  const {line, syllables, nBuffer} = lineState ?? {};
  // don't lowercase because maps might have uppercase
  // (if you press capslock skill issue)
  const allowedCharacters = // idk if this is comprehensive
    "`1234567890-=qwertyuiop[]\\asdfghjkl;'zxcvbnm,./~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:\"ZXCVBNM<>?";
  if(!allowedCharacters.includes(key)) { return gameState; }
  if(!useKanaLayout && key == "n" && nBuffer) {
    // mutating
    lineState.nBuffer = null;
    lineState.syllables[nBuffer[0]].kana[nBuffer[1]].prefix += "n";
    return gameState;
  }

  const latestActiveSyllable = timeToSyllableIndex(line.syllables, timestamp) - 1;
  const error = timestamp - syllables![sPos].time;

  const maybeNewKana = updateKanaAffix(key, curKana, useKanaLayout);
  let success = maybeNewKana !== undefined;
  let newKana = maybeNewKana ?? curKana;
  if (!success) {
    // key is not the next char
    // game will skip to a syllable if the key matches, and:
    // - the current time is past the syllable start time, or
    // - the misses on this kana, if they were hits, could be
    //   enough keystrokes so player would be at this syllable  
    let keystrokesBurned = curKana.misses;
    keystrokesBurned -= curKana.suffix.length; // this depends on user settings oops lol
    const curSyllable = lineState.syllables[sPos];
    keystrokesBurned -= curSyllable.kana.slice(curSyllable.position+1).reduce((a,b) => a+b.minKeypresses, 0);
    for (let newPos = sPos + 1; newPos < lineState.syllables.length; ++newPos) {
      if (newPos > latestActiveSyllable && keystrokesBurned < 0) break;
      keystrokesBurned -= lineState.syllables[newPos].kana.reduce((a,b) => a+b.minKeypresses, 0);

      const testNewKana = updateKanaAffix(key, getKana(lineState, newPos), useKanaLayout);
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
  
  // mutates newKana and gameState
  calcScoreAndUpdateStats(newKana, gameState, baseKeyScore, scoreMultiplier, hit, miss, suffix === "", error);
  
  let {position: kPos, kana: kanaList} = lineState.syllables[sPos];
  kanaList[kPos] = newKana; // should be safe
  if (suffix === "") {
    lineState.nBuffer = (prefix === "n" && kana.text == "ん") ? [sPos, kPos] : null;
    kPos++;
    syllables[sPos].position = kPos;
    if (!kanaList[kPos]) { sPos++; } 
    // if getKana(position) still undefined, line is over
  }
  lineState.position = sPos;
  return gameState;
};

export const simulateReplay = (beatmap: Beatmap, config: Config, scoreMultiplier: number, keyLog: KeyEvent[]) => {
  let gameState = makeInitGameState(beatmap.lines as LineData[], config);
  const updateGameState = makeUpdateGameState(beatmap.base_key_score ?? 1, scoreMultiplier, config.useKanaLayout);
  if (!beatmap.lines.length) return gameState;
  let currIndex = 0;
  let logIndex = 0; // next index to process
  while (true) {
    const currLine = gameState.lines[currIndex];
    if (logIndex < keyLog.length && keyLog[logIndex].timestamp < currLine.line.endTime) {
      // next keypress comes next, chronologically
      const {key, timestamp} = keyLog[logIndex];
      // this mutates old value, but don't rely on it
      gameState = updateGameState(gameState, key, timestamp);
      logIndex++;
    } else {
      // end of line comes next, chronologically
      currIndex++; // want to pass in the next line
      if (currIndex === beatmap.lines.length) break;
      gameState = updateStateOnLineEnd(gameState, currIndex);
    }
  }
  return gameState;
}

export const getCurrentRomanization = (kana : KanaState[]) => 
  "".concat.apply("", kana.map(ks => ks.prefix + ks.suffix))

const makeInitOrLastKanaState = (kana: Kana, last: boolean, useKanaLayout: boolean): KanaState => {
  const fullText = useKanaLayout ? kana.hiraganizations[0] : kana.romanizations[0]
  return { 
    kana: kana, 
    prefix: last ? fullText : "", 
    suffix: last ? "" : fullText, 
    minKeypresses: computeMinKeypresses(kana), 
    scoreRatio: 0,
    misses: 0,
  }
};

export const makeLineStateAt = (currTime: number, lineData: LineData, config: Config, editor = false) : LineState => ({
  line: lineData,
  position: lineData.syllables.filter(s => s.time < currTime).length,
  syllables: lineData.syllables.map((syllable, i, arr) => {
    const kana = parseKana(syllable.text, config, arr[i+1]?.text)
      .map((kana) => makeInitOrLastKanaState(kana, syllable.time < currTime, config.useKanaLayout))
    return {...syllable,
      position: (editor && currTime >= syllable.time) ? kana.length : 0,
      kana: kana,
    }
  }),
  nBuffer: null,
});

export const withOverlapOffsets = (lineState : LineState, fontSize : number) : any => {
  // mutates but probably fine :3
  // font size is in em
  const padding = 2; // px
  let rightmost = 0;
  lineState.syllables.forEach((syllable : any) => {
    const {text, time, kana} = syllable;
    const roman = getCurrentRomanization(kana);
    const width = Math.max(getTextWidth(text), getTextWidth(roman)) * fontSize + padding;
    const pos = getVisualPosition(time, lineState.line) * 800; // i love hardcoding
    syllable.pos = pos;
    syllable.offset = Math.max(rightmost - pos, 0);
    rightmost = pos + syllable.offset + width;
  });
  return lineState;
}


export const serializeReplay = (keyLog: KeyEvent[]): string => {
  let replay = `enuTyping replay format v1\n`;
  for (const {key, timestamp} of keyLog) {
    // timestamps should be int, but just in case
    replay += `${key}|@|${Math.round(timestamp)}\n`;
  }
  return replay;
}

export const deserializeReplay = (replay: string): KeyEvent[] => {
  let keyLog: KeyEvent[] = [];
  for (const line of replay.split('\n')) {
    const data = line.split('|@|');
    if (data.length !== 2) continue;
    keyLog.push({key: data[0], timestamp: parseInt(data[1])})
  }
  return keyLog;
}
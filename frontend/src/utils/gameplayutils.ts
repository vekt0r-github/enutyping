import { computeLineKana, timeToLineIndex, timeToSyllableIndex } from '@/utils/beatmaputils';

import { LineData, GameState, Beatmap, KanaState, LineState, ModCombo } from '@/utils/types';

export const getScoreMultiplier = (speed: number, modCombo: ModCombo) => {
  if (speed < 0) throw Error("speed cannot be negative");
  let mult = (speed < 1) ? speed ** 1.5 : speed ** 0.4; // https://www.desmos.com/calculator/tfg2xgbexy
  if (modCombo.hidden) mult *= 1.05
  return mult;
};

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
  const newTotalKana = elapsedLines.map(x => computeLineKana(x.line)).reduce((a, b) => a + b);
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
 * assume that the gameState is safely mutateable
 */
export const makeUpdateGameState = (useKanaLayout: boolean, scoreMultiplier: number) => (gameState: GameState, key: string, timestamp: number) => {
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
  if (!success) { // key is not the next char; set newKana
    for (let newPos = sPos; newPos < latestActiveSyllable; ++newPos) { // try skipping syllables
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
  newKana.score += calcScoreAndUpdateStats(gameState, scoreMultiplier, hit, miss, suffix === "", error);
  
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

/**
 * returns raw score (before mods) but updates stats with real score (after mods)
 * also assumes this can mutate gameState
 */
const calcScoreAndUpdateStats = (gameState: GameState, scoreMultiplier: number, hit: number, miss: number, endKana: boolean, error: number) => {
  const effectiveError = error < 0 ? -3 * error : error // penalize early hits more
  const timingMultiplier = 1 + 4 * Math.pow(0.5, (effectiveError / 1000));
  let scoreEarned = -5 * miss;
  scoreEarned += 5 * hit * timingMultiplier
  gameState.stats = updateStatsOnKeyPress(gameState.stats, hit, miss, endKana, scoreEarned * scoreMultiplier);
  return scoreEarned;
};
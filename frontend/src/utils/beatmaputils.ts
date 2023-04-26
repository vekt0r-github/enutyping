import { defaultConfig, Config } from '@/utils/config';
import { Beatmap, Beatmapset, LineData, GameState, Kana, LineState, TimingPoint, KanaState, BeatmapMetadata } from '@/utils/types';
import { computeMinKeypresses, parseKana } from '@/utils/kana';
import getTextWidth from "@/utils/widths";

export const MS_IN_MINUTE = 60000;

export const GAME_FPS = 60;

/**
 * process beatmap "file", mutating the object
 * @param beatmap 
 * @returns void
 */
export const processBeatmap = (beatmap : Beatmap, config: Config) => {
  let lines : LineData[] = [];
  if (!beatmap.content) { return; } // idk man
  const [timing, content] = 
    beatmap.content
      .substring('ishpytoing file format v1\n\n[TimingPoints]\n'.length)
      .split('\n\n[Lines]\n');
  const timingPoints = timing.length ? timing.split(/\r?\n/).map(point => {
    const [time, bpm] = point.split(',').map(s => parseInt(s));
    return {time, bpm};
  }) : [];
  beatmap.timingPoints = timingPoints;

  const objects = content.split(/\r?\n/);
  let line : LineData | undefined = undefined;
  let endTime : number | undefined = undefined;
  for (const obj_str of objects) {
    const obj = obj_str.split(',');
    const type = obj[0];
    const time = parseInt(obj[1]);
    const text = obj.slice(2).join(',');
    
    if (type === 'E') { 
      endTime = time;
    }
    if (line && ['L','E'].includes(type)) {
      line.endTime = time;
      lines.push(line);
    }
    if (type === 'L') {
      line = {
        startTime: time,
        endTime: 0, // set when line ends
        lyric: text,
        syllables: [],
      };
    } else if (type === 'S') {
      const kana = parseKana(text, config);
      line?.syllables.push({ time, text, kana });
    }
  }
  if (endTime === undefined && line) {
    line.endTime = beatmap.duration;
    lines.push(line);
  } 
  beatmap.lines = lines;
  beatmap.endTime = endTime;
  beatmap.kpm = computeBeatmapKPM(beatmap);
};

/**
 * writes beatmap to file format
 * @param beatmap specifically {lines, endTime}
 * @returns string containing new content field
 */
export const writeBeatmap = (beatmap : Beatmap) => {
  let content = [
    'ishpytoing file format v1', '',
    '[TimingPoints]',
  ];
  for (const {time, bpm} of beatmap.timingPoints) {
    content.push(`${time},${bpm}`);
  }
  if (!beatmap.timingPoints.length) { content.push(''); }
  content.push('', '[Lines]');
  for (const line of beatmap.lines) {
    content.push(`L,${line.startTime},${line.lyric}`);
    for (const syllable of line.syllables) {
      content.push(`S,${syllable.time},${syllable.text}`);
    }
  }
  if (beatmap.endTime !== undefined) { content.push(`E,${beatmap.endTime}`); }
  content.push('');
  return content.join('\n');
};

type KeysMatching<T, V> = {[K in keyof T]-?: T[K] extends V ? K : never}[keyof T];
export const getSetAvg = (mapset: Beatmapset, prop: KeysMatching<BeatmapMetadata, number | undefined>, defaultValue = 0) => {
  const vals = mapset.beatmaps.map((map) => map[prop]);
  const cleanVals : number[] = vals.filter(x => x !== undefined) as number[]
  if (!cleanVals.length) return defaultValue;
  return cleanVals.reduce((a, b) => a + b) / vals.length;
}

export const getArtist = (map: BeatmapMetadata, config: Config) => 
  map[`artist${config.localizeMetadata ? '' : '_original'}`];

export const getTitle = (map: BeatmapMetadata, config: Config) => 
  map[`title${config.localizeMetadata ? '' : '_original'}`];

// -1 to lines.length
export const timeToLineIndex = (lines: LineData[], time: number) => {
  if (!lines.length || time < lines[0].startTime) { return -1; }
  for (let i = 0; i < lines.length; i++) {
    if (time < lines[i].endTime) { return i; }
  }
  return lines.length;
};

// 0 to syllables.length
export const timeToSyllableIndex = (syllables: LineData['syllables'], time: number) => {
  for (let i = 0; i < syllables.length; i++) {
    if (time < syllables[i].time) { return i; }
  }
  return syllables.length;
};

// 0 to timingPoints.length
export const timeToTimingPointIndex = (timingPoints: TimingPoint[], currTime: number) => {
  let index = timingPoints.length;
  timingPoints.forEach(({time, bpm}, i, arr) => {
    if (time > currTime) { index = i; }
  });
  return index;
};

// have a canonical time for every beat
// this way off by 1 errors are only generated by changing timing
// just time correctly the first time
export const getTimeOfBeat = ({time, bpm} : TimingPoint, divisor: number, beats: number) => {
  const ms = MS_IN_MINUTE / (bpm * divisor);
  const beatTime = time + ms * beats;
  return Math.round(beatTime);
}

// the previous one
export const timeToBeatNumber = ({time, bpm} : TimingPoint, divisor: number, searchTime : number, round = false) => {
  const ms = MS_IN_MINUTE / (bpm * divisor);
  const beats = (searchTime - time) / ms;
  if (round) {
    return Math.round(beats);
  }
  if (Math.round(getTimeOfBeat({time, bpm}, divisor, Math.ceil(beats))) === Math.round(searchTime)) {
    return Math.ceil(beats);
  }
  return Math.floor(beats);
}

export const lastLineOrSyllableTime = (lines: LineData[]) => {
  if (!lines.length) { return 0; }
  const syllables = lines[lines.length - 1].syllables;
  if (!syllables.length) { return lines[lines.length - 1].startTime; }
  return syllables[syllables.length - 1].time;
};

const computeLineKeypresses = (line: LineData) => {
  let keypresses: number = 0;
  line.syllables.forEach(({ kana }) => {
    kana.forEach((k) => {
      keypresses += computeMinKeypresses(k);
    });
  });
  return keypresses;
};

export const computeLineKPM = (line: LineData) => {
  const lineTime = (line.endTime - line.startTime) / MS_IN_MINUTE;
  return computeLineKeypresses(line) / lineTime;
};

export const computeBeatmapKPM = (map: Beatmap) => {
  let keypresses: number = 0;
  let drainTime: number = 0;
  map.lines?.forEach((line: LineData) => {
    const newKeypresses = computeLineKeypresses(line);
    if (newKeypresses === 0) { return; }
    keypresses += newKeypresses;
    drainTime += (line.endTime - line.startTime) / MS_IN_MINUTE;
  });
  return drainTime ? Math.round(keypresses / drainTime) : 0;
};

export const computeLineKana = (line: LineData) => {
  let totalKana: number = 0;
  line.syllables.forEach(({ text }) => {totalKana += parseKana(text, defaultConfig).length});  
  return totalKana;
};

/**
 * update stats, including the scoring function
 * @param oldStats 
 * @param hit how many hits to count keypress as
 * @param miss how many misses to count keypress as
 * @param endKana whether this keypress finishes a kana
 * @param scoreMultiplier given by active mods
 * @param scoreEarned how much score to add before multiplier
 * @returns object of {newStats: GameState['stats'], scoreEarned: number}
 */
export const updateStatsOnKeyPress = (
  oldStats: GameState['stats'], 
  hit: number, 
  miss: number, 
  endKana: boolean, 
  scoreMultiplier: number,
  scoreEarned: number,
) => {
  return { ...oldStats,
    hits: oldStats.hits + hit,
    misses: oldStats.misses + miss,
    kanaHits: oldStats.kanaHits + (endKana ? 1 : 0),
    score: oldStats.score + scoreEarned * scoreMultiplier,
  };
};

export const updateStatsOnLineEnd = (oldStats: GameState['stats'], line: LineData) => {
  const newTotalKana = oldStats.totalKana + computeLineKana(line); // should be prev line
  return { ...oldStats,
    totalKana: newTotalKana,
    kanaMisses: newTotalKana - oldStats.kanaHits,
  };
};

// sorry but ehhhhh
export const makeSetFunc = <State>(setState : (state : State | ((oldState: State) => State)) => void) => (
  <K extends keyof State> (prop : K) => (val : State[K] | ((oldState: State[K]) => State[K])) => {
    const isFunction = (val: any) : val is Function => { return typeof val === "function"; }
    setState((state) => ({ ...state, 
      [prop]: isFunction(val) ? val(state[prop]) : val,
    }))
  }
);

export const getCurrentRomanization = (kana : KanaState[]) => 
  "".concat.apply("", kana.map(ks => ks.prefix + ks.suffix))

const makeInitOrLastKanaState = (kana: Kana, last: boolean): KanaState => ({ 
  kana: kana, 
  prefix: last ? kana.romanizations[0] : "", 
  suffix: last ? "" : kana.romanizations[0], 
  minKeypresses: computeMinKeypresses(kana), 
  score: 0,
});

export const makeLineStateAt = (currTime: number, lineData: LineData, config: Config, editor = false) : LineState => ({
  line: lineData,
  position: lineData.syllables.filter(s => s.time < currTime).length,
  syllables: lineData.syllables.map((syllable, i, arr) => {
    const kana = parseKana(syllable.text, config, arr[i+1]?.text)
      .map((kana) => makeInitOrLastKanaState(kana, syllable.time < currTime))
    return {...syllable,
      position: (editor && currTime >= syllable.time) ? kana.length : 0,
      kana: kana,
    }
  }),
  nBuffer: null,
});

export const getVisualPosition = (currTime: number, lineData: LineData) => {
  const {startTime, endTime} = lineData;
  return (currTime - startTime) / (endTime - startTime);
}

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

import { Beatmap, Beatmapset, LineData, defaultConfig, Config, GameState, Kana, LineState } from '@/utils/types';
import { computeMinKeypresses, parseKana } from '@/utils/kana';

const MS_IN_MINUTE = 60000;

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
      .substring('ishpytoing file format v1\n\n[TimingPoints]'.length)
      .split('\n\n[Lines]\n');
  const timing_points = timing.split(/\r?\n/).map(point => {
    const [time, bpm] = point.split(',').map(s => parseInt(s));
    return {time, bpm};
  });
  beatmap.timing_points = timing_points;

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
    line.endTime = beatmap.beatmapset.duration;
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
  for (const {time, bpm} of beatmap.timing_points) {
    content.push(`${time},${bpm}`);
  }
  content.push('', '[Lines]');
  for (const line of beatmap.lines) {
    content.push(`L,${line.startTime},${line.lyric}`);
    for (const syllable of line.syllables) {
      content.push(`S,${syllable.time},${syllable.text}`);
    }
  }
  if (beatmap.endTime !== undefined) { content.push(`E,${beatmap.endTime}`); }
  return content.join('\n');
};

export const getArtist = (mapset: Beatmapset, config: Config) => 
  mapset[`artist${config.localizeMetadata ? '' : '_original'}`];

export const getTitle = (mapset: Beatmapset, config: Config) => 
  mapset[`title${config.localizeMetadata ? '' : '_original'}`];

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

export const lastLineOrSyllableTime = (lines: LineData[]) => {
  if (!lines.length) { return 0; }
  const syllables = lines[lines.length - 1].syllables;
  if (!syllables.length) { return lines[lines.length - 1].startTime; }
  return syllables[syllables.length - 1].time;
};

const computeLineKeypresses = (line: LineData) => {
  let keypresses: number = 0;
  line.syllables.forEach(({ text }) => { keypresses += computeMinKeypresses(text) });
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
    keypresses += computeLineKeypresses(line);
    drainTime += (line.endTime - line.startTime) / MS_IN_MINUTE;
  });
  return drainTime ? keypresses / drainTime : 0;
};

export const computeLineKana = (line: LineData) => {
  let totalKana: number = 0;
  line.syllables.forEach(({ text }) => {totalKana += parseKana(text, defaultConfig).length});  
  return totalKana;
};

export const updateStatsOnKeyPress = (oldStats: GameState['stats'], hit: number, miss: number, endKana: boolean) => {
  return { ...oldStats,
    hits: oldStats.hits + hit,
    misses: oldStats.misses + miss,
    kanaHits: oldStats.kanaHits + (endKana ? 1 : 0),
    score: oldStats.score + 10 * hit - 5 * miss,
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

const makeInitOrLastKanaState = (kana: Kana, last: boolean) => ({ 
  kana: kana, 
  prefix: last ? kana.romanizations[0] : "", 
  suffix: last ? "" : kana.romanizations[0], 
  minKeypresses: computeMinKeypresses(kana.text) 
});

export const makeLineStateAt = (currTime: number, lineData: LineData, config: Config) : LineState => ({
  line: lineData,
  position: [lineData.syllables.filter(s => s.time < currTime).length, 0],
  syllables: lineData.syllables.map((syllable, i, arr) => ({
    ...syllable,
    kana: parseKana(syllable.text, config, arr[i+1]?.text)
      .map((kana) => makeInitOrLastKanaState(kana, syllable.time < currTime)),
  })),
  nBuffer: false,
});

export const getVisualPosition = (currTime: number, lineData: LineData) => {
  const {startTime, endTime} = lineData;
  return (currTime - startTime) / (endTime - startTime);
}

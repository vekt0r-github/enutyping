import { Beatmap, Beatmapset, LineData, defaultConfig, Config, GameState } from '@/utils/types';
import { computeMinKeypresses, parseKana } from '@/utils/kana';

const MS_IN_MINUTE = 60000;

/**
 * process beatmap "file", mutating the object
 * @param beatmap 
 * @returns void
 */
export const processBeatmap = (beatmap : Beatmap, config: Config) => {
  let lines : LineData[] = [];
  if (!beatmap.content) { return; } // idk man
  const objects = beatmap.content.split(/\r?\n/);
  let line : LineData;
  objects.forEach((obj_str) => {
    const obj = obj_str.split(',');
    const type = obj[0];
    const time = parseInt(obj[1]);
    const text = obj.slice(2).join(',');
    
    if (line && ['L','E'].includes(type)) {
      line.endTime = time;
      line.kpm = computeLineKPM(line);
      lines.push(line);
    }
    if (type === 'L') {
      line = {
        startTime: time,
        endTime: 0, // set when line ends
        lyric: text,
        kpm: 0,
        syllables: [],
      };
    } else if (type === 'S') {
      const kana = parseKana(text, config);
      line.syllables.push({ time, text, kana });
    }
  });
  beatmap.lines = lines;
  beatmap.kpm = computeBeatmapKPM(beatmap);
};

export const getArtist = (mapset: Beatmapset, config: Config) => 
  mapset[`artist${config.localizeMetadata ? '' : '_original'}`];

export const getTitle = (mapset: Beatmapset, config: Config) => 
  mapset[`title${config.localizeMetadata ? '' : '_original'}`];

export const timeToLineIndex = (lines: LineData[], time: number) => {
  if (!lines.length || time < lines[0].startTime) { return -1; }
  for (let i = 0; i < lines.length; i++) {
    if (time < lines[i].endTime) { return i; }
  }
  return lines.length;
}

const computeLineKeypresses = (line: LineData) => {
  let keypresses: number = 0;
  line.syllables.forEach(({ text }) => { keypresses += computeMinKeypresses(text) });
  return keypresses;
}

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
}

export const updateStatsOnKeyPress = (oldStats: GameState['stats'], hit: number, miss: number, endKana: boolean) => {
  return { ...oldStats,
    hits: oldStats.hits + hit,
    misses: oldStats.misses + miss,
    kanaHits: oldStats.kanaHits + (endKana ? 1 : 0),
    score: oldStats.score + 10 * hit - 5 * miss,
  };
}

export const updateStatsOnLineEnd = (oldStats: GameState['stats'], line: LineData) => {
  const newTotalKana = oldStats.totalKana + computeLineKana(line); // should be prev line
  return { ...oldStats,
    totalKana: newTotalKana,
    kanaMisses: newTotalKana - oldStats.kanaHits,
  };
}


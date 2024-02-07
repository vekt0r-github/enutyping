export type User = {
  id: number;
  name: string;
  avatar_url: string;
};

// dumb workaround for situations where possibly-null user must be initialized
export const nullUser = {
  id: -1,
  name: '',
  avatar_url: '',
}

export type UserStats = {
  join_time: number;
  kana_accuracy: number;
  key_accuracy: number;
  play_count: number;
  total_score: number;
};

export type ModCombo = {
  hidden: boolean,
}

export const getModCombo = (modFlag: number): ModCombo => {
  return {
    hidden: (modFlag & 1) == 1
  }
}

export const getModFlag = (modCombo: ModCombo): number => {
  return modCombo.hidden ? 1 : 0
}

export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';

export const rankColors: {[key in Rank]: string} = {
  'E': 'maroon',
  'D': 'red',
  'C': 'purple',
  'B': 'teal',
  'A': 'green',
  'S': 'yellow',
  'SS': 'yellow',
}

export type Score = {
  id: number;
  beatmap_id: number;
  score: number;
  key_accuracy: number;
  kana_accuracy: number;
  time_unix: number;
  speed_modification: number;
	mod_flag: number;
  user?: User;
}

export type Kana = {
  text: string,
  romanizations: string[],
  hiraganizations: string[],
};

export type LineData = {
  startTime: number,
  endTime: number,
  lyric: string,
  syllables: {
    time: number,
    text: string,
    kana: Kana[], 
  }[],
};

export type TimingPoint = {
  time: number,
  bpm: number,
};

export type BeatmapMetadata = {
  id: number;
  owner: User;
  artist: string;
  title: string;
  artist_original: string;
  title_original: string;
  yt_id: string;
  source?: string; // created from yt_id on backend
  preview_point: number;
  duration: number;
  diffname: string;
  base_key_score?: number;
  kpm?: number;
};

export type Beatmap = BeatmapMetadata & {
  beatmapsets: Beatmapset[]; // can be in zero or more collections
  content: string;
  timingPoints: TimingPoint[];
  lines: LineData[]; // processed content
  endTime?: number; // also processed
  scores?: Score[];
};

export type Beatmapset = {
  id: number;
  owner: User;
  name: string;
  description: string;
  icon_url: string;
  beatmaps: BeatmapMetadata[];
}

export enum GameStatus { 
  PLAYING,
  GOBACK, // if esc is pressed
  UNSTARTED, STARTQUEUED, SUBMITTING, ENDED, // only for gameplay
  PAUSED, AUTOPLAYING, // only for editor
};

export type KanaState = {
  kana: Kana,
  prefix: string, // the correct keystrokes user has typed for this kana
  suffix: string, // one possible romaji completion of this kana after prefix
  minKeypresses: number, // fewest keystrokes to type this kana
  scoreRatio: number, // minKeypresses * (fraction of max possible score earned for this kana)
  misses: number, // number of times user has missed on this (already taken into account in score)
};

export type LineState = {
  line: LineData,
  position: number; // syllable index
  syllables: { // yes this is basically a copy of line.syllables but whatever for now
    time: number,
    text: string,
    position: number, // kana index
    kana: KanaState[],
  }[], 
  nBuffer: [number, number] | null,
};

export type KeyEvent = {
  key: string,
  timestamp: number,
}

export type GameState = {
  status: GameStatus, // maybe this shouldn't be included here...
  offset: number,
  currTime?: number,
  lines: LineState[],
  stats: {
    hits: number,
    misses: number,
    kanaHits: number, // total typed up to current time
    kanaMisses: number, // total untyped in previous lines
    totalKana: number, // total for all previous (not current) lines
    score: number,
  },
  keyLog: KeyEvent[] // {key, timestamp}
};

export type MapsetID = number|"new" // new for linking to editor
export type MapID = number|"new" // new for linking to editor
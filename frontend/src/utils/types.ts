import { Language, getDefaultLanguage } from "@/languages/Language";

export type User = { // example
  id: number;
  name: string;
  avatar_url: string;
};

export type UserStats = {
  join_time: number;
  kana_accuracy: number;
  key_accuracy: number;
  play_count: number;
  total_score: number;
};

export type Config = {
  volume: number;
  offset: number;
  language: Language;
  localizeMetadata: boolean;
  typePolygraphs: boolean;
  kanaSpellings: {
    し: string,
    ち: string,
    つ: string,
    じ: string,
    しゃ: string,
    しょ: string,
    しゅ: string,
    じゃ: string,
    じょ: string,
    じゅ: string,
    か: string, 
    く: string, 
    こ: string, 
    せ: string, 
    ふ: string, 
    づ: string,
    ん: string, 
  };
};

export const defaultConfig: Config = {
  volume: 1.0,
  offset: 0,
  language: getDefaultLanguage(), // shouldn't matter when this runs
  localizeMetadata: false,
  typePolygraphs: true,
  kanaSpellings: {
    し: "shi", 
    ち: "chi",
    つ: "tsu",
    じ: "ji",
    しゃ: "sha",
    しょ: "sho",
    しゅ: "shu",
    じゃ: "ja",
    じょ: "jo",
    じゅ: "ju",
    か: "ka", 
    く: "ku", 
    こ: "ko", 
    せ: "se",
    ふ: "fu", 
    づ: "du",
    ん: "n", 
  },
};

export type Score = {
  id: number;
  beatmap_id: number;
  score: number;
  key_accuracy: number;
  kana_accuracy: number;
  time_unix: number;
	speed_modification: number;
  user?: User;
}

export type Kana = {
  text: string,
  romanizations: string[],
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
  // TODO populate this from the backend
  id: number;
  artist: string;
  title: string;
  artist_original: string;
  title_original: string;
  yt_id: string;
  source?: string; // created from yt_id on backend
  preview_point: number;
  duration: number;
  diffname: string;
  kpm?: number;
};

export type Beatmap = BeatmapMetadata & {
  beatmapset: Beatmapset;
  content: string;
  timingPoints: TimingPoint[];
  lines: LineData[]; // processed content
  endTime?: number; // also processed
  scores?: Score[];
};

export type Beatmapset = { // example
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
  score: number, // amount of score earned for this kana (max being proportional to minKeypresses)
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

export type GameState = {
  status: GameStatus,
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
};

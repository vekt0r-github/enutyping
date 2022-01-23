export type User = { // example
  id: number;
  name: string;
  avatar_url: string;
};

export type Config = {
  volume: number;
  offset: number;
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
  localizeMetadata: true,
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

type BeatmapMetadata = {
  id: number;
  diffname: string;
}

export type Beatmap = {
  id: number;
  beatmapset: Beatmapset;
  diffname: string;
  content: string;
  lines: LineData[]; // processed content
  endTime?: number; // also processed
  kpm?: number;
  scores?: Score[];
};

export type Beatmapset = { // example
  id: number;
  artist: string;
  title: string;
  artist_original: string;
  title_original: string;
  yt_id: string;
  source?: string; // created from yt_id on backend
  preview_point: number;
  duration: number;
  owner: User;
  beatmaps: Beatmap[] | BeatmapMetadata[];
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
};

export type LineState = {
	line: LineData,
  position: [number, number]; // syllable index, kana index
  syllables: { // yes this is basically a copy of line.syllables but whatever for now
    time: number,
    text: string,
    kana: KanaState[],
  }[], 
  nBuffer: boolean,
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

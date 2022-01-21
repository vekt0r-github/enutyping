export type User = { // example
  id: number;
  name: string;
  avatar_url: string;
};

export type Config = {
	volume: number;
	offset: number;
	localizeMetadata: boolean;
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
	kpm: number,
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
	content?: string;
  lines?: LineData[]; // processed content
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
  owner: User;
  beatmaps: Beatmap[] | BeatmapMetadata[];
}

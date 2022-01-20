export type User = { // example
  id: number;
  name: string;
};

export type Config = {
	volume: number;
};

export type Score = {
  id: number;
  beatmap_id: number;
  score: number;
  user: User;
}

export type LineData = {
  startTime: number,
  endTime: number,
  lyric: string,
  syllables: {
    time: number,
    text: string,
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
  lines: LineData[]; // processed content
  scores?: Score[];
};

export type Beatmapset = { // example
  id: number;
  artist: string;
  title: string;
  artist_original: string;
  title_original: string;
  yt_id: string;
  source: string; // created from yt_id on backend
  preview_point: number;
  owner: User;
  beatmaps: Beatmap[] | BeatmapMetadata[];
}

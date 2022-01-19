export type User = { // example
  id: number;
  name: string;
} | null;

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

export type Beatmap = { // example
  id: number;
  artist: string;
  title: string;
  yt_id: string;
  source: string; // created from yt_id on backend
  lines: LineData[]; // processed content
  scores?: Score[];
};


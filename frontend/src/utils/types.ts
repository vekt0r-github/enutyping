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

export type Beatmap = { // example
  id: number;
  artist: string;
  title: string;
  source: string;
  content?: string;
  scores?: Score[];
};


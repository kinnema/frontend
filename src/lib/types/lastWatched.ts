export interface ILastWatched {
  id: string;
  name: string;
  posterPath: string;
  season: number;
  episode: number;
  isWatched?: boolean | null;
  tmdbId: number;
  atSecond: number;
  totalSeconds: number;
  episodeName: string;
  network: number;
}

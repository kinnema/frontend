export interface ILastWatched {
  id: string;
  name: string;
  posterPath: string;
  season_number: number;
  episode_number: number;
  isWatched?: boolean | null;
  tmdbId: number;
  atSecond: number;
  totalSeconds: number;
  episodeName: string;
  network: number;
}

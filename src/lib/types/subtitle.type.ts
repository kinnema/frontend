export interface ISubdlResult {
  sd_id: number;
  type: string;
  name: string;
  imdb_id: string;
  tmdb_id: number;
  first_air_date: string;
  slug: string;
  release_date: string | null;
  year: number;
}

export interface ISubdlSubtitle {
  release_name: string;
  name: string;
  lang: string;
  author: string;
  url: string;
  subtitlePage: string;
  season: number;
  episode: number | null;
  language: string;
  hi: boolean;
  episode_from: number | null;
  episode_end: number;
  full_season: boolean;
}

export interface ISubdlResponse {
  status: boolean;
  results: ISubdlResult[];
  subtitles: ISubdlSubtitle[];
  totalPages: number;
  currentPage: number;
}

export interface ISubtitleResult {
  name: string;
  lang: string;
  author: string;
  url: string;
  season: number;
  episode: number | null;
}

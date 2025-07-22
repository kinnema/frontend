import { ApiAuthLoginPost200Response, ApiAuthLoginPostRequest } from "./api";
import { ITmdbSearchResults } from "./types/tmdb";

export interface IHomeResults {
  //trending: ITmdbSearchResults;
  popular: ITmdbSearchResults;
  //airToday: ITmdbSearchResults;
}

export interface IResult<T> {
  results: T;
}

export type IWatchResult = {
  provider: string;
  url?: string;
  error?: string;
};

export interface ISeriePageEpisode {
  episodes: {
    [season: string]: ISerie[];
  };
}

export interface ISeriePageMetadata {
  name: string;
  desc: string;
  image: string;
}

export interface ISeriePage {
  episodes: ISeriePageEpisode;
  seasons: string[];
  metadata: ISeriePageMetadata;
}

export interface IMutationAddFavorite {
  tmdb_id: number;
  name: string;
  poster_path: string;
}

export interface IBaseFavorite {
  tmdb_id: number;
  name: string;
  poster_path: string;
}

export interface IMutationAddFavorite extends IBaseFavorite {}

export type IMutationLogin = ApiAuthLoginPostRequest;
export type ILoginResponse = ApiAuthLoginPost200Response;
export type IRegisterResponse = void;
export interface ISerie {
  name: string;
  image: string;
  tmdb_id: number;
  href?: string;
}

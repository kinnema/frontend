import {
  ApiAuthLoginPost200Response,
  ApiAuthLoginPostRequest,
  ApiLastWatchedPostRequest,
} from "./api";
import { ITmdbSearchResults } from "./types/tmdb";

export interface IHomeResults {
  trending: ITmdbSearchResults;
  popular: ITmdbSearchResults;
  airToday: ITmdbSearchResults;
}

export interface IResult<T> {
  results: T;
}

export interface IWatchResult {
  url: string;
}

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

export interface IUser {
  username: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  id: number;
}

export interface IBaseFavorite {
  tmdb_id: number;
  name: string;
  poster_path: string;
}

export interface IMutationAddFavorite extends IBaseFavorite {}

export interface IFavorite extends IBaseFavorite {
  user: IUser;
}

export type IMutationLogin = ApiAuthLoginPostRequest;
export type ILoginResponse = ApiAuthLoginPost200Response;
export type IRegisterResponse = void;

export interface ILastWatched {
  id: number;
  name: string;
  slug: string;
  poster_path: string;
  season: number;
  episode: number;
  is_watched: boolean;
  user: IUser;
  tmdb_id: number;
  network?: number;
  current_time?: number;
}

export type ILastWatchedMutation = ApiLastWatchedPostRequest;

export interface ISerie {
  name: string;
  image: string;
  tmdb_id: number;
  href?: string;
}

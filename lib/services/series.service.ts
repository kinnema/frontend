import { axiosClient } from ".";
import { TMDB_API_KEY } from "../constants";
import { IHomeResults, ISeriePage, IWatchResult } from "../models";
import { ITmdbSearchResults, ITmdbSerieDetails } from "../types/tmdb";

export async function fetchHomeData(): Promise<IHomeResults> {
  const response = await axiosClient.get<IHomeResults>("/home");

  return response.data;
}

export async function fetchSerieWatchLink(
  serie: string,
  season: number,
  chapter: number
) {
  const response = await axiosClient.get<IWatchResult>(
    `/watch/${serie}/${season}/${chapter}`
  );

  return response.data;
}

export async function fetchSeriePage(serie: string) {
  const response = await axiosClient.get<ISeriePage>("/serie/" + serie);

  return response.data;
}

export async function searchSerieOnTMDB(query: string) {
  const response = await axiosClient.get<ITmdbSearchResults>(
    `https://api.themoviedb.org/3/search/tv?query=${query}&api_key=${TMDB_API_KEY}&language=tr`
  );

  return response.data;
}

export async function fetchSerieFromTMDB(serie_id: number) {
  const response = await axiosClient.get<ITmdbSerieDetails>(
    `https://api.themoviedb.org/3/tv/${serie_id}?api_key=${TMDB_API_KEY}&language=tr`
  );

  return response.data;
}

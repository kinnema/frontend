import axios from "axios";
import { axiosClient } from ".";
import { IHomeResults, IWatchResult } from "../models";
import { TmdbNetworks } from "../types/networks";
import { Episode, ITmdbSearchResults, ITmdbSerieDetails } from "../types/tmdb";
import { IVidSrcResponse } from "../types/vidsrc";

export async function fetchNetworkSeries(
  network: TmdbNetworks
): Promise<ITmdbSearchResults> {
  return fetchSeriesByNetwork(network);
}

export async function fetchHomeData(): Promise<IHomeResults> {
  const responses = await Promise.all([
    fetchHomePopular(),
    fetchHomeTrending(),
    fetchAiringToday(),
  ]);

  const [popular, trending, airToday] = responses;

  return { popular, trending, airToday };
}

async function fetchHomePopular() {
  const url = "https://api.themoviedb.org/3/tv/popular";

  const response = await axiosClient.get(url);

  return response.data;
}

async function fetchHomeTrending() {
  const url = "https://api.themoviedb.org/3/tv/top_rated";

  const response = await axiosClient.get(url);

  return response.data;
}

export async function fetchSeriesByNetwork(network: number) {
  const url =
    "https://api.themoviedb.org/3/discover/tv?with_networks=" + network;

  const response = await axiosClient.get<ITmdbSearchResults>(url);

  return response.data;
}

async function fetchAiringToday() {
  const url = "https://api.themoviedb.org/3/tv/on_the_air";

  const response = await axiosClient.get(url);

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

export async function fetchFromVidsrc(
  tmdbId: number,
  season: number,
  episode: number
): Promise<IWatchResult> {
  const response = await axios.get<IVidSrcResponse>(
    `${process.env.NEXT_PUBLIC_VIDSRC_API}/vidsrc/${tmdbId}?s=${season}&e=${episode}`
  );

  console.log(response.data);

  return { url: response.data.sources[1].data.stream };
}

export async function searchSerieOnTMDB(query: string) {
  const response = await axiosClient.get<ITmdbSearchResults>(
    `https://api.themoviedb.org/3/search/tv?query=${query}&language=tr-TR`
  );

  return response.data;
}

export async function fetchSerieFromTMDB(serie_id: number) {
  const response = await axiosClient.get<ITmdbSerieDetails>(
    `https://api.themoviedb.org/3/tv/${serie_id}?language=tr-TR`
  );

  return response.data;
}

export async function fetchSerieDetailsWithSeasonsFromTmdb(
  serie_id: number,
  seasons: number
) {
  const _seasons = [];
  for (let i = 1; i < seasons + 1; i++) {
    const seasonQuery = i;

    _seasons.push(seasonQuery);
  }

  const seasonQuery = _seasons.map((season) => `season/${season}`).join(",");

  const response = await axiosClient.get<ITmdbSerieDetails>(
    `https://api.themoviedb.org/3/tv/${serie_id}?append_to_response=${seasonQuery}&language=tr-TR`
  );

  return response.data;
}

export async function fetchEpisodeDetails(
  serieId: number,
  seasonNumber: number,
  episodeNumber: number
) {
  const response = await axiosClient.get<Episode>(
    `https://api.themoviedb.org/3/tv/${serieId}/season/${seasonNumber}/episode/${episodeNumber}?language=tr-TR`
  );

  return response.data;
}

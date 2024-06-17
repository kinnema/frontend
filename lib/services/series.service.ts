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
  const url = `https://api.themoviedb.org/3/trending/tv/day?language=tr-TR`;

  const response = await axiosClient.get(url);

  return response.data;
}

async function fetchHomeTrending() {
  const url = "https://api.themoviedb.org/3/trending/tv/week?language=tr-TR";

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
  const url = `https://api.themoviedb.org/3/tv/airing_today?language=tr-TR`;

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

  const sources = response.data.sources;

  for (const source of sources) {
    const response = await axios.get(source.data.stream);
    if (response.status === 200) {
      console.log("ok");
      return { url: source.data.stream };
    } else {
      console.log("not ok");
    }
  }

  return { url: "" };
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

export async function fetchSerieDetailsWithSeasonsFromTmdb(serie_id: number) {
  const response = await axiosClient.get<ITmdbSerieDetails>(
    `https://api.themoviedb.org/3/tv/${serie_id}?append_to_response=episode_groups&language=tr-TR`
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

import axios from "axios";
import { TMDB_API_KEY } from "../constants";
import { IHomeResults } from "../models";
import { TmdbNetworks } from "../types/networks";
import {
  Episode,
  ISeasonEpisodes,
  ITmdbSearchResults,
  ITmdbSerieDetails,
} from "../types/tmdb";

const axiosClient = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    Authorization: "Bearer " + TMDB_API_KEY,
  },
});

class TmdbService {
  static fetchSeasonEpisodes = async (tvId: number, seasonNumber: number) => {
    const url = `/tv/${tvId}/season/${seasonNumber}?language=tr-TR`;

    const response = await axiosClient.get<ISeasonEpisodes>(url);

    return response.data;
  };

  static searchSeries = async (query: string) => {
    const response = await axiosClient.get<ITmdbSearchResults>(
      `/search/tv?query=${query}&language=tr-TR`
    );

    return response.data;
  };

  static fetchSerie = async (serieId: number) => {
    const response = await axiosClient.get<ITmdbSerieDetails>(
      `/tv/${serieId}?append_to_response=episode_groups&language=tr-TR`
    );

    return response.data;
  };

  static fetchEpisode = async (
    serieId: number,
    seasonNumber: number,
    episodeNumber: number
  ) => {
    const response = await axiosClient.get<Episode>(
      `/tv/${serieId}/season/${seasonNumber}/episode/${episodeNumber}?language=tr-TR`
    );

    return response.data;
  };

  static fetchHomeData = async (): Promise<IHomeResults> => {
    const responses = await Promise.all([
      this.fetchHomePopular(),
      this.fetchHomeTrending(),
      this.fetchAiringToday(),
    ]);

    const [popular, trending, airToday] = responses;

    return { popular, trending, airToday };
  };

  static fetchNetworkSeries = (
    network: TmdbNetworks
  ): Promise<ITmdbSearchResults> => {
    return this.fetchSeriesByNetwork(network);
  };

  private static fetchSeriesByNetwork = async (network: TmdbNetworks) => {
    const url = "/discover/tv?with_networks=" + network;

    const response = await axiosClient.get<ITmdbSearchResults>(url);

    return response.data;
  };

  private static fetchHomePopular = async () => {
    const url = `/trending/tv/day?language=tr-TR`;

    const response = await axiosClient.get(url);

    return response.data;
  };

  private static fetchHomeTrending = async () => {
    const url = "/trending/tv/week?language=tr-TR";

    const response = await axiosClient.get(url);

    return response.data;
  };

  private static fetchAiringToday = async () => {
    const url = `/tv/airing_today?language=tr-TR`;

    const response = await axiosClient.get(url);

    return response.data;
  };
}

export default TmdbService;

import { TMDB_API_KEY } from "../constants";
import { IHomeResults } from "../models";
import { TmdbNetworks } from "../types/networks";
import {
  Episode,
  ISeasonEpisodes,
  ITmdbSearchResults,
  ITmdbSerieDetails,
} from "../types/tmdb";

const BASE_URL = "https://api.themoviedb.org/3";
const DEFAULT_OPTIONS = {
  headers: {
    Authorization: "Bearer " + TMDB_API_KEY,
  },
};

class TmdbService {
  private static async fetchTMDB<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, DEFAULT_OPTIONS);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  static fetchSeasonEpisodes = async (tvId: number, seasonNumber: number) => {
    return this.fetchTMDB<ISeasonEpisodes>(
      `/tv/${tvId}/season/${seasonNumber}?language=tr-TR`
    );
  };

  static searchSeries = async (query: string) => {
    return this.fetchTMDB<ITmdbSearchResults>(
      `/search/tv?query=${query}&language=tr-TR`
    );
  };

  static fetchSerie = async (serieId: number) => {
    return this.fetchTMDB<ITmdbSerieDetails>(
      `/tv/${serieId}?append_to_response=episode_groups&language=tr-TR`
    );
  };

  static fetchEpisode = async (
    serieId: number,
    seasonNumber: number,
    episodeNumber: number
  ) => {
    return this.fetchTMDB<Episode>(
      `/tv/${serieId}/season/${seasonNumber}/episode/${episodeNumber}?language=tr-TR`
    );
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
    network: TmdbNetworks,
    page: number = 1
  ): Promise<ITmdbSearchResults> => {
    return this.fetchSeriesByNetwork(network, page);
  };

  private static fetchSeriesByNetwork = async (
    network: TmdbNetworks,
    page: number = 1
  ) => {
    return this.fetchTMDB<ITmdbSearchResults>(
      `/discover/tv?with_networks=${network}&page=${page}&language=tr-TR&with_status=0`
    );
  };

  private static fetchHomePopular = async () => {
    return this.fetchTMDB<ITmdbSearchResults>(
      `/trending/tv/day?language=tr-TR`
    );
  };

  private static fetchHomeTrending = async () => {
    return this.fetchTMDB<ITmdbSearchResults>(
      "/trending/tv/week?language=tr-TR"
    );
  };

  private static fetchAiringToday = async () => {
    return this.fetchTMDB<ITmdbSearchResults>(
      `/tv/airing_today?language=tr-TR`
    );
  };
}

export default TmdbService;

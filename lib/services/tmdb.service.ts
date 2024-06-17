import axios from "axios";
import { BASE_URL, TMDB_API_KEY } from "../constants";
import { ISeasonEpisodes } from "../types/tmdb";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: "Bearer " + TMDB_API_KEY,
  },
});

class TmdbService {
  static fetchSeasonEpisodes = async (tvId: number, seasonNumber: number) => {
    const url = `https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?language=tr-TR`;

    const response = await axiosClient.get<ISeasonEpisodes>(url);

    return response.data;
  };
}

export default TmdbService;

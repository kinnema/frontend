import axios from "axios";
import { Configuration, DefaultApi } from "../api";
import { BASE_URL } from "../constants";
import { IWatchResult } from "../models";

export const appAxiosClient = axios.create({
  withCredentials: true,
});
const apiConfig = new Configuration();
export const apiClient = new DefaultApi(apiConfig, BASE_URL, appAxiosClient);

export default class AppService {
  static fetchSeries = async (
    serie: string,
    season: number,
    chapter: number
  ): Promise<IWatchResult> => {
    const search_params = new URLSearchParams();
    search_params.append("serie_name", serie);
    search_params.append("season", season.toString());
    search_params.append("episode", chapter.toString());

    const response = await axios.get(`/watch?${search_params}`, {
      responseType: "stream",
    });
    return JSON.parse(response.data);
  };
}

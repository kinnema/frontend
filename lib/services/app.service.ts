import axios from "axios";
import { BASE_URL } from "../constants";
import { IWatchResult } from "../models";
import { useAuthStore } from "../stores/auth.store";

export const appAxiosClient = axios.create({
  baseURL: BASE_URL,
});

appAxiosClient.interceptors.request.use(
  function (config) {
    const accessToken = useAuthStore.getState().access_token;
    if (accessToken) {
      config.headers.Authorization = "Bearer " + accessToken;
    }
    return config;
  },
  function (error) {}
);

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

    const response = await appAxiosClient.get(`/watch?${search_params}`, {
      responseType: "stream",
    });
    return JSON.parse(response.data);
  };
}

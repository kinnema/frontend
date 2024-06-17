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
  static warmUpService = async () => {
    await appAxiosClient.post("/app/warmup");
  };

  static fetchSeries = async (
    serie: string,
    season: number,
    chapter: number
  ) => {
    const response = await appAxiosClient.get<IWatchResult>(
      `/watch/${serie}/${season}/${chapter}`
    );

    return response.data;
  };
}

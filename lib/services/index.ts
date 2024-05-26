import axios from "axios";
import { BASE_URL, TMDB_API_KEY } from "../constants";
import { useAuthStore } from "../stores/auth.store";

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: "Bearer " + TMDB_API_KEY,
  },
});

axiosClient.interceptors.request.use(
  function (config) {
    const accessToken = useAuthStore.getState().access_token;
    if (accessToken) {
      config.headers.Authorization = "Bearer " + accessToken;
    }
    return config;
  },
  function (error) {}
);

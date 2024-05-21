import axios from "axios";
import { BASE_URL, TMDB_API_KEY } from "../constants";

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: "Bearer " + TMDB_API_KEY,
  },
});

import { ApiFavoritesPostRequest } from "../api";
import { ILastWatchedMutation } from "../models";
import { apiClient } from "./app.service";

export default class UserService {
  static addToFavorites = async (data: ApiFavoritesPostRequest) => {
    const response = await apiClient.apiFavoritesPost({
      apiFavoritesPostRequest: data,
    });

    return response;
  };

  static fetchFavorites = async () => {
    const response = await apiClient.apiFavoritesGet();

    return response;
  };

  static fetchLastWatched = async () => {
    const response = await apiClient.apiLastWatchedGet();

    return response;
  };

  static addLastWatch = async (data: ILastWatchedMutation) => {
    const response = await apiClient.apiLastWatchedPost({
      lastWatchedCreateSchemaInputType: data,
    });

    return response;
  };
}

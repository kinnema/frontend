import { ApiFavoritesPostRequest, ApiLastWatchedIdPatchRequest } from "../api";
import { ILastWatchedMutation } from "../models";
import { apiClient } from "./app.service";

export default class UserService {
  static removeFromFavorites = async (favoriteId: string) => {
    const response = await apiClient.apiFavoritesIdDelete({
      id: favoriteId,
    });

    return response;
  };

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

  static deleteLastWatched = async (id: string) => {
    const response = await apiClient.apiLastWatchedIdDelete({
      id,
    });

    return response;
  };

  static fetchLastWatched = async () => {
    const response = await apiClient.apiLastWatchedGet();

    return response;
  };

  static fetchSingleLastWatched = async (tmdbId: number) => {
    const response = await apiClient.apiLastWatchedTmdbIdGet({
      tmdbId,
    });

    return response;
  };

  static patchLastWatch = async (data: ApiLastWatchedIdPatchRequest) => {
    const response = await apiClient.apiLastWatchedIdPatch(data);

    return response;
  };

  static addLastWatch = async (data: ILastWatchedMutation) => {
    const response = await apiClient.apiLastWatchedPost({
      lastWatchedCreateSchemaInputType: data,
    });

    return response;
  };
}

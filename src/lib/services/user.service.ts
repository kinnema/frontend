import { ApiFavoritesPostRequest } from "../api";
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
}

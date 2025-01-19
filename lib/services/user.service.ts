import { ILastWatchedMutation, IMutationAddFavorite } from "../models";
import { apiClient, appAxiosClient } from "./app.service";

export default class UserService {
  static addToFavorites = async (data: IMutationAddFavorite) => {
    const response = await appAxiosClient.post("/user/favorites", data);

    return response.data;
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

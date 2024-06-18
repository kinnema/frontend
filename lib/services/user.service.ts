import {
  ILastWatched,
  ILastWatchedMutation,
  IMutationAddFavorite,
} from "../models";
import { appAxiosClient } from "./app.service";

export default class UserService {
  static addToFavorites = async (data: IMutationAddFavorite) => {
    const response = await appAxiosClient.post("/user/favorites", data);

    return response.data;
  };

  static fetchLastWatched = async () => {
    const response = await appAxiosClient.get<ILastWatched[]>(
      "/user/last_watched"
    );

    return response.data;
  };

  static addLastWatch = async (data: ILastWatchedMutation) => {
    const response = await appAxiosClient.post<ILastWatched>(
      "/user/last_watched",
      data
    );

    return response.data;
  };
}

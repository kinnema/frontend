import { ILastWatchedMutation } from "../models";
import { apiClient } from "./app.service";

export default class UserService {
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

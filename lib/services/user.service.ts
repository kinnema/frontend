import { IMutationAddFavorite } from "../models";
import { appAxiosClient } from "./app.service";

export default class UserService {
  static addToFavorites = async (data: IMutationAddFavorite) => {
    const response = await appAxiosClient.post("/user/favorites", data);

    return response.data;
  };
}

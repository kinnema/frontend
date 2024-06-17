import { IMutationAddFavorite } from "../models";
import { appAxiosClient } from "./app.service";

export async function addToFavorites(data: IMutationAddFavorite) {
  const response = await appAxiosClient.post("/user/favorites", data);

  return response.data;
}

import { axiosClient } from ".";
import { IMutationAddFavorite } from "../models";

export async function addToFavorites(data: IMutationAddFavorite) {
  const response = await axiosClient.post("/user/favorites", data);

  return response.data;
}

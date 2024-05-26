import { axiosClient } from ".";
import { ILoginResponse } from "../models";

export async function login(data: FormData) {
  const response = await axiosClient.post<ILoginResponse>("/auth/login", data);

  return response.data;
}

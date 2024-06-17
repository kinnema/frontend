import { ILoginResponse } from "../models";
import { appAxiosClient } from "./app.service";

export async function login(data: FormData) {
  const response = await appAxiosClient.post<ILoginResponse>(
    "/auth/login",
    data
  );

  return response.data;
}

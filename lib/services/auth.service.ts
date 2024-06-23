import { REGISTER_FORM_INPUTS } from "../forms/register.form";
import { ILoginResponse } from "../models";
import { appAxiosClient } from "./app.service";

export class AuthService {
  static async register(data: REGISTER_FORM_INPUTS) {
    const response = await appAxiosClient.post("/auth/register", data);

    return response.data;
  }

  static async login(data: FormData) {
    const response = await appAxiosClient.post<ILoginResponse>(
      "/auth/login",
      data
    );

    return response.data;
  }
}

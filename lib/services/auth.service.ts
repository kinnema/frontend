import { logoutServerAction } from "@/app/actions/auth/logoutAction";
import { ApiAuthLoginPostRequest, CreateUserInputType } from "../api";
import { apiClient } from "./app.service";

export class AuthService {
  static async register(data: CreateUserInputType) {
    const response = await apiClient.apiAuthRegisterPost({
      createUserInputType: data,
    });

    return response;
  }

  static async login(data: ApiAuthLoginPostRequest) {
    const response = await apiClient.apiAuthLoginPost({
      apiAuthLoginPostRequest: data,
    });

    return response;
  }

  static async logout() {
    await logoutServerAction();
  }
}

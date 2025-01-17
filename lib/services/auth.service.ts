import { ApiAuthLoginPostRequest, ApiAuthRegisterPostRequest } from "../api";
import { apiClient } from "./app.service";

export class AuthService {
  static async register(data: ApiAuthRegisterPostRequest) {
    const response = await apiClient.apiAuthRegisterPost(data);

    return response.data;
  }

  static async login(data: ApiAuthLoginPostRequest) {
    const response = await apiClient.apiAuthLoginPost(data);

    return response.data;
  }
}

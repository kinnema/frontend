// Client-side login action
import { apiClient } from "@/lib/services/app.service";

export async function loginServerAction(_prevState: any, data: FormData) {
  try {
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    const response = await apiClient.apiAuthLoginPost({
      apiAuthLoginPostRequest: {
        email,
        password,
      },
    });

    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      return {
        message: "Giriş başarılı",
        success: true,
      };
    }

    return {
      message: "Giriş başarısız",
      success: false,
    };
  } catch (error) {
    return {
      message: "Bir hata oluştu",
      success: false,
    };
  }
}
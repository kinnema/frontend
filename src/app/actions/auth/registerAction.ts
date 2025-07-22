// Client-side register action
import { apiClient } from "@/lib/services/app.service";

export async function registerServerAction(_prevState: any, data: FormData) {
  try {
    const username = data.get("username") as string;
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    const response = await apiClient.apiAuthRegisterPost({
      createUserInputType: {
        username,
        email,
        password,
      },
    });

    return {
      message: "Kayıt başarılı",
      success: true,
    };
  } catch (error) {
    return {
      message: "Kayıt başarısız",
      success: false,
    };
  }
}
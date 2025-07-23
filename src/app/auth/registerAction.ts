"use server";

import { REGISTER_FORM_INPUTS } from "@/lib/forms/register.form";
import { AuthService } from "@/lib/services/auth.service";

export async function registerServerAction(
  _prevState: any,
  data: REGISTER_FORM_INPUTS
) {
  try {
    await AuthService.register(data);

    return {
      message: "Kayıt başarılı",
      success: true,
    };
  } catch (error) {
    return {
      message: (error as Error).message,
      success: false,
    };
  }
}

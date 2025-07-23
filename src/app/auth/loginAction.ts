"use server";

import { LOGIN_FORM_INPUTS } from "@/lib/forms/login.form";
import { apiClient } from "@/lib/services/app.service";
import { cookies } from "next/headers";

export async function loginServerAction(
  _prevState: any,
  data: LOGIN_FORM_INPUTS
) {
  try {
    const _cookie = await cookies();

    const response = await apiClient.apiAuthLoginPostRaw({
      apiAuthLoginPostRequest: data,
    });

    const responseCookies = response.raw.headers.get("Set-Cookie");

    if (responseCookies) {
      let cookie = responseCookies.split("access_token=")[1];
      cookie = cookie?.split(";")[0];

      _cookie.set("access_token", cookie!, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "strict",
      });

      return {
        message: "Login successful",
        success: true,
        data: await response.value(),
      };
    }

    throw new Error("Login failed");
  } catch (error) {
    return {
      message: (error as Error).message,
      success: false,
    };
  }
}

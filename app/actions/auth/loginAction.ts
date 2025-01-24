"use server";

import { ApiAuthLoginPostRequest } from "@/lib/api";
import { apiClient } from "@/lib/services/app.service";
import { cookies } from "next/headers";

export async function loginServerAction(data: ApiAuthLoginPostRequest) {
  const response = await apiClient.apiAuthLoginPostRaw({
    apiAuthLoginPostRequest: data,
  });

  const responseCookies = response.raw.headers.get("Set-Cookie");

  if (responseCookies) {
    let cookie = responseCookies.split("access_token=")[1];
    cookie = cookie?.split(";")[0];

    cookies().set("access_token", cookie!, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "strict",
    });
  }

  return response.value();
}

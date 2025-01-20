"use server";

import { apiClient } from "@/lib/services/app.service";
import { cookies } from "next/headers";

export async function logoutServerAction() {
  await apiClient.apiAuthLogoutDelete();
  cookies().delete("access_token");
}

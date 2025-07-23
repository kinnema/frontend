"use server";

import { cookies } from "next/headers";

export async function getAccessToken() {
  const cookie = await cookies();
  return cookie.get("access_token")?.value;
}

"use server";

import { cookies } from "next/headers";

export async function getAccessToken() {
  return cookies().get("access_token")?.value;
}

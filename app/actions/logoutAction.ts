"use server";

import { cookies } from "next/headers";

export async function logoutServerAction() {
  cookies().delete("access_token");
}

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const protectedRoutes = ["/watch", "/favorites"];

  if (protectedRoutes.includes(pathname)) {
    const cookie = await cookies();
    const accessToken = cookie.get("access_token");

    if (!accessToken) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${pathname}`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

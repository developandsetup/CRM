import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TOKEN_KEY = "crm_access_token";

const publicPaths = ["/login", "/register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ignore next internals
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico")) {
    return NextResponse.next();
  }

  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const token = req.cookies.get(TOKEN_KEY)?.value;

  if (!token && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api).*)"],
};
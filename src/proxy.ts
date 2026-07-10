import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";

const PUBLIC_ROUTES = ["/login", "/solicitar", "/acompanhar"];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api") || isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    const loginUrl = new URL("/login", req.nextUrl);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};

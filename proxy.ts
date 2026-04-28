import { NextRequest, NextResponse } from "next/server";
import { getToken as getConvexToken } from "@convex-dev/better-auth/utils";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

function isProtectedRoute(pathname: string) {
  return (
    pathname === "/chat" ||
    pathname.startsWith("/chat/") ||
    pathname === "/integrations" ||
    pathname.startsWith("/integrations/") ||
    pathname.startsWith("/settings/")
  );
}

function isAdminRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export async function proxy(request: NextRequest) {
  const { token } = await getConvexToken(
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
    new Headers(request.headers)
  );
  const isAuthenticated = Boolean(token);

  if (isAdminRoute(request.nextUrl.pathname)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }

    const isAdmin = await fetchQuery(
      api.adminUsers.hasAdminPermission,
      {},
      { token }
    );

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (isProtectedRoute(request.nextUrl.pathname) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/chat/:path*",
    "/integrations/:path*",
    "/settings/:path*",
    "/admin/:path*",
  ],
};

import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";

// Auth pages — signed-in users are bounced away from these
const AUTH_ROUTES = new Set([
  "/login",
  "/signup",
  "/verify-email",
  "/forgot-password",
]);

// Everything below these prefixes requires a session
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/admin",
  "/organizations",
  "/onboarding",
];

// Extra per-route role requirements — the most specific path wins
const routeRules = [
  {
    path: "/admin",
    appRoles: ["admin", "superadmin"],
  },
  {
    path: "/dashboard",
    appRoles: ["user"],
  },
  {
    path: "/dashboard/settings",
    appRoles: ["user", "admin", "superadmin"],
  },
  {
    path: "/organizations/settings",
    appRoles: ["user"],
  },
  {
    path: "/dashboard/billing",
    appRoles: ["user"],
  },
  {
    path: "/dashboard/usage",
    appRoles: ["user"],
  },
  // Add other role protected routes here...
];

function isAppRoute(pathname: string): boolean {
  if (AUTH_ROUTES.has(pathname)) return true;
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public marketing, blog and help pages need no session check
  if (!isAppRoute(pathname)) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  // Unauthenticated users trying to access protected routes → login
  if (isProtectedRoute && !session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Authenticated users trying to access auth routes → dashboard
  if (isAuthRoute && session?.user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const rule = [...routeRules]
    .sort((a, b) => b.path.length - a.path.length)
    .find((r) => pathname === r.path || pathname.startsWith(r.path + "/"));

  if (rule) {
    if (!session || !session.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (rule.appRoles && !rule.appRoles.includes(session.user.role!)) {
      if (session.user.role === "admin" || session.user.role === "superadmin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.redirect(
        new URL("/dashboard?error=unauthorized-app-role", request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  // Runs on all paths except Next.js internals, static files and API routes.
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*$).*)"],
};

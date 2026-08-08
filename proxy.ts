import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import createMiddleware from "next-intl/middleware";

import { auth } from "@/lib/auth";
import { defaultLocale, locales } from "@/i18n/config";

// Locale routing middleware for public marketing + docs routes
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

// Known auth routes handled by (app)/(auth) — no locale prefix
const AUTH_ROUTES = new Set([
  "/login",
  "/signup",
  "/verify-email",
  "/forgot-password",
  "/accept-invite",
]);

// Known protected route prefixes handled by (app)/(protected) — no locale prefix
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/admin",
  "/organizations",
  "/onboarding",
];

// Returns true if the path should be handled by the auth/protected logic (no locale routing).
// Everything else is treated as a public/marketing path and locale-prefixed.
function isAppRoute(pathname: string): boolean {
  if (AUTH_ROUTES.has(pathname)) return true;
  if (PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/")))
    return true;
  return false;
}

const routeRules = [
  {
    path: "/admin",
    appRoles: ["admin", "superadmin"],
  },
  {
    path: "/dashboard",
    appRoles: ["user"],
    teamRoles: ["owner", "admin", "member"],
  },
  {
    path: "/dashboard/settings",
    appRoles: ["user", "admin", "superadmin"],
  },
  {
    path: "/organizations/settings",
    appRoles: ["user"],
    teamRoles: ["owner", "admin"],
  },
  {
    path: "/organizations/members",
    appRoles: ["user"],
  },
  {
    path: "/dashboard/billing",
    appRoles: ["user"],
    teamRoles: ["owner", "admin"],
  },
  {
    path: "/dashboard/usage",
    appRoles: ["user"],
    teamRoles: ["owner", "admin"],
  },
  // Add other role protected routes here...
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public marketing/docs paths → locale routing (handles /terms, /privacy, /blog/*, etc.)
  if (!isAppRoute(pathname)) {
    return intlMiddleware(request);
  }

  // Auth + protected routes → existing session-based auth logic
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

  const sortedRouteRules = [...routeRules].sort(
    (a, b) => b.path.length - a.path.length,
  );

  const rule = sortedRouteRules.find(
    (r) => pathname === r.path || pathname.startsWith(r.path + "/"),
  );

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

    if (rule.teamRoles) {
      try {
        const activeMember = await auth.api.getActiveMemberRole({
          headers: await headers(),
        });

        if (!activeMember || !rule.teamRoles.includes(activeMember.role)) {
          return NextResponse.redirect(
            new URL("/dashboard?error=unauthorized-team-role", request.url),
          );
        }
      } catch (error) {
        console.error("Middleware Organization Check Failed:", error);
        return NextResponse.redirect(
          new URL("/organizations?error=auth-failure", request.url),
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  // Broad matcher: runs on all paths except Next.js internals, static files, and API routes.
  // The proxy function itself decides whether to apply locale routing or auth logic.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*$).*)",
  ],
};

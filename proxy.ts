// proxy.ts
import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-change-in-production");

async function verifyAuthToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

function createRouteMatcher(patterns: string[]) {
  const regexes = patterns.map(pattern => 
    new RegExp(`^${pattern.replace(/\(\.\*\)/g, '.*').replace(/\//g, '\\/')}$`)
  );
  return (pathname: string) => regexes.some(re => re.test(pathname));
}

// Define all route matchers for different sections
const matchers = {
  // Public routes - accessible to everyone
  public: createRouteMatcher([
    "/",
    "/about",
    "/contact",
    "/rooms(.*)",
    "/book-now",
    "/services(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/forgot-password(.*)",
    "/reset-password(.*)",
    "/pending-approval",
    "/unauthorized",
    "/api/public/(.*)",
    "/api/webhooks/(.*)",
    "/api/auth/(.*)",
  ]),

  // Guest routes - authenticated users only
  guest: createRouteMatcher([
    "/my-bookings(.*)",
    "/profile(.*)",
    "/bookings(.*)",
    "/payments(.*)",
    "/reviews(.*)",
    "/admin/setup(.*)",
    "/api/debug/(.*)",
    "/api/guest/(.*)",
  ]),

  // Staff routes - staff and admin only
  staff: createRouteMatcher([
    "/staff(.*)",
    "/dashboard",
    "/housekeeping(.*)",
    "/inventory(.*)",
    "/vendors(.*)",
    "/expenses(.*)",
    "/reports(.*)",
    "/api/staff/(.*)",
  ]),

  // Admin routes - admin only
  admin: createRouteMatcher([
    "/admin(.*)",
    "/settings(.*)",
    "/users(.*)",
    "/analytics(.*)",
    "/api/admin/(.*)",
    "/api/payments(.*)",
    "/api/sales(.*)",
  ]),

  // Management routes - staff and admin (specific sections)
  management: createRouteMatcher([
    "/check-in(.*)",
    "/check-out(.*)",
    "/reservations(.*)",
    "/room-management(.*)",
    "/billing(.*)",
    "/api/management/(.*)",
  ]),
};

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const authToken = request.cookies.get("auth_token")?.value;

  let userId: string | null = null;
  let userRole: "guest" | "staff" | "admin" = "guest";
  let isApproved = true;
  let tokenMissingClaims = false;

  if (authToken) {
    const payload = await verifyAuthToken(authToken);
    if (payload) {
      userId = payload.userId as string;
      if (
        payload.role === "guest" ||
        payload.role === "staff" ||
        payload.role === "admin"
      ) {
        userRole = payload.role;
      } else {
        tokenMissingClaims = true;
      }
      if (typeof payload.approved === "boolean") {
        isApproved = payload.approved;
      } else {
        tokenMissingClaims = true;
      }
    }
  }

  // Helper function to create redirect response
  const redirectTo = (path: string, clearAuthToken = false) => {
    const url = new URL(path, request.url);
    if (path === "/sign-in") {
      url.searchParams.set("redirect_url", pathname);
    }
    const response = NextResponse.redirect(url);
    if (clearAuthToken) {
      response.cookies.delete("auth_token");
    }
    return response;
  };

  // Check if user is authenticated
  const isAuthenticated = !!userId;

  // Check user permissions
  const isAdmin = userRole === "admin";
  const isStaff = userRole === "staff" || userRole === "admin";
  const isGuest =
    userRole === "guest" || userRole === "staff" || userRole === "admin";

  // 1. Public routes - always allow
  if (matchers.public(pathname)) {
    return NextResponse.next();
  }

  // If token exists but lacks role/approval claims (old format), force re-login.
  if (isAuthenticated && tokenMissingClaims) {
    return redirectTo("/sign-in", true);
  }

  // 2. Authentication check for all protected routes
  if (
    !isAuthenticated &&
    (matchers.guest(pathname) ||
     matchers.staff(pathname) ||
     matchers.admin(pathname) ||
     matchers.management(pathname))
  ) {
    return redirectTo("/sign-in");
  }

  // 3. Check approval status for non-public routes
  if (
    isAuthenticated &&
    !isApproved &&
    pathname !== "/pending-approval"
  ) {
    return redirectTo("/pending-approval");
  }

  // 4. Admin routes - admin only
  if (matchers.admin(pathname) && !isAdmin) {
    return redirectTo("/unauthorized");
  }

  // 5. Staff routes - staff and admin only
  if (matchers.staff(pathname) && !isStaff) {
    return redirectTo("/unauthorized");
  }

  // 6. Management routes - staff and admin only
  if (matchers.management(pathname) && !isStaff) {
    return redirectTo("/unauthorized");
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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
    "/api/public/(.*)",
    "/api/webhooks/(.*)",
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

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const metadata = sessionClaims?.metadata as
    | { role?: "guest" | "staff" | "admin"; approved?: boolean }
    | undefined;
  let userRole = metadata?.role;
  let isApproved = metadata?.approved;
  const pathname = new URL(req.url).pathname;

  // Validate role is one of the expected values
  const validRoles = ["guest", "staff", "admin"];
  const isValidRole = userRole && validRoles.includes(userRole);

  // Handle users without metadata (new signups)
  if (userId && !userRole) {
    // For authenticated users without role, set defaults but don't do heavy operations
    console.log(`⚠️ User ${userId} has no role metadata, using defaults`);

    // Set default values to allow authentication to proceed
    userRole = "guest";
    isApproved = true;
  }

  // Debug logging
  if (process.env.NODE_ENV === "development") {
    console.log(
      `🔍 Middleware - Path: ${pathname}, UserId: ${userId}, Role: ${userRole}, Approved: ${isApproved}, IsValidRole: ${isValidRole}`
    );
  }

  // Helper function to create redirect response
  const redirectTo = (path: string) =>
    NextResponse.redirect(new URL(path, req.url));
  const redirectToSignIn = () => {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(signInUrl);
  };

  // Check if user is authenticated
  const isAuthenticated = !!userId;

  // Check user permissions
  const isAdmin = userRole === "admin";
  const isStaff = userRole === "staff" || userRole === "admin";
  const isGuest =
    userRole === "guest" || userRole === "staff" || userRole === "admin"; // Guests, staff, and admin can access guest areas

  // 1. Public routes - always allow
  if (matchers.public(req)) {
    return NextResponse.next();
  }

  // 2. Authentication check for all protected routes
  if (
    !isAuthenticated &&
    (matchers.guest(req) ||
      matchers.staff(req) ||
      matchers.admin(req) ||
      matchers.management(req))
  ) {
    return redirectToSignIn();
  }

  // 3. Check approval status for non-public routes
  if (
    isAuthenticated &&
    isApproved === false &&
    !matchers.public(req) &&
    pathname !== "/pending-approval"
  ) {
    console.log(`❌ Approval required for ${pathname} - User not approved`);
    return redirectTo("/pending-approval");
  }

  // 4. Admin routes - admin only
  if (matchers.admin(req)) {
    if (!isAdmin) {
      console.log(
        `❌ Admin access denied for ${pathname} - UserRole: ${userRole}, IsAdmin: ${isAdmin}`
      );
      return redirectTo("/unauthorized");
    }
    console.log(`✅ Admin access granted for ${pathname}`);
  }

  // 5. Staff routes - staff and admin only
  if (matchers.staff(req)) {
    if (!isStaff) {
      console.log(
        `❌ Staff access denied for ${pathname} - UserRole: ${userRole}, IsStaff: ${isStaff}`
      );
      return redirectTo("/unauthorized");
    }
    console.log(`✅ Staff access granted for ${pathname}`);
  }

  // 6. Management routes - staff and admin only
  if (matchers.management(req)) {
    if (!isStaff) {
      console.log(
        `❌ Management access denied for ${pathname} - UserRole: ${userRole}, IsStaff: ${isStaff}`
      );
      return redirectTo("/unauthorized");
    }
    console.log(`✅ Management access granted for ${pathname}`);
  }

  // Allow the request to proceed
  console.log(`✅ Request allowed for ${pathname}`);
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

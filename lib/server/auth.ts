import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { User } from "@/models/User";
import dbConnect from "@/lib/db";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-change-in-production");
const DEFAULT_EXPIRES_IN = process.env.JWT_EXPIRES_IN_DEFAULT || "1d";
const REMEMBER_EXPIRES_IN = process.env.JWT_EXPIRES_IN_REMEMBER || "30d";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function generateToken(
  userId: string,
  rememberMe: boolean = false,
  role: "guest" | "staff" | "admin" = "guest",
  approved: boolean = true
) {
  const expiresIn = rememberMe ? REMEMBER_EXPIRES_IN : DEFAULT_EXPIRES_IN;

  return new SignJWT({ userId, role, approved })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.userId as string;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string, rememberMe: boolean = false) {
  const cookieStore = await cookies();
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;

  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    path: "/",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  const userId = await verifyToken(token);
  if (!userId) return null;

  await dbConnect();
  const user = await User.findById(userId).select("-passwordHash -resetTokenHash -resetTokenExpiresAt");

  return user ? user.toObject() : null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireRole(requiredRole: "guest" | "staff" | "admin") {
  const user = await requireAuth();

  const roleHierarchy = { guest: 0, staff: 1, admin: 2 };
  const userRole = (user.role as "guest" | "staff" | "admin") || "guest";
  const userLevel = roleHierarchy[userRole];
  const requiredLevel = roleHierarchy[requiredRole];

  if (userLevel < requiredLevel) throw new Error("Forbidden");
  if (!user.approved && requiredLevel > 0) throw new Error("User not approved");

  return user;
}

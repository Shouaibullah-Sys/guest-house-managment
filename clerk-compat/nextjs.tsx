"use client";

import Link from "next/link";
import React from "react";
import { useAuthStore } from "@/store/auth-store";

type CompatUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  primaryEmailAddress?: { emailAddress: string };
  imageUrl?: string;
  publicMetadata?: {
    role?: "guest" | "staff" | "admin";
    approved?: boolean;
  };
};

function splitName(name?: string) {
  const fullName = name?.trim() || "";
  if (!fullName) return { firstName: "", lastName: "" };
  const [firstName = "", ...rest] = fullName.split(" ");
  return { firstName, lastName: rest.join(" ") };
}

function useCompatSession() {
  const authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  const names = splitName(authUser?.name);
  const normalizedUser: CompatUser | null = authUser
    ? {
        id: authUser._id,
        firstName: names.firstName,
        lastName: names.lastName,
        fullName: authUser.name,
        primaryEmailAddress: authUser.email
          ? { emailAddress: authUser.email }
          : undefined,
        imageUrl: authUser.image || undefined,
        publicMetadata: {
          role: authUser.role,
          approved: authUser.approved,
        },
      }
    : null;

  // Prevent redirect flicker: while auth is hydrating, treat session state as pending.
  const isSignedIn = isLoading ? true : isAuthenticated;

  return { isLoaded: !isLoading, user: normalizedUser, isSignedIn };
}

export function useAuth() {
  const { isLoaded, user, isSignedIn } = useCompatSession();

  return {
    isLoaded,
    isSignedIn,
    userId: user?.id ?? null,
    sessionClaims: user
      ? { metadata: { role: user.publicMetadata?.role, approved: user.publicMetadata?.approved } }
      : null,
    getToken: async () => (isSignedIn ? "local-session" : null),
  };
}

export function useUser() {
  const { isLoaded, user, isSignedIn } = useCompatSession();
  return { isLoaded, isSignedIn, user };
}

export function SignedIn({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  return isSignedIn ? <>{children}</> : null;
}

export function SignedOut({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  return isSignedIn ? null : <>{children}</>;
}

export function SignInButton({
  children,
  mode,
}: {
  children?: React.ReactNode;
  mode?: string;
}) {
  void mode;
  return <Link href="/sign-in">{children ?? "Sign in"}</Link>;
}

export function UserButton({
  afterSignOutUrl = "/sign-in",
}: {
  afterSignOutUrl?: string;
}) {
  return <Link href={afterSignOutUrl}>Profile</Link>;
}

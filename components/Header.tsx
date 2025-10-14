"use client";

import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role as string;

  // Check if user has admin or laboratory access
  const hasLabAccess = userRole === "admin" || userRole === "laboratory";

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Dr. Sebghat Clinic
          </Link>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/">
                  <Button variant="ghost">Home</Button>
                </Link>
              </li>
              <li>
                <Link href="/qa">
                  <Button variant="ghost">Q&A</Button>
                </Link>
              </li>

              {/* Show Laboratory link for admin and laboratory roles */}
              {hasLabAccess && (
                <li>
                  <Link href="/laboratory">
                    <Button variant="ghost">Laboratory</Button>
                  </Link>
                </li>
              )}

              {/* Show Admin link only for admin role */}
              {userRole === "admin" && (
                <li>
                  <Link href="/admin">
                    <Button variant="ghost">Admin</Button>
                  </Link>
                </li>
              )}

              <SignedIn>
                <li className="flex items-center">
                  <UserButton />
                </li>
              </SignedIn>
              <SignedOut>
                <li className="flex items-center rounded bg-black px-2 font-bold text-white">
                  <SignInButton mode="modal" />
                </li>
              </SignedOut>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "@/components/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dr. Sebghat Clinic - Laboratory Management System",
  description:
    "Professional laboratory management system for medical diagnostics and patient care",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <QueryProvider>
        <html lang="en">
          <body className={inter.className}>
            <div className="min-h-screen flex flex-col mb-48">
              <main className="flex-grow">{children}</main>
            </div>
          </body>
        </html>
      </QueryProvider>
    </ClerkProvider>
  );
}

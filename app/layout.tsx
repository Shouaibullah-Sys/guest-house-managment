// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "@/components/QueryProvider";
import { Toaster } from "sonner";
import { UserMetadataSync } from "@/components/UserMetadataSync";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Totakhail-Hotel",
  description: "Professional Hotel management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <QueryProvider>
        <UserMetadataSync />
        <html lang="en">
          <body className={inter.className}>
            <div className="min-h-screen flex flex-col mb-48">
              <main className="flex-grow">{children}</main>
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "hsl(var(--background))",
                  color: "hsl(var(--foreground))",
                  border: "1px solid hsl(var(--border))",
                },
              }}
            />
          </body>
        </html>
      </QueryProvider>
    </ClerkProvider>
  );
}

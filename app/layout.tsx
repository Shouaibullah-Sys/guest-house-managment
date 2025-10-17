// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import Footer from "@/components/Footer"; // Import the new Footer component

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
      <html lang="en">
        <body className={inter.className}>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer /> {/* Add Footer here */}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AdminNavigator from "@/components/admin/AdminNavigator";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Dashboard - Hotel Management System",
  description: "Administrative dashboard for hotel management system",
  keywords: "admin, dashboard, hotel, management",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <AdminNavigator />
          <main className="lg:pl-64">
            <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}

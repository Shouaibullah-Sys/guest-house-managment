// app/unauthorized/page.tsx
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function UnauthorizedPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  const metadata = (user.publicMetadata || {}) as {
    role?: "guest" | "staff" | "admin";
    approved?: boolean;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.342 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page with your current
            role.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700">Your Role:</span>
              <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-medium">
                {metadata.role || "guest"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Approval Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  metadata.approved
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {metadata.approved ? "Approved" : "Pending"}
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <a
            href="/dashboard"
            className="block w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </a>
          {metadata.role === "guest" && (
            <a
              href="/contact"
              className="block w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Request Higher Access
            </a>
          )}
          <a
            href="/profile"
            className="block w-full py-2 px-4 text-blue-600 hover:text-blue-700 transition-colors"
          >
            View Profile
          </a>
        </div>
      </div>
    </div>
  );
}

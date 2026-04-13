// app/unauthorized/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/auth";

export default async function UnauthorizedPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const metadata = {
    role: user.role,
    approved: user.approved,
  } as {
    role?: "guest" | "staff" | "admin";
    approved?: boolean;
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center font-sans text-slate-900 overflow-hidden">
      {/* PREMIUM BACKGROUND: Hotel Lobby Image with Blur Effect */}
      <div className="absolute inset-0 z-[-1]">
        <div
          className="absolute inset-0 bg-cover bg-center blur-[8px] scale-110"
          style={{
            backgroundImage:
              "url('https://picsum.photos/seed/grandhotel/1920/1080')",
          }}
        ></div>
        {/* Dark overlay to ensure text readability against the bright image */}
        <div className="absolute inset-0 bg-slate-900/20"></div>
      </div>

      {/* GLASSMORPHISM CARD */}
      <div className="relative z-10 max-w-md w-full bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl p-8 text-center m-4">
        {/* Icon Container */}
        <div className="w-20 h-20 bg-red-50/80 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <svg
            className="w-10 h-10 text-red-600"
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

        {/* Typography */}
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-3 tracking-tight">
          Access Denied
        </h1>
        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
          You don't have permission to access this page with your current role.
        </p>

        {/* User Metadata / Status Box */}
        <div className="bg-white/60 border border-white/80 rounded-xl p-6 mb-8 text-left shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Your Role
            </span>
            <span className="px-3 py-1 bg-slate-200 text-slate-800 rounded-full text-sm font-medium shadow-sm">
              {metadata.role || "guest"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Approval Status
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border shadow-sm ${
                metadata.approved
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
              }`}
            >
              {metadata.approved ? "Approved" : "Pending"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <a
            href="/"
            className="block w-full py-3.5 px-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-center font-semibold tracking-wide"
          >
            Get Back
          </a>
          {metadata.role === "guest" && (
            <a
              href="/"
              className="block w-full py-3.5 px-4 border border-slate-900/20 bg-transparent text-slate-900 rounded-lg hover:bg-slate-900/5 transition-colors text-center font-medium"
            >
              Request Higher Access
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

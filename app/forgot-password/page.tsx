"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        setError("Failed to submit request");
        return;
      }

      // API intentionally returns success even when email doesn't exist.
      setSuccess(true);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center font-sans text-slate-900 overflow-hidden">
      {/* PREMIUM BACKGROUND: Hotel Bar/Lounge Image with Blur */}
      <div className="absolute inset-0 z-[-1]">
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm transform scale-110"
          style={{
            backgroundImage:
              "url('https://picsum.photos/seed/hotelbar/1920/1080')",
          }}
        ></div>
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-slate-900/30"></div>
      </div>

      {/* GLASS CARD */}
      <div className="relative z-10 max-w-md w-full bg-white/85 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl p-8 m-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors mb-4"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Link>

        <div className="text-center mb-8">
          {/* Decorative Key Icon */}
          <div className="w-12 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>

          <h2 className="text-4xl font-serif font-bold text-slate-900 mb-2 tracking-tight">
            Forgot Password
          </h2>
          <p className="text-slate-600">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        {/* SUCCESS STATE */}
        {success ? (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-green-50/90 backdrop-blur border border-green-200 text-green-800 px-4 py-4 rounded-lg text-sm flex items-start">
              <svg
                className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                If an account exists for <strong>{email}</strong>, you will
                receive a password reset link shortly.
              </span>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/sign-in"
                className="inline-block font-bold text-slate-900 hover:text-slate-700 hover:underline transition-all"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          /* FORM STATE */
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50/90 backdrop-blur border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
                <svg
                  className="w-5 h-5 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 rounded-lg border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all shadow-sm bg-white/50"
                placeholder="you@example.com"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending link...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </div>

            {/* Back Link */}
            <div className="text-center text-sm">
              Remembered your password?{" "}
              <Link
                href="/sign-in"
                className="font-bold text-slate-900 hover:underline hover:text-slate-700 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

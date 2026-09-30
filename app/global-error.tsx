"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[CRITICAL GLOBAL ERROR]:", {
      digest: error.digest,
      message: error.message,
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 font-sans antialiased">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-slate-900 mb-2">Application Error</h1>
          <p className="text-sm text-slate-600 mb-6">
            A critical system error occurred. We apologize for the inconvenience. Please refresh or return to safety.
          </p>

          {error.digest && (
            <p className="text-xs text-slate-400 font-mono mb-6">
              Reference: <span className="select-all">{error.digest}</span>
            </p>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => reset()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors cursor-pointer"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="w-full border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-2.5 px-4 rounded-lg text-sm transition-colors text-center inline-block cursor-pointer"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}

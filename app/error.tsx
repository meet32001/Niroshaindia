"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/header/Logo";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log sanitized error with reference digest for diagnostic tracking
    console.error("[APPLICATION ERROR CAPTURED]:", {
      digest: error.digest,
      message: error.message,
    });
  }, [error]);

  return (
    <Container className="py-20 flex flex-col items-center justify-center text-center min-h-[60vh]">
      <Logo />

      <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center text-rose-600 dark:text-rose-400 mt-6">
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

      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-4">
        Something went wrong
      </h2>

      <p className="text-slate-600 dark:text-slate-400 max-w-md mt-2 text-sm leading-relaxed">
        We encountered an unexpected issue while loading this page. Our technical team has been notified.
      </p>

      {error.digest && (
        <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-3">
          Error Reference: <span className="select-all">{error.digest}</span>
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
        <button
          onClick={() => reset()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all duration-300 shadow-md cursor-pointer"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
        >
          Go to Homepage
        </Link>
        <Link
          href="/contact"
          className="text-xs text-slate-500 dark:text-slate-400 hover:underline w-full mt-2"
        >
          Need help? Contact Nirosha Customer Support
        </Link>
      </div>
    </Container>
  );
}

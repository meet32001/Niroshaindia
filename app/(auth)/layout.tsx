import React from "react";
import Link from "next/link";
import { Logo } from "@/components/header/Logo";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Link */}
      <div className="w-full max-w-md flex items-center justify-between mb-8 z-10">
        <Logo />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to store</span>
        </Link>
      </div>

      {/* Auth Card Content */}
      <div className="w-full max-w-md flex flex-col items-center justify-center z-10">
        {children}
      </div>

      {/* Footer copyright */}
      <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-600 z-10">
        &copy; {new Date().getFullYear()} Nirosha India. All rights reserved.
      </div>
    </div>
  );
}

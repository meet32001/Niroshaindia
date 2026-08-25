"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/header/Logo";

export function NoAccess() {
  return (
    <Container className="py-16 md:py-24 flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-sm">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto">
          <Lock className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Welcome Back!
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Please log in or create an account to view your saved cart items and complete your checkout seamlessly.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/sign-in"
            className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl text-sm text-center transition-all duration-300 shadow-md cursor-pointer"
          >
            Sign In / Register
          </Link>
        </div>
      </div>
    </Container>
  );
}

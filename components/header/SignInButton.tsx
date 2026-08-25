"use client";

import Link from "next/link";
import {
  ClerkLoaded,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { User } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignInButton() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="hidden sm:inline-flex h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
    );
  }

  return (
    <ClerkLoaded>
      {isSignedIn ? (
        <UserButton />
      ) : (
        <Link
          href="/sign-in"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "hidden sm:inline-flex gap-2 rounded-full border-slate-300 dark:border-slate-700 hover:border-emerald-600 hover:text-emerald-600 transition-colors cursor-pointer text-xs font-semibold"
          )}
        >
          <User className="h-4 w-4" />
          <span>Login</span>
        </Link>
      )}
    </ClerkLoaded>
  );
}

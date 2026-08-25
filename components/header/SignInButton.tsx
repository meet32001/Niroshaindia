"use client";

import {
  ClerkLoaded,
  SignedIn,
  SignedOut,
  SignInButton as ClerkSignInButton,
  UserButton,
} from "@clerk/nextjs";
import { User } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignInButton() {
  return (
    <ClerkLoaded>
      <SignedIn>
        <UserButton />
      </SignedIn>

      <SignedOut>
        <ClerkSignInButton mode="modal">
          <button
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "hidden sm:inline-flex gap-2 rounded-full border-slate-300 dark:border-slate-700 hover:border-shop-orange hover:text-shop-orange transition-colors cursor-pointer text-xs font-semibold"
            )}
          >
            <User className="h-4 w-4" />
            <span>Login</span>
          </button>
        </ClerkSignInButton>
      </SignedOut>
    </ClerkLoaded>
  );
}

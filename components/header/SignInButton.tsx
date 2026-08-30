"use client";

import Link from "next/link";
import {
  ClerkLoaded,
  Show,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { LogIn, UserPlus, Package } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignInButton() {
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="hidden sm:inline-flex h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
    );
  }

  return (
    <ClerkLoaded>
      <Show when="signed-in">
        <div className="flex items-center gap-2">
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Link
                label="My Orders"
                href="/orders"
                labelIcon={<Package className="w-4 h-4 text-emerald-600" />}
              />
            </UserButton.MenuItems>
          </UserButton>
        </div>
      </Show>
      <Show when="signed-out">
        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/sign-in"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-full border-slate-300 dark:border-slate-700 hover:border-emerald-600 hover:text-emerald-600 transition-colors cursor-pointer text-xs font-semibold px-3 py-1.5 gap-1.5"
            )}
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </Link>
          <Link
            href="/sign-up"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer text-xs font-semibold px-3 py-1.5 gap-1.5 shadow-sm"
            )}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Register</span>
          </Link>
        </div>
      </Show>
    </ClerkLoaded>
  );
}

"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignInButton() {
  return (
    <Link
      href="/sign-in"
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "hidden sm:inline-flex gap-2 rounded-full border-slate-300 dark:border-slate-700 hover:border-shop-orange hover:text-shop-orange transition-colors"
      )}
    >
      <User className="h-4 w-4" />
      <span>Sign In</span>
    </Link>
  );
}

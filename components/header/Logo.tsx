import Link from "next/link";
import { Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
  spanClassName?: string;
}

export function Logo({ className, spanClassName }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2 group", className)}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs transition-transform duration-200 group-hover:scale-105">
        <Cpu className="h-4.5 w-4.5" />
      </div>
      <span className={cn("tracking-tight font-black text-xl sm:text-2xl text-slate-900 dark:text-slate-100", spanClassName)}>
        nirosha<span className="text-emerald-600">.in</span>
      </span>
    </Link>
  );
}

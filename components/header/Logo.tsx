import Link from "next/link";
import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
  spanClassName?: string;
}

export function Logo({ className, spanClassName }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center group", className)}
    >
      <span className={cn("tracking-tight font-black text-xl sm:text-2xl text-slate-900 dark:text-slate-100 transition-colors duration-200 group-hover:text-emerald-600", spanClassName)}>
        Nirosha
      </span>
    </Link>
  );
}

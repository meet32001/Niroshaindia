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
      className={cn("flex items-center gap-1 font-black text-2xl tracking-tighter group", className)}
    >
      <span className={cn("text-slate-800 dark:text-slate-100 font-extrabold text-xl sm:text-2xl tracking-tight", spanClassName)}>
        SHOPCAR<span className="text-emerald-600">T</span>
      </span>
    </Link>
  );
}

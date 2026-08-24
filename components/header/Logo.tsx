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
      className={cn("flex items-center gap-2 font-bold text-xl text-shop-dark dark:text-white group", className)}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-shop-orange text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
        <Cpu className="h-5 w-5" />
      </div>
      <span className={cn("tracking-tight font-extrabold text-lg sm:text-xl", spanClassName)}>
        nirosha<span className="text-shop-orange">.in</span>
      </span>
    </Link>
  );
}

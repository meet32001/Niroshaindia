"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HEADER_NAV_LINKS } from "@/constants/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function HeaderMenu() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
      {HEADER_NAV_LINKS.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative py-1 transition-colors duration-200 flex items-center gap-1.5 font-medium",
              isActive
                ? "text-shop-orange font-semibold"
                : "text-slate-700 dark:text-slate-200 hover:text-shop-orange"
            )}
          >
            <span>{item.title}</span>
            {item.badge && (
              <Badge className="bg-shop-orange text-white text-[10px] px-1.5 py-0 h-4 hover:bg-shop-orange">
                {item.badge}
              </Badge>
            )}
            {/* Animated active indicator bar */}
            <span
              className={cn(
                "absolute bottom-0 left-0 h-0.5 w-full bg-shop-orange rounded-full transition-transform duration-300 origin-left scale-x-0",
                isActive && "scale-x-100"
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}

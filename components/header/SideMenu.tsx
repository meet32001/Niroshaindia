"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, UserButton } from "@clerk/nextjs";
import { X, LogIn, UserPlus, Package } from "lucide-react";
import { HEADER_NAV_LINKS } from "@/constants/navigation";
import { Logo } from "@/components/header/Logo";
import { SocialMedia } from "@/components/shared/SocialMedia";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const pathname = usePathname();
  const menuRef = useOutsideClick<HTMLDivElement>(onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-start transition-opacity duration-300">
      <div
        ref={menuRef}
        className="w-4/5 max-w-sm h-full bg-background border-r border-border p-6 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-300"
      >
        <div className="space-y-6">
          {/* Top Header */}
          <div className="flex items-center justify-between border-b pb-4">
            <Logo />
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
              aria-label="Close Menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {HEADER_NAV_LINKS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-50 text-emerald-700 dark:bg-slate-800 dark:text-emerald-400 font-semibold"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <span>{item.title}</span>
                  {item.badge && (
                    <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0 h-4">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}

            <Show when="signed-in">
              <Link
                href="/orders"
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-emerald-600" />
                  <span>My Orders</span>
                </div>
              </Link>
            </Show>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="space-y-6 pt-6 border-t border-border">
          <Show when="signed-in">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <UserButton />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  My Account
                </span>
                <span className="text-[11px] text-slate-500">
                  Logged in via Clerk
                </span>
              </div>
            </div>
          </Show>

          <Show when="signed-out">
            <div className="flex flex-col gap-2">
              <Link
                href="/sign-in"
                onClick={onClose}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full rounded-xl border-slate-300 dark:border-slate-700 font-semibold gap-2 flex items-center justify-center"
                )}
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/sign-up"
                onClick={onClose}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold gap-2 shadow-md flex items-center justify-center"
                )}
              >
                <UserPlus className="h-4 w-4" />
                <span>Register</span>
              </Link>
            </div>
          </Show>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Follow Nirosha India
            </p>
            <SocialMedia />
          </div>
        </div>
      </div>
    </div>
  );
}

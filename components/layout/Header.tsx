import Link from "next/link";
import { Search, ShoppingBag, Heart, User, Cpu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MAIN_NAV_ITEMS } from "@/constants/navigation";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Banner */}
      <div className="bg-shop-orange text-white text-xs font-medium py-1.5 text-center tracking-wide">
        Welcome to Nirosha India — India&apos;s Premier Destination for Premium Electronics & Gadgets
      </div>

      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-shop-dark dark:text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-shop-orange text-white shadow-sm">
            <Cpu className="h-5 w-5" />
          </div>
          <span className="tracking-tight">
            nirosha<span className="text-shop-orange">.in</span>
          </span>
        </Link>

        {/* Navigation items */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700 dark:text-slate-200">
          {MAIN_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-shop-orange transition-colors flex items-center gap-1.5"
            >
              {item.title}
              {item.badge && (
                <Badge className="bg-shop-orange text-white text-[10px] px-1.5 py-0 h-4">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-sm items-center relative">
          <Input
            type="search"
            placeholder="Search electronics..."
            className="w-full pl-9 pr-4 h-9 text-sm rounded-full bg-slate-100 dark:bg-slate-800 border-none focus-visible:ring-1 focus-visible:ring-shop-orange"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" className="relative" aria-label="Wishlist">
            <Heart className="h-5 w-5 text-slate-700 dark:text-slate-200" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-shop-orange hover:bg-shop-orange">
              0
            </Badge>
          </Button>

          <Button variant="ghost" size="icon" className="relative" aria-label="Cart">
            <ShoppingBag className="h-5 w-5 text-slate-700 dark:text-slate-200" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-shop-orange hover:bg-shop-orange">
              0
            </Badge>
          </Button>

          <Button variant="outline" size="sm" className="hidden sm:inline-flex gap-2 rounded-full border-slate-300">
            <User className="h-4 w-4" />
            <span>Sign In</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop Search Bar */}
      <div className="hidden md:flex flex-1 max-w-sm items-center relative">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search headphones, laptops, mobiles..."
          className="w-full pl-9 pr-8 h-9 text-xs rounded-full bg-slate-100 dark:bg-slate-800 border-none focus-visible:ring-1 focus-visible:ring-shop-orange"
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Mobile Search Icon Trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-slate-700 dark:text-slate-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle search"
      >
        <Search className="h-5 w-5" />
      </Button>
    </>
  );
}

"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SideMenu } from "@/components/header/SideMenu";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        aria-label="Open Navigation Menu"
        className="text-slate-700 dark:text-slate-200"
      >
        <Menu className="h-6 w-6" />
      </Button>

      <SideMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

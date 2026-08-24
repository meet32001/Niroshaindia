import React from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Container standardizes page and layout horizontal boundaries across desktop and mobile screens.
 */
export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full", className)}>
      {children}
    </div>
  );
}

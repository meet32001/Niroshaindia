import React from "react";
import { cn } from "@/lib/utils";

export interface TextProps extends React.HTMLAttributes<HTMLHeadingElement | HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

export function Title({ children, className, ...props }: TextProps) {
  return (
    <h2
      className={cn(
        "text-2xl md:text-3xl font-bold tracking-wide capitalize text-shop-dark dark:text-white",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export function Subtitle({ children, className, ...props }: TextProps) {
  return (
    <h3
      className={cn(
        "text-lg md:text-xl font-semibold text-shop-dark dark:text-slate-100",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function SubText({ children, className, ...props }: TextProps) {
  return (
    <p
      className={cn("text-sm text-slate-600 dark:text-slate-300 leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  );
}

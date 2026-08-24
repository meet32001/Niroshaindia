import Link from "next/link";
import { SOCIAL_LINKS } from "@/constants/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface SocialMediaProps {
  className?: string;
  iconClassName?: string;
}

export function SocialMedia({ className, iconClassName }: SocialMediaProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {SOCIAL_LINKS.map((item) => {
        const Icon = item.icon;
        return (
          <Tooltip key={item.title}>
            <TooltipTrigger>
              <Link
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center justify-center p-2 rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-shop-orange hover:border-shop-orange hover:bg-shop-orange/10 transition-all duration-200",
                  iconClassName
                )}
                aria-label={item.title}
              >
                <Icon className="h-4 w-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs bg-slate-900 text-white border-none">
              <p>{item.title}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

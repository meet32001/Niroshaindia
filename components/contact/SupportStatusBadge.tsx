"use client";

import { useEffect, useState } from "react";
import { Clock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ISTStatus {
  isOnline: boolean;
  isSunday: boolean;
  timeString: string;
}

function calculateISTStatus(): ISTStatus {
  const now = new Date();
  const istFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(now);

  const weekday = parts.find((p) => p.type === "weekday")?.value || "";
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);

  const isSunday = weekday === "Sun";
  const currentMinutes = hour * 60 + minute;
  const openMinutes = 9 * 60; // 09:00 AM IST
  const closeMinutes = 20 * 60; // 08:00 PM IST

  const isOnline = !isSunday && currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  const timeString = istFormatter.format(now);

  return { isOnline, isSunday, timeString };
}

export function SupportStatusBadge({ className }: { className?: string }) {
  const [status, setStatus] = useState<ISTStatus>({
    isOnline: true,
    isSunday: false,
    timeString: "",
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStatus(calculateISTStatus());

    const interval = setInterval(() => {
      setStatus(calculateISTStatus());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
          className
        )}
      >
        <span className="w-2 h-2 rounded-full bg-slate-400" />
        <span>Checking Desk Status...</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border shadow-2xs transition-all duration-300",
        status.isOnline
          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800"
          : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800",
        className
      )}
    >
      {status.isOnline ? (
        <>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span>Email Support Desk: Active</span>
          <span className="hidden sm:inline text-emerald-600 dark:text-emerald-400 font-normal">
            • Logging tickets in real time
          </span>
        </>
      ) : (
        <>
          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Email Support Desk: Off-Hours</span>
          <span className="hidden sm:inline text-amber-700 dark:text-amber-400 font-normal">
            • Inquiries queued for 09:00 AM IST
          </span>
        </>
      )}
    </div>
  );
}

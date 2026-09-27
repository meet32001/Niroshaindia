"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export interface DealsCountdownProps {
  expiresAt?: string | Date;
}

interface TimeLeft {
  isExpired: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Calculates remaining time until target date or deterministic end-of-week Sunday 23:59:59 IST
 */
function calculateTimeRemaining(expiresAt?: string | Date): TimeLeft {
  let targetTime: number;

  if (expiresAt) {
    targetTime = new Date(expiresAt).getTime();
  } else {
    // Deterministic fallback: Next Sunday at 23:59:59 IST (UTC+5:30)
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);
    const dayOfWeek = istTime.getUTCDay(); // 0 is Sunday
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

    const targetYear = istTime.getUTCFullYear();
    const targetMonth = istTime.getUTCMonth();
    const targetDate = istTime.getUTCDate() + daysUntilSunday;
    // 23:59:59 IST = 18:29:59 UTC
    targetTime = Date.UTC(targetYear, targetMonth, targetDate, 18, 29, 59, 999);
  }

  const diff = targetTime - Date.now();
  if (diff <= 0 || isNaN(diff)) {
    return { isExpired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { isExpired: false, days, hours, minutes, seconds };
}

export function DealsCountdown({ expiresAt }: DealsCountdownProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      setTimeLeft(calculateTimeRemaining(expiresAt));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  // 1. Hydration skeleton guard: Render identical skeleton during SSR / before mount
  if (!mounted || !timeLeft) {
    return (
      <div className="flex items-center gap-3 sm:gap-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 shadow-xs animate-pulse">
        <div className="flex items-center gap-1.5 text-amber-700/60 dark:text-amber-400/60 text-xs font-bold uppercase tracking-wider">
          <Clock className="w-4 h-4 text-amber-600/60 dark:text-amber-400/60" />
          <span className="hidden sm:inline">Deal Expires In:</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono font-bold">
          <div className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 w-9 h-6" />
          <span className="text-slate-400">:</span>
          <div className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 w-9 h-6" />
          <span className="text-slate-400">:</span>
          <div className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 w-9 h-6" />
          <span className="text-slate-400">:</span>
          <div className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 w-9 h-6" />
        </div>
      </div>
    );
  }

  // 2. Terminal expired state: Show deal concluded status badge
  if (timeLeft.isExpired) {
    return (
      <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 shadow-xs">
        <Clock className="w-4 h-4 text-slate-500 shrink-0" />
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
          Deal Concluded — New Drop Coming Soon
        </span>
      </div>
    );
  }

  // 3. Active countdown rendering
  return (
    <div className="flex items-center gap-3 sm:gap-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 shadow-xs">
      <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
        <Clock className="w-4 h-4 animate-pulse text-amber-600 dark:text-amber-400" />
        <span className="hidden sm:inline">Deal Expires In:</span>
      </div>
      <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 dark:text-white">
        <div className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
          <span className="text-emerald-700 dark:text-emerald-400">{String(timeLeft.days).padStart(2, "0")}</span>
          <span className="text-[10px] text-slate-500 ml-1 font-sans">d</span>
        </div>
        <span className="text-slate-400">:</span>
        <div className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
          <span className="text-emerald-700 dark:text-emerald-400">{String(timeLeft.hours).padStart(2, "0")}</span>
          <span className="text-[10px] text-slate-500 ml-1 font-sans">h</span>
        </div>
        <span className="text-slate-400">:</span>
        <div className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
          <span className="text-emerald-700 dark:text-emerald-400">{String(timeLeft.minutes).padStart(2, "0")}</span>
          <span className="text-[10px] text-slate-500 ml-1 font-sans">m</span>
        </div>
        <span className="text-slate-400">:</span>
        <div className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
          <span className="text-emerald-700 dark:text-emerald-400">{String(timeLeft.seconds).padStart(2, "0")}</span>
          <span className="text-[10px] text-slate-500 ml-1 font-sans">s</span>
        </div>
      </div>
    </div>
  );
}

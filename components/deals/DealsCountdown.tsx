"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function DealsCountdown() {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calculateTimeUntilSundayEnd() {
      const now = new Date();
      // Target: Next Sunday at 23:59:59 IST (UTC+5:30)
      const dayOfWeek = now.getDay(); // 0 is Sunday
      const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

      const target = new Date(now);
      target.setDate(now.getDate() + daysUntilSunday);
      target.setHours(23, 59, 59, 999);

      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      return { days, hours, minutes, seconds };
    }

    setTimeLeft(calculateTimeUntilSundayEnd());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeUntilSundayEnd());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

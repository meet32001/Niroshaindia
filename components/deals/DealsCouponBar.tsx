"use client";

import { useState } from "react";
import { Copy, Check, Ticket, CalendarClock } from "lucide-react";
import { toast } from "react-hot-toast";

interface DealsCouponBarProps {
  couponCode: string;
  isConcluded?: boolean;
}

export function DealsCouponBar({ couponCode, isConcluded = false }: DealsCouponBarProps) {
  const [copied, setCopied] = useState(false);

  // If the weekly drop is concluded, mute the coupon bar and display next drop info
  if (isConcluded) {
    return (
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-800 text-stone-600 dark:text-stone-400 text-xs font-mono font-bold shadow-xs">
        <CalendarClock className="w-4 h-4 text-stone-500 shrink-0" />
        <span>NEXT DROP: MON 09:00 AM IST</span>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    toast.success(`Coupon code ${couponCode} copied!`);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-slate-950 border border-amber-300 dark:border-amber-500/40 rounded-xl px-3.5 py-1.5 shadow-xs">
      <Ticket className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
      <span className="text-xs text-slate-500 dark:text-slate-400 hidden md:inline">VIP Code:</span>
      <code className="text-xs font-mono font-black text-amber-800 dark:text-amber-300 tracking-wider">
        {couponCode}
      </code>
      <button
        onClick={handleCopy}
        className="ml-1 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
        title="Copy coupon code"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  Loader2,
  RefreshCw,
  X,
  AlertCircle,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BankAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
  amountCents: number;
  paymentMethodLabel: string;
  customerPhone?: string;
  orderReference?: string;
}

export function BankAuthModal({
  isOpen,
  onClose,
  onSuccess,
  amountCents,
  paymentMethodLabel,
  customerPhone,
  orderReference,
}: BankAuthModalProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(45);
  const [referenceId] = useState(
    () => orderReference || `RBI-PGW-${Math.floor(10000000 + Math.random() * 90000000)}`
  );

  // Countdown timer for OTP
  useEffect(() => {
    if (!isOpen) {
      setOtp("");
      setError(null);
      setIsVerifying(false);
      setSecondsRemaining(45);
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const phoneLast4 = customerPhone ? customerPhone.slice(-4) : "4210";
  const formattedAmount = (amountCents / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleAutoFillTestOtp = () => {
    setOtp("849201");
    setError(null);
  };

  const handleAuthorize = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanOtp = otp.trim();

    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setError("Please enter a valid 6-digit numeric OTP.");
      return;
    }

    // Accept standard test OTP or any valid 6-digit code in test environment
    setError(null);
    setIsVerifying(true);

    // 1.8s simulation delay representing bank card network verification
    await new Promise((resolve) => setTimeout(resolve, 1800));

    try {
      await onSuccess();
    } catch (err: unknown) {
      setIsVerifying(false);
      const msg = err instanceof Error ? err.message : "Payment authorization failed.";
      setError(msg);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Top Bank Security Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-indigo-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] text-indigo-300 font-bold tracking-wider uppercase block">
                RBI 3D-Secure 2.0 Gateway
              </span>
              <h3 className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Verified by Visa / RuPay Secure</span>
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isVerifying}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors disabled:opacity-40"
            aria-label="Cancel transaction"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transaction Summary Panel */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Merchant</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-shop-orange" />
                Nirosha India Retail Ltd.
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Payment Mode</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 uppercase">
                {paymentMethodLabel}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Ref No.</span>
              <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                {referenceId}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Transaction Amount
              </span>
              <span className="font-black text-base text-shop-orange">
                ₹{formattedAmount}
              </span>
            </div>
          </div>

          {/* OTP Verification Form */}
          <form onSubmit={handleAuthorize} className="space-y-4">
            <div className="space-y-1.5 text-center">
              <label
                htmlFor="otp_input"
                className="text-xs font-bold text-slate-900 dark:text-slate-100 block"
              >
                Enter One-Time Password (OTP)
              </label>
              <p className="text-[11px] text-slate-500">
                OTP sent to your bank registered mobile ending in{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  ••••••{phoneLast4}
                </span>
              </p>
            </div>

            {/* Test Auto-fill Banner */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={handleAutoFillTestOtp}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-shop-orange text-[11px] font-bold border border-orange-200 dark:border-orange-800 hover:bg-orange-100 transition-colors cursor-pointer"
              >
                <span>Test OTP: 849201 (Click to auto-fill)</span>
              </button>
            </div>

            {/* 6-Digit Styled Input */}
            <div className="space-y-1">
              <input
                id="otp_input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                disabled={isVerifying}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  setError(null);
                }}
                placeholder="• • • • • •"
                className="w-full text-center text-2xl font-mono font-black tracking-widest h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-shop-orange focus:ring-4 focus:ring-orange-500/10 transition-all disabled:opacity-50"
              />

              {error && (
                <p className="text-[11px] text-rose-500 font-semibold flex items-center justify-center gap-1 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </p>
              )}
            </div>

            {/* Timer and Resend Row */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>
                {secondsRemaining > 0 ? (
                  <>Expires in 00:{secondsRemaining.toString().padStart(2, "0")}</>
                ) : (
                  <span className="text-rose-500 font-semibold">OTP expired</span>
                )}
              </span>

              <button
                type="button"
                disabled={secondsRemaining > 0 || isVerifying}
                onClick={() => {
                  setSecondsRemaining(45);
                  setError(null);
                }}
                className="text-shop-orange font-bold hover:underline disabled:opacity-40 disabled:hover:no-underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Resend OTP</span>
              </button>
            </div>

            {/* Security Certification Footer Badge */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>256-Bit SSL Encrypted • PCI-DSS Level 1 Compliant</span>
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-2">
              <Button
                id="confirm_bank_otp_button"
                type="submit"
                disabled={isVerifying || otp.length !== 6}
                className="w-full bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold py-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-shop-orange" />
                    <span>Verifying transaction with issuing bank...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Confirm & Authorize Payment</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                disabled={isVerifying}
                onClick={onClose}
                className="w-full text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-xl"
              >
                Cancel & Return to Checkout
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

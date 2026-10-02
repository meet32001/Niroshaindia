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
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BankAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (txnRef?: string) => Promise<void> | void;
  amountCents: number;
  paymentMethodLabel: string;
  paymentMethod?: "card" | "upi" | "netbanking";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paymentDetails?: any;
  customerPhone?: string;
  orderReference?: string;
}

export function BankAuthModal({
  isOpen,
  onClose,
  onSuccess,
  amountCents,
  paymentMethodLabel,
  paymentMethod = "card",
  paymentDetails,
  customerPhone,
  orderReference,
}: BankAuthModalProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(paymentMethod === "upi" ? 299 : 45);
  const [referenceId] = useState(
    () =>
      orderReference?.startsWith("NIR-TXN-")
        ? orderReference
        : `NIR-TXN-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`
  );

  // Countdown timer
  useEffect(() => {
    if (!isOpen) {
      setOtp("");
      setError(null);
      setIsVerifying(false);
      setSecondsRemaining(paymentMethod === "upi" ? 299 : 45);
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
  }, [isOpen, paymentMethod]);

  if (!isOpen) return null;

  // Sanitize customer phone: strictly use valid Indian digits, fallback to 9210
  const cleanPhone = customerPhone ? customerPhone.replace(/\D/g, "") : "";
  const phoneLast4 =
    cleanPhone.length >= 10 && /^[6-9]/.test(cleanPhone.slice(-10))
      ? cleanPhone.slice(-4)
      : "9210";

  const formattedAmount = (amountCents / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const isUpi = paymentMethod === "upi";
  const isNetBanking = paymentMethod === "netbanking";
  const selectedBankName = paymentDetails?.bank_name || "Retail Bank";

  const handleAuthorize = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!isUpi) {
      const cleanOtp = otp.trim();
      if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
        setError("Please enter a valid 6-digit numeric OTP.");
        return;
      }
    }

    setError(null);
    setIsVerifying(true);

    // Realistic network authorization duration (1.5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      await onSuccess(referenceId);
    } catch (err: unknown) {
      setIsVerifying(false);
      const msg = err instanceof Error ? err.message : "Payment authorization failed.";
      setError(msg);
    }
  };

  const minutesRemaining = Math.floor(secondsRemaining / 60);
  const displaySeconds = (secondsRemaining % 60).toString().padStart(2, "0");

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
              {isNetBanking ? (
                <Building2 className="w-5 h-5 text-emerald-400" />
              ) : isUpi ? (
                <Smartphone className="w-5 h-5 text-emerald-400" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div>
              <span className="text-[10px] text-indigo-300 font-bold tracking-wider uppercase block">
                {isNetBanking
                  ? "Secure 256-bit Encrypted Banking Session"
                  : isUpi
                  ? "NPCI Unified Payments Interface"
                  : "3D Secure 2.0 • Verified by Visa / Mastercard"}
              </span>
              <h3 className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
                <span>
                  {isNetBanking
                    ? `${selectedBankName} Retail Internet Banking Gateway`
                    : isUpi
                    ? "BHIM UPI Instant Payment Request"
                    : "Verified by Visa / Mastercard Identity Check"}
                </span>
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isVerifying}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
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

          {/* ============================================================
              VIEW A: UPI INSTANT APPROVAL FLOW
          ============================================================ */}
          {isUpi ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/30 text-center space-y-2.5">
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-pulse">
                    <Smartphone className="w-6 h-6" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Approve Payment in your UPI App
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                    A collect request of{" "}
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">
                      ₹{formattedAmount}
                    </span>{" "}
                    has been sent to{" "}
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                      {paymentDetails?.upi_id || "your registered UPI VPA"}
                    </span>
                    . Open Google Pay, PhonePe, Paytm, or BHIM to approve.
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>
                    Approve request within {minutesRemaining}:{displaySeconds}
                  </span>
                </div>
              </div>

              {error && (
                <p className="text-[11px] text-rose-500 font-semibold flex items-center justify-center gap-1 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </p>
              )}

              {/* Action Buttons for UPI */}
              <div className="space-y-2 pt-1">
                <Button
                  id="confirm_upi_approval_button"
                  type="button"
                  onClick={() => handleAuthorize()}
                  disabled={isVerifying}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Verifying with issuing bank...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>I Have Approved in App</span>
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  disabled={isVerifying}
                  onClick={onClose}
                  className="w-full text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel & Return to Checkout
                </Button>
              </div>
            </div>
          ) : (
            /* ============================================================
                VIEW B: 3D-SECURE CARD & NETBANKING OTP FLOW
            ============================================================ */
            <form onSubmit={handleAuthorize} className="space-y-4">
              <div className="space-y-1.5 text-center">
                <label
                  htmlFor="otp_input"
                  className="text-xs font-bold text-slate-900 dark:text-slate-100 block"
                >
                  {isNetBanking ? "Enter NetBanking One-Time Password (OTP)" : "Enter One-Time Password (OTP)"}
                </label>
                <p className="text-[11px] text-slate-500">
                  A one-time password (OTP) has been sent to your registered mobile number ending in{" "}
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    •••• {phoneLast4}
                  </span>
                  .
                </p>
              </div>

              {/* 6-Digit Styled Input */}
              <div className="space-y-2">
                <input
                  id="otp_input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoComplete="one-time-code"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-form-type="other"
                  value={otp}
                  disabled={isVerifying}
                  autoFocus
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ""));
                    setError(null);
                  }}
                  placeholder="• • • • • •"
                  className="w-full text-center text-2xl font-mono font-black tracking-widest h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-shop-orange focus:ring-4 focus:ring-orange-500/10 transition-all disabled:opacity-50"
                />

                {/* Subtle Device Autofill Simulation (Task 6) */}
                {otp.length < 6 && (
                  <div className="flex items-center justify-center pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setOtp("123456");
                        setError(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
                      aria-label="Autofill OTP from messages"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>From Messages: <strong>123456</strong></span>
                    </button>
                  </div>
                )}

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

              {/* Action Buttons */}
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
                      <span>Verifying with issuing bank...</span>
                    </>
                  ) : isNetBanking ? (
                    <>
                      <Building2 className="w-4 h-4 text-emerald-500" />
                      <span>Confirm & Authorize NetBanking Payment</span>
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
                  className="w-full text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel & Return to Checkout
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default BankAuthModal;

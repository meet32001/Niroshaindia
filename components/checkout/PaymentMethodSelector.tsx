"use client";

import { useState, useEffect, useId } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import {
  CreditCard,
  QrCode,
  Building,
  Truck,
  CheckCircle2,
  Shield,
  Lock,
  ArrowRight,
  Info,
  Smartphone,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export type PaymentMethodType = "upi" | "card" | "netbanking" | "cod";

export interface PaymentSubmissionData {
  method: PaymentMethodType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: any;
}

interface PaymentMethodSelectorProps {
  amountCents: number;
  onSubmit: (data: PaymentSubmissionData) => void;
  isSubmitting: boolean;
  orderReference?: string;
  customerPhone?: string;
}

const TOP_BANKS = [
  { id: "HDFC", name: "HDFC Bank", code: "HDFC" },
  { id: "ICICI", name: "ICICI Bank", code: "ICICI" },
  { id: "SBI", name: "State Bank of India", code: "SBIN" },
  { id: "AXIS", name: "Axis Bank", code: "UTIB" },
  { id: "KOTAK", name: "Kotak Mahindra", code: "KKBK" },
  { id: "PNB", name: "Punjab National Bank", code: "PUNB" },
];

const OTHER_BANKS = [
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "IndusInd Bank",
  "Yes Bank",
  "IDBI Bank",
  "Federal Bank",
  "Central Bank of India",
  "Indian Bank",
  "Bank of India",
  "Indian Overseas Bank",
  "UCO Bank",
  "Bank of Maharashtra",
  "Punjab & Sind Bank",
  "IDFC First Bank",
  "RBL Bank",
  "South Indian Bank",
  "Karur Vysya Bank",
  "City Union Bank",
  "Tamilnad Mercantile Bank",
  "Bandhan Bank",
  "Jammu & Kashmir Bank",
  "Karnataka Bank",
  "AU Small Finance Bank",
  "Equitas Small Finance Bank",
  "Ujjivan Small Finance Bank",
  "Suryoday Small Finance Bank",
  "DBS Bank India",
  "Standard Chartered Bank",
  "Citibank India",
  "HSBC India",
  "Deutsche Bank India",
];

export function PaymentMethodSelector({
  amountCents,
  onSubmit,
  isSubmitting,
  orderReference = "NIR-ORD-2026-REF",
  customerPhone,
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>("card");

  // UPI State
  const [upiSubTab, setUpiSubTab] = useState<"qr" | "vpa">("qr");
  const [vpaId, setVpaId] = useState("");
  const [vpaError, setVpaError] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  // Card State
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [saveCardRbi, setSaveCardRbi] = useState(true);
  const [cardError, setCardError] = useState<string | null>(null);

  // NetBanking State
  const [selectedBank, setSelectedBank] = useState<string>("HDFC");
  const [otherBank, setOtherBank] = useState<string>("");

  // COD State
  const [codAgreed, setCodAgreed] = useState(false);
  const [codError, setCodError] = useState<string | null>(null);

  const formattedAmount = (amountCents / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Dynamic UPI QR Code Generation
  useEffect(() => {
    const vpaMerchant = "niroshaindia@hdfcbank";
    const amountInr = (amountCents / 100).toFixed(2);
    const upiUri = `upi://pay?pa=${vpaMerchant}&pn=Nirosha%20India%20Retail&am=${amountInr}&cu=INR&tr=${orderReference}&tn=Order%20Payment`;

    QRCode.toDataURL(upiUri, {
      width: 240,
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error("Error generating UPI QR code:", err));
  }, [amountCents, orderReference]);

  // Card Scheme Detection
  const detectCardScheme = (num: string) => {
    const clean = num.replace(/\s+/g, "");
    if (/^(508[5-9]|60|65|81|82)/.test(clean)) return "RuPay";
    if (/^4/.test(clean)) return "Visa";
    if (/^(5[1-5]|2[2-7])/.test(clean)) return "MasterCard";
    if (/^3[47]/.test(clean)) return "Amex";
    return null;
  };

  const cardScheme = detectCardScheme(cardNumber);

  // Card Number Auto-Formatter (#### #### #### ####)
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(" ") || raw;
    setCardNumber(formatted);
    setCardError(null);
  };

  // Expiry Auto-Formatter (MM/YY)
  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2, 4)}`);
    } else {
      setCardExpiry(raw);
    }
    setCardError(null);
  };

  // Handle Form Submission based on Selected Tab
  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedMethod === "card") {
      const cleanNum = cardNumber.replace(/\s+/g, "");
      if (cleanNum.length < 15) {
        setCardError("Please enter a valid 16-digit card number.");
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        setCardError("Please enter a valid expiry date (MM/YY).");
        return;
      }
      if (cardCvv.length < 3) {
        setCardError("Please enter a valid CVV.");
        return;
      }
      if (!cardHolder.trim()) {
        setCardError("Please enter cardholder name as displayed on card.");
        return;
      }

      onSubmit({
        method: "card",
        details: {
          card_last4: cleanNum.slice(-4),
          card_network: cardScheme || "RuPay / Visa",
          cardholder_name: cardHolder.trim(),
          rbi_tokenized: saveCardRbi,
        },
      });
    } else if (selectedMethod === "upi") {
      if (upiSubTab === "vpa") {
        const cleanVpa = vpaId.trim().toLowerCase();
        if (!/^[\w.-]+@[\w.-]+$/.test(cleanVpa)) {
          setVpaError("Please enter a valid UPI ID (e.g. mobile@paytm or name@okhdfcbank).");
          return;
        }
        onSubmit({
          method: "upi",
          details: {
            upi_id: cleanVpa,
            mode: "vpa_collect",
          },
        });
      } else {
        onSubmit({
          method: "upi",
          details: {
            mode: "bhim_qr_scanned",
            order_ref: orderReference,
          },
        });
      }
    } else if (selectedMethod === "netbanking") {
      const bank = otherBank || selectedBank;
      if (!bank) {
        return;
      }
      onSubmit({
        method: "netbanking",
        details: {
          bank_name: bank,
        },
      });
    } else if (selectedMethod === "cod") {
      if (!codAgreed) {
        setCodError("You must acknowledge the unboxing video requirement to proceed with COD.");
        return;
      }
      onSubmit({
        method: "cod",
        details: {
          cod_verified: true,
          unboxing_policy_agreed: true,
        },
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Select Payment Method</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            100% Secure Domestic Indian Payment Rails • RBI Encrypted
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
            RBI Verified
          </Badge>
          <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
            256-Bit SSL
          </Badge>
        </div>
      </div>

      {/* Payment Rail Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={() => setSelectedMethod("card")}
          className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
            selectedMethod === "card"
              ? "border-shop-orange bg-orange-50/30 dark:bg-orange-950/30 shadow-xs"
              : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between pb-2">
            <CreditCard
              className={`w-5 h-5 ${
                selectedMethod === "card" ? "text-shop-orange" : "text-slate-400"
              }`}
            />
            {selectedMethod === "card" && (
              <CheckCircle2 className="w-4 h-4 text-shop-orange" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Cards
            </div>
            <div className="text-[10px] text-slate-500 font-medium truncate">
              Credit / Debit / RuPay
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedMethod("upi")}
          className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
            selectedMethod === "upi"
              ? "border-shop-orange bg-orange-50/30 dark:bg-orange-950/30 shadow-xs"
              : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between pb-2">
            <QrCode
              className={`w-5 h-5 ${
                selectedMethod === "upi" ? "text-shop-orange" : "text-slate-400"
              }`}
            />
            {selectedMethod === "upi" && (
              <CheckCircle2 className="w-4 h-4 text-shop-orange" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
              UPI Instant
            </div>
            <div className="text-[10px] text-slate-500 font-medium truncate">
              QR & VPA Collect
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedMethod("netbanking")}
          className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
            selectedMethod === "netbanking"
              ? "border-shop-orange bg-orange-50/30 dark:bg-orange-950/30 shadow-xs"
              : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between pb-2">
            <Building
              className={`w-5 h-5 ${
                selectedMethod === "netbanking" ? "text-shop-orange" : "text-slate-400"
              }`}
            />
            {selectedMethod === "netbanking" && (
              <CheckCircle2 className="w-4 h-4 text-shop-orange" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
              NetBanking
            </div>
            <div className="text-[10px] text-slate-500 font-medium truncate">
              Top Indian Banks
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedMethod("cod")}
          className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
            selectedMethod === "cod"
              ? "border-shop-orange bg-orange-50/30 dark:bg-orange-950/30 shadow-xs"
              : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between pb-2">
            <Truck
              className={`w-5 h-5 ${
                selectedMethod === "cod" ? "text-shop-orange" : "text-slate-400"
              }`}
            />
            {selectedMethod === "cod" && (
              <CheckCircle2 className="w-4 h-4 text-shop-orange" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Cash on Delivery
            </div>
            <div className="text-[10px] text-slate-500 font-medium truncate">
              Pay on Inspection
            </div>
          </div>
        </button>
      </div>

      {/* Active Tab Configuration Panels */}
      <form onSubmit={handleProceed} className="space-y-6 pt-2">
        {/* ============================================================
            TAB 1: CREDIT / DEBIT CARD
        ============================================================ */}
        {selectedMethod === "card" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Domestic & Global Credit or Debit Cards
              </span>
              <div className="flex items-center gap-1.5">
                {cardScheme ? (
                  <Badge className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-bold">
                    {cardScheme}
                  </Badge>
                ) : (
                  <div className="flex items-center gap-1 opacity-70">
                    <span className="text-[10px] font-bold text-slate-400">RuPay</span>
                    <span className="text-[10px] font-bold text-slate-400">•</span>
                    <span className="text-[10px] font-bold text-slate-400">Visa</span>
                    <span className="text-[10px] font-bold text-slate-400">•</span>
                    <span className="text-[10px] font-bold text-slate-400">MasterCard</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card Number */}
            <div className="space-y-1">
              <Label htmlFor="card_number" className="text-xs font-semibold">
                Card Number *
              </Label>
              <div className="relative">
                <Input
                  id="card_number"
                  type="text"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  placeholder="4532 8923 7482 9102"
                  maxLength={19}
                  required
                  className="rounded-xl font-mono text-sm pl-10"
                />
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Expiry & CVV */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="card_expiry" className="text-xs font-semibold">
                  Valid Thru (MM/YY) *
                </Label>
                <Input
                  id="card_expiry"
                  type="text"
                  inputMode="numeric"
                  value={cardExpiry}
                  onChange={(e) => handleExpiryChange(e.target.value)}
                  placeholder="12/28"
                  maxLength={5}
                  required
                  className="rounded-xl font-mono text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="card_cvv" className="text-xs font-semibold">
                  CVV / Security Code *
                </Label>
                <Input
                  id="card_cvv"
                  type="password"
                  inputMode="numeric"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="•••"
                  maxLength={4}
                  required
                  className="rounded-xl font-mono text-sm"
                />
              </div>
            </div>

            {/* Cardholder Name */}
            <div className="space-y-1">
              <Label htmlFor="card_holder" className="text-xs font-semibold">
                Cardholder Name (as on card) *
              </Label>
              <Input
                id="card_holder"
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                placeholder="RAHUL SHARMA"
                required
                className="rounded-xl uppercase text-sm font-medium"
              />
            </div>

            {/* RBI Tokenization Checkbox */}
            <div className="flex items-start space-x-2.5 pt-2">
              <Checkbox
                id="save_card_rbi"
                checked={saveCardRbi}
                onCheckedChange={(c) => setSaveCardRbi(!!c)}
                className="mt-0.5"
              />
              <Label
                htmlFor="save_card_rbi"
                className="text-xs text-slate-600 dark:text-slate-300 leading-snug font-normal cursor-pointer"
              >
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Save card securely in compliance with RBI Tokenization guidelines
                </span>
                <span className="block text-[11px] text-slate-500 pt-0.5">
                  Card details are encrypted using 256-bit SSL and tokenized without storing raw CVV.
                </span>
              </Label>
            </div>

            {cardError && (
              <p className="text-xs text-rose-500 font-semibold">{cardError}</p>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 2: UPI (INSTANT PAYMENT)
        ============================================================ */}
        {selectedMethod === "upi" && (
          <div className="space-y-4">
            {/* Sub-Tabs: Scan QR vs Enter VPA */}
            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              <button
                type="button"
                onClick={() => setUpiSubTab("qr")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  upiSubTab === "qr"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Dynamic BHIM UPI QR</span>
              </button>

              <button
                type="button"
                onClick={() => setUpiSubTab("vpa")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  upiSubTab === "vpa"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>UPI ID / VPA</span>
              </button>
            </div>

            {/* Sub-mode A: BHIM UPI QR Code */}
            {upiSubTab === "qr" && (
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                  {qrCodeDataUrl ? (
                    <Image
                      src={qrCodeDataUrl}
                      alt="BHIM UPI QR Code"
                      width={180}
                      height={180}
                      className="rounded-lg"
                    />
                  ) : (
                    <div className="w-44 h-44 bg-slate-100 animate-pulse rounded-lg" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Scan with any UPI App
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    Google Pay, PhonePe, Paytm, BHIM, or any banking app to authorize ₹{formattedAmount}
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">
                  <Shield className="w-3 h-3" />
                  <span>Merchant: Nirosha India Retail (niroshaindia@hdfcbank)</span>
                </div>
              </div>
            )}

            {/* Sub-mode B: VPA Input */}
            {upiSubTab === "vpa" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="vpa_id" className="text-xs font-semibold">
                    Enter Virtual Payment Address (VPA) *
                  </Label>
                  <Input
                    id="vpa_id"
                    type="text"
                    value={vpaId}
                    onChange={(e) => {
                      setVpaId(e.target.value.toLowerCase());
                      setVpaError(null);
                    }}
                    placeholder="e.g. mobile@paytm or yourname@okhdfcbank"
                    className="rounded-xl text-sm"
                  />
                  {vpaError && (
                    <p className="text-xs text-rose-500 font-semibold">{vpaError}</p>
                  )}
                </div>

                {/* Popular Indian UPI Handles Quick-select */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Quick-select UPI provider handle:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["@okhdfcbank", "@okaxis", "@oksbi", "@ybl", "@paytm", "@cred"].map(
                      (handle) => (
                        <button
                          key={handle}
                          type="button"
                          onClick={() => {
                            const prefix = vpaId.split("@")[0] || "";
                            setVpaId(prefix ? `${prefix}${handle}` : `user${handle}`);
                            setVpaError(null);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 hover:text-shop-orange hover:border-shop-orange border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          {handle}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 3: NETBANKING
        ============================================================ */}
        {selectedMethod === "netbanking" && (
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Popular Retail Banks
            </span>

            {/* Top 6 Banks Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {TOP_BANKS.map((b) => {
                const isSelected = selectedBank === b.id && !otherBank;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setSelectedBank(b.id);
                      setOtherBank("");
                    }}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "border-shop-orange bg-orange-50/20 dark:bg-orange-950/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {b.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {b.code}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-shop-orange shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Other Banks Dropdown */}
            <div className="space-y-1 pt-2">
              <Label htmlFor="other_banks" className="text-xs font-semibold">
                Or select from 40+ other Indian retail banks:
              </Label>
              <select
                id="other_banks"
                value={otherBank}
                onChange={(e) => {
                  setOtherBank(e.target.value);
                  if (e.target.value) {
                    setSelectedBank("");
                  }
                }}
                className="w-full h-10 px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-shop-orange"
              >
                <option value="">-- Choose another bank --</option>
                {OTHER_BANKS.map((bankName) => (
                  <option key={bankName} value={bankName}>
                    {bankName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 4: CASH ON DELIVERY
        ============================================================ */}
        {selectedMethod === "cod" && (
          <div className="space-y-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-shop-orange flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-slate-100">
                  Cash or UPI on Inspection
                </h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Pay cash or UPI to courier executive upon inspecting the outer parcel seal.
                </p>
              </div>
            </div>

            {/* Mandatory Unboxing Video Acknowledgement */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-start space-x-2.5">
                <Checkbox
                  id="cod_unboxing_agreed"
                  checked={codAgreed}
                  onCheckedChange={(c) => {
                    setCodAgreed(!!c);
                    setCodError(null);
                  }}
                  className="mt-0.5"
                />
                <Label
                  htmlFor="cod_unboxing_agreed"
                  className="text-xs text-slate-700 dark:text-slate-300 font-normal leading-relaxed cursor-pointer"
                >
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    I acknowledge the Unboxing Video Requirement:
                  </span>{" "}
                  I agree to record a continuous unboxing video before breaking the outer brand seal, as required under{" "}
                  <a
                    href="/terms#replacement-policy"
                    target="_blank"
                    className="text-shop-orange font-bold hover:underline"
                  >
                    Nirosha India Replacement Policy
                  </a>{" "}
                  for any physical transit claims.
                </Label>
              </div>

              {codError && (
                <p className="text-xs text-rose-500 font-semibold">{codError}</p>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <Button
            id="submit_payment_button"
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-shop-orange hover:bg-amber-600 text-white font-bold py-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
          >
            <span>
              {selectedMethod === "cod"
                ? `Confirm Order (₹${formattedAmount})`
                : `Pay ₹${formattedAmount}`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-[11px] text-center text-slate-400 font-medium pt-3 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>Guaranteed 256-Bit SSL Bank Grade Security • Zero Tampering Shield</span>
          </p>
        </div>
      </form>
    </div>
  );
}

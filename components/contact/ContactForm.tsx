"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Send,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Home,
  AlertCircle,
  HelpCircle,
  Package,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitContactInquiryAction } from "@/actions/contact";
import { getCustomerOrdersForSelectAction } from "@/actions/orders";
import {
  INQUIRY_TYPE_LABELS,
  type InquiryType,
  type CustomerOrderOption,
} from "@/types/contact";

export function ContactForm() {
  const { user, isLoaded } = useUser();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    inquiry_type: "general_inquiry" as InquiryType,
    order_number: "",
    message: "",
    honeypot: "",
  });

  const [customerOrders, setCustomerOrders] = useState<CustomerOrderOption[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isManualOrderEntry, setIsManualOrderEntry] = useState(false);
  const [hasFetchedOrders, setHasFetchedOrders] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successResult, setSuccessResult] = useState<{
    ticketId: string;
    message: string;
    submittedType: InquiryType;
    orderNumber?: string;
  } | null>(null);

  const isOrderRequired =
    formData.inquiry_type === "order_tracking" ||
    formData.inquiry_type === "returns_replacements";

  // Pre-fill Clerk user name & email when available
  useEffect(() => {
    if (isLoaded && user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: prev.email || user.primaryEmailAddress?.emailAddress || "",
      }));
    }
  }, [isLoaded, user]);

  // Load authenticated customer orders when order-related inquiry type is active
  useEffect(() => {
    if (isOrderRequired && isLoaded && user && !hasFetchedOrders && !isLoadingOrders) {
      setIsLoadingOrders(true);
      const email = user.primaryEmailAddress?.emailAddress;
      getCustomerOrdersForSelectAction(email)
        .then((res) => {
          setHasFetchedOrders(true);
          if (res.success && res.orders) {
            setCustomerOrders(res.orders);
          }
        })
        .catch((err) => {
          console.error("Failed to load customer orders:", err);
          setHasFetchedOrders(true);
        })
        .finally(() => {
          setIsLoadingOrders(false);
        });
    }
  }, [isOrderRequired, isLoaded, user, hasFetchedOrders, isLoadingOrders]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>

  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleCopyTicket = (ticketId: string) => {
    navigator.clipboard.writeText(ticketId);
    setCopied(true);
    toast.success("Ticket ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await submitContactInquiryAction({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        inquiry_type: formData.inquiry_type,
        order_number: formData.order_number || undefined,
        message: formData.message,
        honeypot: formData.honeypot || undefined,
      });

      if (res.success && res.ticketId) {
        setSuccessResult({
          ticketId: res.ticketId,
          message: res.message,
          submittedType: formData.inquiry_type,
          orderNumber: formData.order_number,
        });
        toast.success(`Inquiry submitted! Ticket #${res.ticketId}`);
      } else {
        if (res.errors) {
          setErrors(res.errors);
        }
        toast.error(res.message || "Failed to submit inquiry. Please review the errors.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Failed to connect to the server. Please check your network.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessResult(null);
    setFormData({
      name: user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "",
      email: user?.primaryEmailAddress?.emailAddress || "",
      phone: "",
      inquiry_type: "general_inquiry",
      order_number: "",
      message: "",
      honeypot: "",
    });
    setErrors({});
    setIsManualOrderEntry(false);
  };


  if (successResult) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-10 text-center animate-in fade-in-50 duration-300">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800">
          Inquiry Logged Successfully
        </span>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-4 tracking-tight">
          We’re On It!
        </h3>

        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2 max-w-md mx-auto leading-relaxed">
          Our support team is reviewing your inquiry. You will receive a response at your email address within 24 to 48 business hours.
        </p>

        {/* Ticket Reference Box */}
        <div className="mt-6 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 max-w-md mx-auto text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Assigned Ticket Reference
            </span>
            <button
              onClick={() => handleCopyTicket(successResult.ticketId)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy ID"}
            </button>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-wider mt-1">
            #{successResult.ticketId}
          </p>

          <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <p>
              <strong>Category:</strong> {INQUIRY_TYPE_LABELS[successResult.submittedType]}
            </p>
            {successResult.orderNumber && (
              <p>
                <strong>Order Reference:</strong> {successResult.orderNumber}
              </p>
            )}
            <p>
              <strong>Expected Response:</strong> 24 to 48 business hours (Mon – Sat, 09:00 AM – 08:00 PM IST)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full sm:w-auto text-xs sm:text-sm font-semibold rounded-lg px-6 py-2.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Submit Another Query
          </Button>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-lg px-6 py-2.5 shadow-sm cursor-pointer transition-colors"
          >
            <Home className="w-4 h-4 mr-2" /> Back to Storefront
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-8 md:p-10">
      <div className="mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Send Us a Message
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Fill out the details below. Our email support desk will review and assign your ticket immediately.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Honeypot field (hidden from genuine users) */}
        <div className="hidden" aria-hidden="true">
          <input
            type="text"
            name="honeypot"
            value={formData.honeypot}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* 2-Column: Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              name="name"
              required
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={handleChange}
              className={`h-10 text-sm rounded-lg ${errors.name ? "border-rose-500 focus-visible:ring-rose-500" : ""}`}
            />
            {errors.name && (
              <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <Input
              type="email"
              name="email"
              required
              placeholder="e.g. rahul@example.com"
              value={formData.email}
              onChange={handleChange}
              className={`h-10 text-sm rounded-lg ${errors.email ? "border-rose-500 focus-visible:ring-rose-500" : ""}`}
            />
            {errors.email && (
              <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.email}
              </p>
            )}
          </div>
        </div>

        {/* 2-Column: Phone & Inquiry Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Phone Number <span className="text-slate-400 font-normal lowercase">(optional — for delivery SMS updates only)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                +91
              </span>
              <Input
                type="tel"
                name="phone"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                maxLength={10}
                className={`h-10 text-sm pl-11 rounded-lg ${errors.phone ? "border-rose-500 focus-visible:ring-rose-500" : ""}`}
              />
            </div>
            {errors.phone && (
              <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Inquiry Type <span className="text-rose-500">*</span>
            </label>
            <select
              name="inquiry_type"
              value={formData.inquiry_type}
              onChange={handleChange}
              className="h-10 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors cursor-pointer"
            >
              {Object.entries(INQUIRY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Conditional Order Number Field */}
        {isOrderRequired && (
          <div className="animate-in fade-in-50 duration-200 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60 p-3.5 sm:p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> Order Reference <span className="text-rose-500">*</span>
              </label>
              {user && customerOrders.length > 0 && !isManualOrderEntry && (
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  {customerOrders.length} order{customerOrders.length > 1 ? "s" : ""} on file
                </span>
              )}
            </div>

            {isLoadingOrders ? (
              <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800/80">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
                <span>Loading your verified orders...</span>
              </div>
            ) : user && customerOrders.length > 0 && !isManualOrderEntry ? (
              /* Scenario A: Logged-in customer with authentic orders in database */
              <div className="space-y-1.5">
                <select
                  name="order_number"
                  required={isOrderRequired}
                  value={formData.order_number}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors cursor-pointer ${
                    errors.order_number
                      ? "border-rose-500 focus-visible:ring-rose-500"
                      : "border-slate-300 dark:border-slate-700"
                  }`}
                >
                  <option value="">-- Select an Order --</option>
                  {customerOrders.map((ord) => (
                    <option key={ord.order_number} value={ord.order_number}>
                      {ord.order_number} • ₹{(ord.total_amount_cents / 100).toLocaleString("en-IN")} ({ord.status.toUpperCase()} - {new Date(ord.created_at).toLocaleDateString("en-IN")})
                    </option>
                  ))}
                </select>

                <div className="flex items-center justify-between pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualOrderEntry(true);
                      setFormData((prev) => ({ ...prev, order_number: "" }));
                    }}
                    className="text-xs text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 underline cursor-pointer"
                  >
                    Don&apos;t see your order? Enter manually
                  </button>
                </div>
              </div>
            ) : user && hasFetchedOrders && customerOrders.length === 0 && !isManualOrderEntry ? (
              /* Scenario B: Logged-in customer with 0 past orders */
              <div className="space-y-2">
                <div className="text-xs text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  No previous orders found under this account.
                </div>
                <Input
                  type="text"
                  name="order_number"
                  required={isOrderRequired}
                  placeholder="Enter order number placed under another email"
                  value={formData.order_number}
                  onChange={handleChange}
                  className={`h-10 text-sm bg-white dark:bg-slate-900 rounded-lg ${
                    errors.order_number ? "border-rose-500 focus-visible:ring-rose-500" : ""
                  }`}
                />
              </div>
            ) : user && isManualOrderEntry ? (
              /* Scenario A Fallback: User toggled to manual input */
              <div className="space-y-1.5">
                <Input
                  type="text"
                  name="order_number"
                  required={isOrderRequired}
                  placeholder="e.g. NIR-ORD-2026-84920"
                  value={formData.order_number}
                  onChange={handleChange}
                  className={`h-10 text-sm bg-white dark:bg-slate-900 rounded-lg ${
                    errors.order_number ? "border-rose-500 focus-visible:ring-rose-500" : ""
                  }`}
                />
                {customerOrders.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualOrderEntry(false);
                      setFormData((prev) => ({
                        ...prev,
                        order_number: customerOrders[0]?.order_number || "",
                      }));
                    }}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    ← Choose from your account orders
                  </button>
                )}
              </div>
            ) : (
              /* Scenario C: Guest / Logged-out visitor */
              <div className="space-y-1.5">
                <Input
                  type="text"
                  name="order_number"
                  required={isOrderRequired}
                  placeholder="e.g. #NIR-ORD-2026-84920"
                  value={formData.order_number}
                  onChange={handleChange}
                  className={`h-10 text-sm bg-white dark:bg-slate-900 rounded-lg ${
                    errors.order_number ? "border-rose-500 focus-visible:ring-rose-500" : ""
                  }`}
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Enter your 16-digit Order ID (e.g. #NIR-ORD-...) or{" "}
                  <Link
                    href="/sign-in?redirect_url=/contact"
                    className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                  >
                    sign in
                  </Link>{" "}
                  to choose from your orders automatically.
                </p>
              </div>
            )}

            {errors.order_number && (
              <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.order_number}
              </p>
            )}
          </div>
        )}

        {/* Detailed Message Textarea with Character Counter */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Message Details <span className="text-rose-500">*</span>
            </label>
            <span
              className={`text-[11px] font-medium ${
                formData.message.length > 1900 ? "text-amber-600" : "text-slate-400"
              }`}
            >
              {formData.message.length} / 2000
            </span>
          </div>
          <Textarea
            name="message"
            required
            rows={5}
            maxLength={2000}
            placeholder="Please describe your question, issue, or order inquiry in detail so our team can assist you faster..."
            value={formData.message}
            onChange={handleChange}
            className={`resize-none text-sm rounded-lg ${errors.message ? "border-rose-500 focus-visible:ring-rose-500" : ""}`}
          />
          {errors.message && (
            <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 cursor-pointer flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting Support Ticket...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Support Ticket</span>
            </>
          )}
        </Button>

        <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
          <HelpCircle className="w-3 h-3" /> All submissions generate a tracked ticket number with instant email acknowledgment.
        </p>
      </form>
    </div>
  );
}

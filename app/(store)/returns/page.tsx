import { Container } from "@/components/layout/Container";
import Link from "next/link";
import { RotateCcw, CheckCircle2, AlertTriangle, HelpCircle, PackageCheck } from "lucide-react";

export const metadata = {
  title: "Returns & Refunds Policy | Nirosha India",
  description: "Learn about the 7-day replacement guarantee, return conditions, and refund procedures at Nirosha India.",
};

export default function ReturnsPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-12 sm:py-16">
      <Container className="max-w-4xl">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-6">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">Returns & Refunds</span>
        </nav>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 sm:p-12 shadow-sm space-y-8">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 mb-3">
              <RotateCcw className="w-3.5 h-3.5" /> Easy 7-Day Window
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Returns & Replacement Policy
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Last updated: September 2026 • Hassle-free resolution for eligible purchases
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-slate-600 dark:text-slate-300 space-y-6">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                1. 7-Day Replacement Guarantee
              </h2>
              <p>
                We offer a 7-day replacement guarantee on all eligible consumer electronics, home appliances, and gadgets. If your product is delivered in a damaged condition, exhibits dead-on-arrival (DOA) hardware failure, or does not match your ordered specifications, you may request an immediate replacement within 7 calendar days of physical delivery.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                2. Eligibility Conditions for Return & Exchange
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
                <li>The item must be in its original packaging including all manufacturer boxes, warranty cards, manuals, cables, and bundled promotional accessories.</li>
                <li>The original serial number and IMEI barcode stickers must remain un-tampered and intact.</li>
                <li>For large appliances (Televisions, Refrigerators, Washing Machines), please refrain from unboxing until the authorized brand installation engineer arrives. An open-box delivery report will be signed at delivery time.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                3. Non-Returnable Scenarios
              </h2>
              <p>
                Returns cannot be processed for cosmetic damage caused by improper consumer handling, unauthorized third-party repairs or modifications, or missing accessories originally included in the retail packaging.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                4. Refund Processing Timeline
              </h2>
              <p>
                In scenarios where an identical replacement unit is unavailable in our warehouse inventory, a 100% full refund will be processed directly to your original payment method (Credit Card, Debit Card, Net Banking, UPI) within 3 to 5 business days following physical warehouse inspection.
              </p>
              <p>
                Initiate a request directly through your <Link href="/orders" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Order History</Link> or reach our claims team via <Link href="/contact" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Contact Support</Link>.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}

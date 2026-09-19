import { Container } from "@/components/layout/Container";
import Link from "next/link";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Nirosha India",
  description: "Terms and conditions governing orders, replacements, warranties, and shipping at Nirosha India.",
};

export default function TermsOfServicePage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-12 sm:py-16">
      <Container className="max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-6">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">Terms of Service</span>
        </nav>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 sm:p-12 shadow-sm space-y-8">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 mb-3">
              <FileText className="w-3.5 h-3.5" /> Legal Agreement
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Last updated: September 2026 • Nirosha India Retail Ltd.
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-slate-600 dark:text-slate-300 space-y-6">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">1. Acceptance of Terms</h2>
              <p>
                By placing an order or using Nirosha India (nirosha.in), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please discontinue use of our platform.
              </p>
            </section>

            <section id="returns" className="space-y-2 scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">2. Return & Replacement Policy</h2>
              <p>
                Nirosha India offers a 7-day replacement guarantee on eligible electronics for dead-on-arrival (DOA) units, transit damage, or manufacturing defects verified by authorized brand technicians. All returned items must include original packaging, serial numbers, manuals, and bundled accessories.
              </p>
            </section>

            <section id="shipping" className="space-y-2 scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">3. Shipping & Pan-India Delivery</h2>
              <p>
                We provide free express delivery across India on orders above ₹999. In-stock products are dispatched within 24 to 48 hours from our central warehouse facilities. Delivery timelines typically range from 2 to 5 business days depending on delivery pincode.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">4. Genuine Brand Warranty</h2>
              <p>
                Every product listed on Nirosha India carries a 100% manufacturer warranty serviced across official brand service centers nationwide. Invoices issued by Nirosha India include valid GST details recognized for OEM claims.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">5. Governing Law & Dispute Resolution</h2>
              <p>
                These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or related to our services shall be subject to the exclusive jurisdiction of the courts in Gujarat, India.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}

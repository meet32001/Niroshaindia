import { Container } from "@/components/layout/Container";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Nirosha India",
  description: "Learn how Nirosha India collects, protects, and handles your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-12 sm:py-16">
      <Container className="max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-6">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">Privacy Policy</span>
        </nav>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 sm:p-12 shadow-sm space-y-8">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Security & Trust
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Last updated: September 2026 • Nirosha India Retail Ltd.
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-slate-600 dark:text-slate-300 space-y-6">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">1. Information We Collect</h2>
              <p>
                When you visit Nirosha India, place an order, or register an account, we collect personal information such as your name, shipping address, billing address, phone number, and email address. We also collect transactional logs necessary to fulfill warranties and dispatch hardware shipments.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">2. Payment Security & Encryption</h2>
              <p>
                All payment transactions—including UPI, credit/debit cards, NetBanking, and No-Cost EMI—are processed through RBI-compliant, 256-bit SSL encrypted payment gateways. Nirosha India does not store your raw card numbers or CVVs on our servers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">3. Use of Information</h2>
              <p>
                Your information is used strictly to process orders, verify deliveries across 19,000+ Indian pincodes, manage warranty claims with authorized brand centers, and send essential notifications regarding your purchase status.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">4. Third-Party Sharing</h2>
              <p>
                We share data only with verified courier partners (e.g. Delhivery, BlueDart, Bluedart Express) for order delivery and direct OEM service networks for warranty resolution. We never sell, rent, or trade your personal data to third-party marketers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">5. Contact Our Privacy Officer</h2>
              <p>
                For questions or requests regarding your data, please contact our Data Grievance Officer at{" "}
                <a href="mailto:privacy@nirosha.in" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                  privacy@nirosha.in
                </a>{" "}
                or toll-free at 1800-209-4040.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}

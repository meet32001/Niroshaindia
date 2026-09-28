import { Container } from "@/components/layout/Container";
import Link from "next/link";
import { ShieldCheck, Lock, Building2, Clock, CheckCircle2, FileText, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Privacy Policy & Data Protection | Nirosha India",
  description:
    "Compliant under the Information Technology Act, 2000, SPDI Rules 2011, and Digital Personal Data Protection (DPDP) Act 2023. Learn how Nirosha India secures customer data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-10 sm:py-16">
      <Container className="max-w-4xl space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">Privacy Policy</span>
        </nav>

        {/* Header Block */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DPDP Act 2023 &amp; IT Act Compliant</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">• Last Updated: September 2026</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Privacy Policy &amp; Data Protection Charter
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            Nirosha India Retail Ltd. is committed to transparent, principled data processing in strict adherence with the <strong>Information Technology Act, 2000</strong>, the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 (SPDI Rules)</strong>, and the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>.
          </p>
        </div>

        {/* Policy Body */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs space-y-10 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          
          {/* Section 1: Categories of Data Ingested */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>1. Categories of Personal Data Collected</span>
            </h2>
            <p>
              When you browse, register, or execute an order on Nirosha India, we collect only data strictly necessary to fulfill transactions and comply with Indian statutory requirements:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <li><strong>Contact &amp; Identity Data:</strong> Full name, telephone/mobile number, and authenticated Clerk email address.</li>
              <li><strong>Delivery Coordinates:</strong> Complete physical shipping address, city, state, and 6-digit Indian PIN code for pan-India logistics routing.</li>
              <li><strong>Technical Telemetry:</strong> Anonymized IP addresses, browser user-agent strings, session cookies, and hardware operating system identifiers collected to prevent fraudulent checkout attempts.</li>
              <li><strong>GST Compliance Records:</strong> Business entity name and registered GSTIN (Goods and Services Tax Identification Number) where B2C/B2B tax invoices are requested.</li>
            </ul>
          </section>

          {/* Section 2: Zero-Storage Payment Standard */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>2. Zero-Storage Payment Standard &amp; PCI-DSS Compliance</span>
            </h2>
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-2">
              <h4 className="font-bold text-xs text-blue-900 dark:text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Zero Cardholder Data Storage Guarantee</span>
              </h4>
              <p className="text-xs text-blue-900/90 dark:text-blue-200/90 leading-relaxed">
                Nirosha India <strong>never stores, caches, or logs credit card numbers, debit card numbers, CVV codes, UPI PINs, or net banking passwords</strong> on our web servers or databases. All payment transactions are executed through RBI-regulated, PCI-DSS Level 1 certified payment aggregators (Stripe / Razorpay) using end-to-end 256-bit TLS encryption and tokenization.
              </p>
            </div>
          </section>

          {/* Section 3: Data Sharing Scope */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>3. Data Sharing Scope &amp; Third-Party Disclosures</span>
            </h2>
            <p>
              Nirosha India maintains a strict <strong>Zero Third-Party Marketing Sale Policy</strong>. Your personal data is never rented, monetized, or shared with advertisers. Disclosures occur solely in the following bounded contexts:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <li><strong>Logistics Couriers:</strong> Delivery names, addresses, and telephone numbers are shared with authorized courier networks (e.g. Blue Dart, Delhivery) strictly to complete physical dispatch.</li>
              <li><strong>Brand Warranty Networks:</strong> Tax invoices and serial numbers are shared with certified OEM brand service networks (Samsung, Apple, Sony) solely when you request warranty verification or DOA service.</li>
              <li><strong>Transactional Gateways:</strong> Order references and tracking updates are transmitted through transactional notification channels (SMS gateways, Resend).</li>
              <li><strong>Law Enforcement &amp; Statutory Demands:</strong> Data may be disclosed only upon receiving formal statutory orders or subpoenas issued under Indian law.</li>
            </ul>
          </section>

          {/* Section 4: Data Subject Rights under DPDP Act 2023 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>4. Your Rights Under the DPDP Act, 2023</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              As a data principal under Indian data protection law, you possess the right to:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <strong>Right to Access:</strong> Request a summary of personal data held about your account and active orders.
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <strong>Right to Correction:</strong> Update inaccurate or outdated shipping addresses or contact details.
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <strong>Right to Erasure:</strong> Request deletion of your customer profile subject to mandatory Indian tax retention laws.
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <strong>Right to Grievance Redressal:</strong> Direct escalation to our designated Data Protection Officer.
              </div>
            </div>
          </section>

          {/* Section 5: Statutory Grievance Redressal Officer */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>5. Statutory Data Protection &amp; Grievance Officer</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              In compliance with Section 5(9) of the DPDP Act, 2023 and Rule 5(9) of the Information Technology SPDI Rules, 2011:
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Designated Grievance Officer
                  </span>
                  <strong className="text-slate-900 dark:text-slate-100 text-sm block mt-0.5">
                    Data Protection &amp; Grievance Officer
                  </strong>
                  <span className="text-slate-500">Nirosha India Retail Ltd.</span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Physical Office Address
                  </span>
                  <address className="not-italic text-slate-600 dark:text-slate-300 text-xs mt-0.5">
                    Level 8, Platina Tower, C-59, G Block, Bandra Kurla Complex (BKC), Bandra East, Mumbai, Maharashtra 400051, India.
                  </address>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Statutory Resolution Commitment:</strong> Mandatory acknowledgment within 48 business hours; final ticket resolution within 30 calendar days.
                </span>
              </div>
            </div>
          </section>

          {/* Quick Support Link */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Review our Master Terms of Service
              </h4>
              <p className="text-xs text-slate-500">
                Explore our catalog pricing transparency, 7-day replacement protocol, and brand warranty coverage.
              </p>
            </div>
            <Link
              href="/terms"
              className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shrink-0 flex items-center gap-1.5"
            >
              <span>View Terms of Service</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

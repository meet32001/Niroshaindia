import { Container } from "@/components/layout/Container";
import Link from "next/link";
import { Headphones, Mail, Clock, MessageSquare, ShieldCheck, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Support Center | Nirosha India",
  description: "Contact Nirosha India customer service, support operating hours, and helpful resources.",
};

export default function SupportPage() {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@niroshaindia.com";

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-12 sm:py-16">
      <Container className="max-w-4xl">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-6">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">Support Center</span>
        </nav>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 sm:p-12 shadow-sm space-y-8">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 mb-3">
              <Headphones className="w-3.5 h-3.5" /> Customer First Support
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Customer Support Center
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              We&apos;re here to assist you with order status, technical advice, warranty claims, and account inquiries.
            </p>
          </div>

          {/* Quick Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Email Assistance</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Send queries regarding orders, cancellations, or returns. Expected response within 24 to 48 business hours.
              </p>
              <a
                href={`mailto:${supportEmail}`}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                {supportEmail} <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Interactive Helpdesk</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Submit an inquiry or report an issue directly through our structured support triage desk.
              </p>
              <Link
                href="/contact"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                Open Support Ticket <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-slate-600 dark:text-slate-300 space-y-6">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Support Operating Hours
              </h2>
              <p>
                Our customer assistance team operates Monday through Saturday, from <strong>9:00 AM to 8:00 PM IST</strong>. For inquiries submitted outside of standard business hours, priority ticketing will address your concerns on the next business morning.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Self-Service Portals
              </h2>
              <p>
                For immediate resolution, explore our dedicated self-service tools:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
                <li><Link href="/orders" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Track Active Orders</Link> — View dispatch tracking numbers and delivery dates.</li>
                <li><Link href="/terms#brand-warranty" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Warranty Policy</Link> — Guidelines on brand service center repairs.</li>
                <li><Link href="/terms#replacement-policy" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Returns &amp; Replacements</Link> — Replacement protocols for transit damage &amp; DOA items.</li>
                <li><Link href="/shipping" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Shipping Information</Link> — Details on delivery timeframes and PIN coverage.</li>
                <li><Link href="/contact" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Interactive Contact Form</Link> — Direct online contact form for custom inquiries.</li>
              </ul>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}

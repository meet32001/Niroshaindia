import { Metadata } from "next";
import Link from "next/link";
import {
  MessageSquare,
  Package,
  RotateCcw,
  ShieldCheck,
  Truck,
  Mail,
  ArrowRight,
  Clock,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SupportStatusBadge } from "@/components/contact/SupportStatusBadge";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact & Customer Support | Nirosha India",
  description:
    "Get in touch with Nirosha India's customer support desk. Track orders, request warranty assistance, or submit general product questions via our official email helpdesk.",
};

const TRIAGE_CARDS = [
  {
    title: "Track Your Order",
    description: "Check live dispatch status, courier tracking IDs, and download GST tax invoices.",
    href: "/orders",
    icon: Package,
    badge: "Self-Service",
    cta: "Track Delivery",
    color: "from-blue-500/10 to-indigo-500/5 dark:from-blue-950/20 dark:to-indigo-950/10 border-blue-200/60 dark:border-blue-900/40 text-blue-600 dark:text-blue-400",
  },
  {
    title: "7-Day Return Policy",
    description: "Instant doorstep pickups for transit damage, technical defects, or missing items.",
    href: "/returns",
    icon: RotateCcw,
    badge: "Hassle-Free",
    cta: "Read Returns Policy",
    color: "from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/20 dark:to-teal-950/10 border-emerald-200/60 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Brand Warranty Claims",
    description: "100% manufacturer warranties with pan-India authorized brand service network support.",
    href: "/warranty",
    icon: ShieldCheck,
    badge: "Official Coverage",
    cta: "Check Warranty",
    color: "from-amber-500/10 to-orange-500/5 dark:from-amber-950/20 dark:to-orange-950/10 border-amber-200/60 dark:border-amber-900/40 text-amber-600 dark:text-amber-400",
  },
  {
    title: "Shipping & Delivery",
    description: "Expedited 2-4 day metro transit with verified tamper-proof packaging across India.",
    href: "/shipping",
    icon: Truck,
    badge: "Pan-India",
    cta: "View Timelines",
    color: "from-purple-500/10 to-pink-500/5 dark:from-purple-950/20 dark:to-pink-950/10 border-purple-200/60 dark:border-purple-900/40 text-purple-600 dark:text-purple-400",
  },
];

export default function ContactPage() {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@niroshaindia.com";

  return (
    <div className="bg-slate-50/70 dark:bg-slate-950 min-h-screen py-10 sm:py-16">
      <Container className="space-y-12">
        {/* Top Header Block */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              <MessageSquare className="w-3.5 h-3.5" /> Customer Care & Support
            </span>
            <SupportStatusBadge />
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            How can we help you today?
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            Support for order tracking, official brand warranties, deliveries, and technical queries. Our official email desk logs and tracks every inquiry with a reference ticket.
          </p>
        </div>

        {/* Section 1: Self-Service Triage Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Fast Self-Service Solutions
            </h2>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Instant answers without waiting in queue
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TRIAGE_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br border ${card.color}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {card.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                    <span>{card.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Section 2: Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Focused Email Support & Trust Commitments (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Primary Email Channel Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-2xs space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                  <Mail className="w-3.5 h-3.5" /> Official Support Channel
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-3">
                  Dedicated Email Helpdesk
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Every message submitted to our desk is automatically logged with a unique tracking ticket to ensure end-to-end accountability.
                </p>
              </div>

              {/* Direct Email Address Box */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Direct Inquiries
                  </span>
                  <a
                    href={`mailto:${supportEmail}`}
                    className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline tracking-tight"
                  >
                    {supportEmail}
                  </a>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
              </div>

              {/* Operating Hours & Response SLA */}
              <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200 block text-xs">
                      Hours of Operation
                    </strong>
                    <span>Monday – Saturday, 09:00 AM – 08:00 PM IST (Tickets logged 24/7)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200 block text-xs">
                      Response Timeline
                    </strong>
                    <span>Standard inquiries answered within 24 to 48 business hours.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Commitments & Trust Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-2xs space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Our Service Commitments
              </h4>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200 block text-xs">
                      Resolution Tracking via Ticket ID
                    </strong>
                    <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Every inquiry receives an immutable reference ID (#NIR-XXXXXX) for seamless follow-ups and resolution tracking.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200 block text-xs">
                      Authorized Brand Warranty Coordination
                    </strong>
                    <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Direct coordination with official brand service networks across India for all catalog appliances.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200 block text-xs">
                      7-Day Hassle-Free Replacement
                    </strong>
                    <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Prompt resolution for transit damage, technical defects, or missing accessory items.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Support Ticket Form (7 Columns) */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </Container>
    </div>
  );
}

import { Container } from "@/components/layout/Container";
import Link from "next/link";
import { Award, Zap, Shield, Truck } from "lucide-react";

export const metadata = {
  title: "About Us | Nirosha India",
  description: "Learn about Nirosha India - India's premier destination for authentic consumer electronics and home appliances.",
};

export default function AboutPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-12 sm:py-16">
      <Container className="max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-6">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">About Us</span>
        </nav>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 sm:p-12 shadow-sm space-y-10">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 mb-3">
              <Award className="w-3.5 h-3.5" /> Our Story
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              About Nirosha India
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Empowering Indian households with cutting-edge electronics and genuine brand technology.
            </p>
          </div>

          <div className="space-y-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <p>
              Founded with the vision to deliver high-performance electronics with complete pricing transparency and genuine manufacturer warranties, Nirosha India has grown into a trusted destination for modern shoppers across the country.
            </p>
            <p>
              From flagship 5G smartphones and ultra-thin computing laptops to inverter split air conditioners and 4K smart OLED entertainment systems, every single item in our catalog is sourced directly through authorized OEM partnerships.
            </p>
          </div>

          {/* Value Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
              <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">100% Genuine</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Full brand warranty with GST invoices recognized by all authorized centers.</p>
            </div>
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
              <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Pan-India Express</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Free delivery on orders above ₹999 across 19,000+ serviceable pincodes.</p>
            </div>
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
              <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Dedicated Support</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Toll-free customer care and rapid 7-day replacement assistance.</p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

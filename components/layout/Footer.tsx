"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Sparkles, Mail, ArrowRight, CheckCircle2 } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const CUSTOMER_SUPPORT_LINKS = [
    { title: "Track Your Order", href: "/orders" },
    { title: "Return & Replacement", href: "/terms#returns" },
    { title: "Frequently Asked Questions", href: "/contact#faqs" },
    { title: "Contact Us", href: "/contact" },
  ];

  const QUICK_LINKS = [
    { title: "About Nirosha", href: "/about" },
    { title: "Shop All Products", href: "/shop" },
    { title: "Featured Deals", href: "/deal" },
    { title: "Discover Top Brands", href: "/brands" },
    { title: "My Account", href: "/account" },
    { title: "Wishlist", href: "/wishlist" },
  ];

  return (
    <footer className="border-t border-[#1E293B] bg-[#0B1120] text-slate-200 mt-auto">
      <Container>
        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-8 lg:gap-6 py-12 sm:py-16">
          {/* Col 1: Brand Identity */}
          <div className="col-span-12 lg:col-span-4 pr-0 lg:pr-6 space-y-4">
            <div className="flex items-center gap-0.5">
              <Link href="/" className="inline-flex items-center group">
                <span className="tracking-tight font-black text-2xl text-white">
                  Nirosha
                </span>
              </Link>
              <span className="text-[#10B981] font-black text-3xl leading-none">.</span>
            </div>

            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed max-w-sm">
              Your premier Indian destination for authentic consumer electronics, 4K entertainment, high-performance computing, and smart home appliances.
            </p>
          </div>

          {/* Col 2: Customer Support */}
          <div className="col-span-6 sm:col-span-3 lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-5">
              Customer Support
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm font-medium">
              {CUSTOMER_SUPPORT_LINKS.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-slate-300 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div className="col-span-6 sm:col-span-3 lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm font-medium">
              {QUICK_LINKS.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-slate-300 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Stay Ahead with Nirosha Club (Right Side) */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-4 pl-0 lg:pl-4">
            <div className="bg-[#131D33]/60 border border-[#1E293B] rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Stay Ahead with Nirosha Club
                </h3>
              </div>

              <p className="text-xs text-[#94A3B8] leading-relaxed mb-5">
                Get exclusive festive discount codes, instant price-drop alerts, and VIP early access.
              </p>

              {subscribed ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 p-3 rounded-lg border border-emerald-800">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Thank you for subscribing to Nirosha India!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="Enter your email address..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-[#0B1120] border border-[#1E293B] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#10B981] hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-md shadow-emerald-950/40 shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Subscribe</span>
                      <ArrowRight className="w-3.5 h-3.5 font-bold" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>No spam ever. Unsubscribe anytime.</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Legal Copyright Row */}
        <div className="border-t border-[#1E293B] py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
            {/* Left: Legal Links */}
            <div className="flex items-center gap-4 text-xs font-medium">
              <Link href="/privacy" className="hover:text-slate-200 transition-colors">
                Privacy Policy
              </Link>
              <span className="text-slate-700">•</span>
              <Link href="/terms" className="hover:text-slate-200 transition-colors">
                Terms of Service
              </Link>
            </div>

            {/* Right: Copyright */}
            <div className="text-[11px] text-slate-400">
              © {new Date().getFullYear()} Nirosha India Retail Ltd. All rights reserved.
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

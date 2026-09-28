'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUp, Check, ShieldCheck, Mail, Sparkles, Loader2 } from 'lucide-react';
import { subscribeNewsletter } from '@/actions/newsletter';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !agreed || loading) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.set('email', email);
      const res = await subscribeNewsletter(formData);

      if (res.success) {
        setSubscribed(true);
        toast.success(res.message || 'Subscribed to VIP drops!');
        setTimeout(() => {
          setEmail('');
          setSubscribed(false);
          setAgreed(false);
        }, 4000);
      } else {
        toast.error(res.message || 'Could not complete subscription.');
      }
    } catch {
      // Fallback optimistic resolution
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
        setAgreed(false);
      }, 4000);
    } finally {
      setLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#0a0a0c] text-slate-400 border-t border-slate-800/80 font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. Value Proposition & Assurance Strip */}
      <div className="border-b border-slate-800/60 bg-black/40 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-white">100% Genuine Electronics</p>
              <p className="text-xs text-slate-500">Sourced directly from brand distributors &amp; certified OEMs</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-white">Transparent GST Pricing</p>
              <p className="text-xs text-slate-500">All catalog prices include 18% Indian GST with official invoices</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-white">Dedicated Support Desk</p>
              <p className="text-xs text-slate-500">Human assistance for orders, replacements, and warranties</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main 3-Column Enterprise Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Column A: Brand & Newsletter Lead Capture (5 Cols on lg) */}
          <div className="lg:col-span-5 space-y-4 pr-0 lg:pr-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">
                  NIROSHA <span className="text-[#d4ff00]">INDIA</span>
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-200 tracking-tight leading-snug">
                Stay ahead with curated electronics &amp; exclusive drops
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Join 15,000+ tech enthusiasts receiving early access to authentic brand releases, unannounced deals, and members-only offers.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-3 pt-1">
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  disabled={subscribed || loading}
                  className="w-full h-11 px-4 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#d4ff00] focus:border-transparent transition-all"
                />
              </div>

              <label className="flex items-start gap-2.5 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-[#d4ff00] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="leading-snug">
                  I agree to receive communications in accordance with the{' '}
                  <Link className="underline hover:text-white transition-colors" href="/privacy">
                    Privacy Policy
                  </Link>{' '}
                  and{' '}
                  <Link className="underline hover:text-white transition-colors" href="/terms">
                    Terms of Service
                  </Link>.
                </span>
              </label>

              <button
                type="submit"
                disabled={!email || !agreed || subscribed || loading}
                className="w-full sm:w-auto min-w-[140px] h-11 px-6 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 bg-[#d4ff00] text-black hover:bg-[#c2eb00] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : subscribed ? (
                  <>
                    <Check className="w-4 h-4 text-black" />
                    <span>Subscribed</span>
                  </>
                ) : (
                  'Subscribe Now'
                )}
              </button>
            </form>
          </div>

          {/* Column B: Shop by Category (4 Cols on lg) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Shop Categories</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link className="hover:text-white transition-colors" href="/shop?category=laptops-accessories">
                  Laptops &amp; Computers
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/shop?category=televisions-audio">
                  Smart Televisions
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/shop?category=air-conditioners">
                  Air Conditioners
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/shop?category=kitchen-chimneys">
                  Kitchen Chimneys
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/shop?category=headphones-speakers">
                  Audio &amp; Headphones
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/shop?category=smartphones">
                  Mobile Phones
                </Link>
              </li>
            </ul>
          </div>

          {/* Column C: Customer Care & Terms (3 Cols on lg) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link className="hover:text-white transition-colors" href="/orders">
                  Order Status &amp; Tracking
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/contact">
                  Contact Support Desk
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/terms#replacement-policy">
                  7-Day Replacement Policy
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/terms#brand-warranty">
                  Brand Warranty Desk
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/terms#pricing-and-taxes">
                  Pricing &amp; GST Details
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/terms">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/privacy">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Bottom Legal Bar & Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Nirosha India. All rights reserved. Sourced exclusively from registered brand distributors.
          </p>

          <button
            onClick={scrollToTop}
            aria-label="Back to Top"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:text-white text-slate-400 transition-all cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}

export { Footer };

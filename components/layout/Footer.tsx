"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/header/Logo";
import { SocialMedia } from "@/components/shared/SocialMedia";
import { FooterTop } from "@/components/layout/FooterTop";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

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

  const QUICK_LINKS = [
    { title: "About Us", href: "/about" },
    { title: "Contact Us", href: "/contact" },
    { title: "Terms & Conditions", href: "/terms" },
    { title: "Privacy Policy", href: "/privacy" },
    { title: "FAQs", href: "/faqs" },
  ];

  const CATEGORY_LINKS = [
    { title: "Gadgets & Accessories", href: "/category/gadgets" },
    { title: "Smart Appliances", href: "/category/appliances" },
    { title: "Refrigerators", href: "/category/refrigerators" },
    { title: "Other Electronics", href: "/category/others" },
  ];

  return (
    <footer className="border-t border-slate-800 bg-slate-900 text-slate-200 mt-auto">
      <Container>
        {/* Tier 1: Top Contact Touchpoints */}
        <FooterTop />

        {/* Tier 2: Main 4-Column Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          {/* Col 1: Brand & Social */}
          <div className="space-y-4">
            <Logo spanClassName="text-white" />
            <p className="text-xs text-slate-400 leading-relaxed">
              Nirosha India is your premier destination for high-performance consumer electronics, noise-cancelling audio, smart appliances, and fast charging gear.
            </p>
            <div className="pt-2">
              <SocialMedia iconClassName="border-slate-700 text-slate-300 hover:border-emerald-500 hover:text-emerald-400" />
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-semibold text-sm text-white mb-4 tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              {QUICK_LINKS.map((link) => (
                <li key={link.title}>
                  <Link href={link.href} className="hover:text-emerald-400 transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Category Links */}
          <div>
            <h4 className="font-semibold text-sm text-white mb-4 tracking-wide">
              Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              {CATEGORY_LINKS.map((cat) => (
                <li key={cat.title}>
                  <Link href={cat.href} className="hover:text-emerald-400 transition-colors">
                    {cat.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-white tracking-wide">
              Newsletter
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Subscribe to get exclusive festival deals, new product launches, and special promo codes.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 p-3 rounded-lg border border-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Thank you for subscribing to Nirosha India!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <Input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-9 text-xs focus-visible:ring-emerald-500"
                />
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-9 text-xs shadow-md cursor-pointer"
                >
                  Subscribe
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Legal Copyright Row */}
        <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Nirosha India. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}

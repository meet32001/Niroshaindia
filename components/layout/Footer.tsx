import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/header/Logo";
import { SocialMedia } from "@/components/shared/SocialMedia";
import { CATEGORIES, CUSTOMER_CARE_LINKS, LEGAL_LINKS } from "@/constants/navigation";
import { MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-slate-900 text-slate-200 mt-auto">
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Social Col */}
          <div className="space-y-4">
            <Logo spanClassName="text-white" />
            <p className="text-xs text-slate-400 leading-relaxed">
              India&apos;s trusted platform for high-performance consumer electronics, smartphones, audio systems, and smart accessories.
            </p>
            <div className="pt-2">
              <SocialMedia iconClassName="border-slate-700 text-slate-300 hover:border-shop-orange" />
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-sm text-white mb-3">Categories</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}`} className="hover:text-shop-orange transition-colors">
                    {cat.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-sm text-white mb-3">Customer Care</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {CUSTOMER_CARE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-shop-orange transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-sm text-white mb-3">Get in Touch</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-shop-orange shrink-0" />
                <span>Mumbai, Maharashtra, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-shop-orange shrink-0" />
                <span>+91 1800-NIROSHA</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-shop-orange shrink-0" />
                <span>support@nirosha.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Nirosha India. All rights reserved.</p>
          <div className="flex gap-4">
            {LEGAL_LINKS.map((legal) => (
              <Link key={legal.href} href={legal.href} className="hover:text-white transition-colors">
                {legal.title}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}

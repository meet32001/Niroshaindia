import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, ShieldCheck, Truck } from "lucide-react";

export function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-shop-dark via-slate-900 to-slate-800 text-white p-8 md:p-12 shadow-xl border border-slate-800">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-shop-orange/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl space-y-6">
        <Badge className="bg-shop-orange/20 text-shop-orange border-shop-orange/30 hover:bg-shop-orange/30 px-3 py-1 text-xs font-semibold tracking-wide">
          <Zap className="h-3.5 w-3.5 mr-1 inline" /> Next-Gen Electronics Deal
        </Badge>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Powering India&apos;s Smart Tech Evolution
        </h1>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Discover flagship noise-cancelling headphones, high-refresh rate gaming laptops, and ultra-fast wireless chargers with official warranty and express delivery across India.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <Button size="lg" className="bg-shop-orange hover:bg-amber-600 text-white font-semibold px-8 shadow-lg shadow-shop-orange/25">
            Explore Deals
          </Button>
          <Button size="lg" variant="outline" className="border-slate-700 text-white hover:bg-slate-800">
            Browse Categories
          </Button>
        </div>

        {/* Value Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-shop-orange" />
            <span>Fast Express Shipping</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-shop-orange" />
            <span>100% Genuine Warranty</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-shop-orange" />
            <span>Hassle-Free Returns</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, ShieldCheck, Zap } from "lucide-react";

export function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#FBF6EE] dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 md:p-12 shadow-xs">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Typography & CTA */}
        <div className="lg:col-span-7 space-y-6">
          <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 px-3 py-1 text-xs font-bold tracking-wide">
            <Zap className="h-3.5 w-3.5 mr-1 inline" /> Exclusive Electronics Deal
          </Badge>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            Grab Upto 50% Off On Selected Headphones
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg font-medium">
            Discover flagship noise-cancelling headphones, high-refresh rate gaming gear, and premium accessories with official warranty and express delivery.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/shop">
              <Button size="lg" className="bg-[#166534] hover:bg-[#15803d] text-white font-bold px-8 py-3 rounded-xl shadow-md transition-all cursor-pointer">
                Buy Now
              </Button>
            </Link>

            <Link href="/deal">
              <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 font-semibold rounded-xl cursor-pointer">
                View Deals
              </Button>
            </Link>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Free Express Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>100% Genuine Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Hassle-Free Returns</span>
            </div>
          </div>
        </div>

        {/* Right Transparent Cutout Graphic */}
        <div className="lg:col-span-5 flex items-center justify-center relative min-h-[260px] md:min-h-[320px]">
          <div className="relative w-full h-72 md:h-80 max-w-md">
            <Image
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
              alt="Premium Headphones Banner"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

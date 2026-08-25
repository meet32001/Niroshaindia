import Link from "next/link";
import Image from "next/image";
import { Title, SubText } from "@/components/ui/text";

export function HomeBanner() {
  return (
    <div className="bg-shop-light-pink rounded-2xl py-10 px-6 sm:px-10 md:px-16 flex flex-col md:flex-row items-center justify-between overflow-hidden relative shadow-sm border border-orange-100 dark:border-slate-800">
      {/* Left Content */}
      <div className="max-w-xl space-y-4 text-center md:text-left z-10">
        <span className="inline-block text-xs font-bold text-shop-orange uppercase tracking-widest bg-white/80 dark:bg-slate-900 px-3 py-1 rounded-full shadow-xs">
          Exclusive Festival Sale
        </span>

        <Title className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight">
          Grab Upto 50% Off On
          <br className="hidden sm:inline" /> Selected Electronics
        </Title>

        <SubText className="text-slate-700 font-medium">
          Upgrade your workstation and personal audio with flagship wireless noise-cancelling headphones and high-power GaN fast chargers.
        </SubText>

        <div>
          <Link
            href="/shop"
            className="inline-block mt-4 bg-shop-orange hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-xl text-sm shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Buy Now
          </Link>
        </div>
      </div>

      {/* Right Hero Image */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-96 md:h-96 shrink-0 mt-6 md:mt-0 z-10 flex items-center justify-center">
        <div className="w-full h-full relative flex items-center justify-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-full p-8 shadow-inner">
          <Image
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
            alt="Nirosha India Premium Electronics Hero Asset"
            width={400}
            height={400}
            priority
            className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>
    </div>
  );
}

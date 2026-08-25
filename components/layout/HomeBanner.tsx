"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const BANNER_SLIDES = [
  {
    id: 1,
    tag: "EXCLUSIVE FESTIVAL SALE",
    headline: "Grab Up to 50% Off On Premium Audio",
    description: "Upgrade your daily listening with noise-cancelling headphones, high-fidelity earbuds, and spatial sound audio.",
    buttonText: "Shop Audio",
    buttonHref: "/shop?category=gadget",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    tag: "NEXT-GEN PERFORMANCE",
    headline: "Supercharge Your Productivity & Workstation",
    description: "Discover ultra-fast M-series & Intel laptops, mechanical keyboards, and 4K color-accurate displays.",
    buttonText: "Explore Laptops",
    buttonHref: "/shop?category=gadget",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    tag: "NEW ARRIVALS 2026",
    headline: "The Latest Flagship Smartphones & Wearables",
    description: "Trade in and upgrade to cutting-edge AMOLED smartwatches, flagship phones, and MagSafe accessories.",
    buttonText: "Discover Phones",
    buttonHref: "/shop?category=gadget",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 4,
    tag: "SMART HOME ESSENTIALS",
    headline: "Modern Living with Intelligent Smart Appliances",
    description: "Energy-efficient smart refrigerators, robotic vacuums, and IoT kitchen appliances at festive rates.",
    buttonText: "Shop Appliances",
    buttonHref: "/shop?category=appliances",
    image: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80",
  },
];

export function HomeBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const slide = BANNER_SLIDES[currentSlide];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden rounded-2xl bg-[#FBF6EE] dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 md:p-12 shadow-xs transition-all duration-500"
    >
      {/* Floating Carousel Navigation Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 p-2.5 rounded-full shadow-md border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer hover:scale-105"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 p-2.5 rounded-full shadow-md border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer hover:scale-105"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[320px] px-4 md:px-8">
        {/* Left Text & CTA */}
        <div className="lg:col-span-7 space-y-5 animate-in fade-in duration-500">
          <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 px-3 py-1 text-xs font-extrabold tracking-wide">
            <Zap className="h-3.5 w-3.5 mr-1 inline" /> {slide.tag}
          </Badge>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight min-h-[72px] sm:min-h-[96px] flex items-center">
            {slide.headline}
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-lg font-medium min-h-[48px]">
            {slide.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href={slide.buttonHref}>
              <Button size="lg" className="bg-[#166534] hover:bg-[#15803d] text-white font-bold px-8 py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2">
                <span>{slide.buttonText}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/deal">
              <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 font-semibold rounded-xl cursor-pointer">
                View Deals
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Circular Framed Visual */}
        <div className="lg:col-span-5 flex items-center justify-center relative py-4">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-4 shadow-xl border border-white/80 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 transition-transform duration-500 hover:scale-105">
            <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center">
              <Image
                key={slide.id}
                src={slide.image}
                alt={slide.headline}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover rounded-full animate-in fade-in zoom-in-95 duration-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Slide Dots Indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {BANNER_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={cn(
              "transition-all duration-300 rounded-full cursor-pointer",
              currentSlide === idx
                ? "w-8 h-2.5 bg-emerald-600 shadow-xs"
                : "w-2.5 h-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
            )}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Maximize2, ZoomIn } from "lucide-react";

export interface ProductGalleryProps {
  images?: string[];
  isStock?: boolean;
  productName?: string;
  className?: string;
}

export function ProductGallery({
  images = [],
  isStock = true,
  productName = "Product",
  className,
}: ProductGalleryProps) {
  const fallbackImage =
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";

  const imageList = images && images.length > 0 ? images : [fallbackImage];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  // When variant changes and new images arrive, reset to first thumbnail
  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  const activeImage = imageList[activeIndex] || fallbackImage;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setMousePos({ x, y });
  };

  return (
    <div className={cn("w-full space-y-4 select-none", className)}>
      {/* Main Hero Container with Interactive Lens Zoom */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        className="relative w-full aspect-square bg-slate-50 dark:bg-slate-900/60 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 flex items-center justify-center p-6 group cursor-crosshair shadow-xs"
      >
        {/* Out of Stock Overlay Badge */}
        {!isStock && (
          <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-red-600/90 backdrop-blur-xs text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
            Out of Stock
          </div>
        )}

        {/* Zoom Hint Indicator */}
        <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium">
          <ZoomIn className="w-3.5 h-3.5" />
          <span>Hover to Zoom</span>
        </div>

        {/* Hero Image / Smooth Switch Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeImage + activeIndex}
            initial={{ opacity: 0.3, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full relative flex items-center justify-center"
          >
            {isZoomed ? (
              // Magnified Lens View
              <div
                className="w-full h-full absolute inset-0 transition-transform duration-75"
                style={{
                  backgroundImage: `url(${activeImage})`,
                  backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                  backgroundSize: "220%",
                  backgroundRepeat: "no-repeat",
                }}
              />
            ) : (
              // Normal Standard View
              <Image
                src={activeImage}
                alt={`${productName} - Angle ${activeIndex + 1}`}
                fill
                priority={activeIndex === 0}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={cn(
                  "object-contain p-2 transition-transform duration-300",
                  !isStock && "opacity-40 grayscale"
                )}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Multi-Angle Thumbnail Strip */}
      {imageList.length > 1 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
            <span>Product Gallery ({imageList.length} views)</span>
            <span>{activeIndex + 1} of {imageList.length}</span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2.5">
            {imageList.map((img, idx) => {
              const isActive = activeIndex === idx;

              return (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={cn(
                    "relative aspect-square rounded-xl border-2 overflow-hidden p-1 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900",
                    isActive
                      ? "border-shop-orange ring-2 ring-shop-orange/20 opacity-100 shadow-sm scale-102"
                      : "border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-300"
                  )}
                  aria-label={`View image angle ${idx + 1}`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail angle ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-contain p-1"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

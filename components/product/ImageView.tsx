"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { urlFor } from "@/lib/image";
import { cn } from "@/lib/utils";

export interface ImageViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  images?: any[];
  isStock?: boolean;
}

export function ImageView({ images = [], isStock = true }: ImageViewProps) {
  const fallbackImage = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
  const imageList = images.length > 0 ? images : [fallbackImage];

  const [activeImage, setActiveImage] = useState(imageList[0]);
  const [activeIndex, setActiveIndex] = useState(0);

  const getImageUrl = (img: unknown) => {
    if (!img) return fallbackImage;
    if (typeof img === "string") return img;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((img as any)?.asset) {
      try {
        return urlFor(img).url();
      } catch {
        return fallbackImage;
      }
    }
    return fallbackImage;
  };

  const handleSelectImage = (img: unknown, index: number) => {
    setActiveImage(img);
    setActiveIndex(index);
  };

  const currentUrl = getImageUrl(activeImage);

  return (
    <div className="w-full space-y-4">
      {/* Main Image Container */}
      <div className="relative w-full aspect-square bg-slate-50 dark:bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 flex items-center justify-center p-6 group">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0.3, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full relative flex items-center justify-center"
          >
            <Image
              src={currentUrl}
              alt="Product View"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={cn(
                "object-contain p-2 group-hover:scale-105 transition-transform duration-300",
                !isStock && "opacity-40 grayscale"
              )}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnails Selector Strip */}
      {imageList.length > 1 && (
        <div className="grid grid-cols-5 md:grid-cols-6 gap-2">
          {imageList.map((img, idx) => {
            const thumbUrl = getImageUrl(img);
            const isActive = activeIndex === idx;

            return (
              <button
                key={idx}
                onClick={() => handleSelectImage(img, idx)}
                className={cn(
                  "relative aspect-square rounded-xl border-2 overflow-hidden p-1 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900",
                  isActive
                    ? "border-shop-orange ring-2 ring-shop-orange/20 opacity-100 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100"
                )}
              >
                <Image
                  src={thumbUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

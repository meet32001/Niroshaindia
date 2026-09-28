"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, CheckCircle2, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { CartItem, useStore, getProductId } from "@/store";
import { PriceFormatter } from "@/components/shared/PriceFormatter";
import { QuantityButtons } from "@/components/product/QuantityButtons";
import { AddToWishlistButton } from "@/components/product/AddToWishlistButton";
import { urlFor } from "@/lib/image";
import { sanitizeProductTitle } from "@/lib/utils";

export interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { deleteCartProduct } = useStore();
  const product = item.product || {};
  const productId = getProductId(product);

  const rawName = product?.name || product?.title || "Electronics Product";
  const { title: name, warranty: parsedWarranty } = sanitizeProductTitle(rawName);
  const warrantyText = parsedWarranty || "1 Year Brand Warranty Included";

  const price = product?.price || (product?.price_cents ? product.price_cents / 100 : 0);
  const discount = product?.discount || 0;
  const originalPrice = discount > 0 ? price / (1 - discount / 100) : price;

  const getImageUrl = (img: unknown) => {
    if (!img) return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
    if (typeof img === "string") return img;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((img as any)?.asset) {
      try {
        return urlFor(img).url();
      } catch {
        return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
      }
    }
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
  };

  const image = getImageUrl(product?.images?.[0] || product?.image);
  const slug = product?.slug?.current || product?.slug || productId;

  // Extract human-readable variant configuration
  const variantLabel =
    product?.variant_name ||
    product?.selectedVariant?.name ||
    (product?.specs && typeof product.specs === "object"
      ? Object.entries(product.specs)
          .slice(0, 2)
          .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
          .join(" • ")
      : null);

  const handleDelete = () => {
    deleteCartProduct(productId);
    toast.success(`${name.slice(0, 20)}... removed from cart`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center transition-all hover:border-slate-300 dark:hover:border-slate-700">
      {/* Left: Image & Title details */}
      <div className="flex items-center gap-4 min-w-0 flex-1 w-full sm:w-auto">
        {/* Product Image */}
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-800">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
          />
        </div>

        {/* Details (No duplicate subtitle spec string) */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate" title={name}>
            <Link href={`/product/${slug}`} className="hover:text-shop-orange transition-colors">
              {name}
            </Link>
          </h3>

          {/* Pricing for mobile / inline reference */}
          <div className="flex sm:hidden items-center gap-2 text-xs">
            <PriceFormatter amount={price * (item.quantity || 1)} className="font-black text-slate-900 dark:text-slate-100 text-sm" />
            {discount > 0 && (
              <PriceFormatter amount={originalPrice * (item.quantity || 1)} className="line-through text-slate-400 font-medium" />
            )}
          </div>

          {/* Trust, Warranty & In Stock Badges */}
          <div className="flex flex-wrap items-center gap-2.5 pt-0.5 text-[11px]">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
              <Shield className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              {warrantyText}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Quantity Stepper, Price & Actions (Firmly contained inside card) */}
      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
        <div className="shrink-0">
          <QuantityButtons product={product} />
        </div>

        <div className="hidden sm:block text-right min-w-[84px] shrink-0">
          <PriceFormatter amount={price * (item.quantity || 1)} className="font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base block" />
          {discount > 0 && (
            <PriceFormatter amount={originalPrice * (item.quantity || 1)} className="line-through text-slate-400 text-xs block" />
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <AddToWishlistButton
            product={product}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          />
          <button
            onClick={handleDelete}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Remove Item"
            aria-label={`Remove ${name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

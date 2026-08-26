import Link from "next/link";
import Image from "next/image";
import { Star, Flame } from "lucide-react";
import { PriceView } from "@/components/product/PriceView";
import { AddToWishlistButton } from "@/components/product/AddToWishlistButton";
import { AddToCartButton } from "@/components/product/AddToCartButton";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProductCard(product: any) {
  const name = product.name || product.title || "Electronics Product";
  const rawSlug = typeof product.slug === "string" ? product.slug : product.slug?.current;
  const slug = rawSlug || "product-details";

  const categoryName =
    product.categories?.name ||
    product.categories?.title ||
    (typeof product.category === "string" ? product.category : product.category?.title) ||
    "Electronics";

  const primaryVariant = product.product_variants?.[0] || product.variants?.[0];
  const price = primaryVariant?.price_cents
    ? primaryVariant.price_cents / 100
    : product.price || 0;

  const discount = primaryVariant?.compare_at_price_cents
    ? primaryVariant.compare_at_price_cents / 100
    : product.discountPrice || product.discount || 0;

  const stock = product.stock !== undefined ? product.stock : 10;
  const status = product.status || product.tag?.toLowerCase();

  let imageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";

  const variantImg = primaryVariant?.product_images?.[0]?.image_url || primaryVariant?.images?.[0];
  const directImg = product.product_images?.[0]?.image_url || (Array.isArray(product.images) ? product.images[0] : product.image);

  if (variantImg && typeof variantImg === "string") {
    imageUrl = variantImg;
  } else if (directImg && typeof directImg === "string") {
    imageUrl = directImg;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 hover:shadow-md transition-shadow overflow-hidden group flex flex-col justify-between h-full">
      {/* Top Image Container with Soft Background */}
      <div className="relative bg-[#F8FAFC] dark:bg-slate-800/50 overflow-hidden aspect-square flex items-center justify-center p-4">
        {/* Image */}
        <Link href={`/product/${slug}`} className="w-full h-full relative flex items-center justify-center">
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Status Badge (Top Left) */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {status === "sale" && (
            <span className="bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs">
              Sale!
            </span>
          )}
          {status === "hot" && (
            <span className="bg-rose-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
              <Flame className="h-3 w-3 fill-white" />
              <span>Hot</span>
            </span>
          )}
          {status === "new" && (
            <span className="bg-blue-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs">
              New
            </span>
          )}
        </div>

        {/* Wishlist Button (Top Right) */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <AddToWishlistButton product={product} />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3 flex flex-col gap-1.5 flex-1 justify-between">
        <div className="space-y-1">
          {/* Category */}
          <span className="text-[11px] uppercase tracking-wider text-slate-400 line-clamp-1 font-medium">
            {categoryName}
          </span>

          {/* Product Name */}
          <h3 className="line-clamp-1">
            <Link
              href={`/product/${slug}`}
              className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-100 hover:text-emerald-600 line-clamp-1 transition-colors"
            >
              {name}
            </Link>
          </h3>

          {/* Green Star Ratings */}
          <div className="flex items-center gap-1 pt-0.5">
            <div className="flex items-center text-emerald-600">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-emerald-600 text-emerald-600" />
              ))}
            </div>
            <span className="text-xs text-slate-400 ml-1 font-medium">
              ({product.reviewsCount || 42})
            </span>
          </div>

          {/* Stock Indicator */}
          <div className="pt-0.5">
            {stock > 0 ? (
              <span className="text-xs font-medium text-emerald-600">
                In Stock: {stock}
              </span>
            ) : (
              <span className="text-xs font-medium text-red-500">Unavailable</span>
            )}
          </div>
        </div>

        {/* Price & Cart Action */}
        <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800 mt-2">
          <PriceView price={price} discount={discount} />
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}

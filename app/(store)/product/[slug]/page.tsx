import { notFound } from "next/navigation";
import { Star, ArrowLeftRight, HelpCircle, Share2, Truck, RotateCcw } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { ImageView } from "@/components/product/ImageView";
import { PriceView } from "@/components/product/PriceView";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { AddToWishlistButton } from "@/components/product/AddToWishlistButton";
import { ProductCharacteristics } from "@/components/product/ProductCharacteristics";
import { getProductBySlug } from "@/sanity/lib/queries";

export interface SingleProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SingleProductPage({ params }: SingleProductPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const name = product.name || product.title || "Electronics Product";
  const description = product.description || "High-performance electronics gadget with official manufacturer warranty.";
  const price = product.price || 0;
  const discount = product.discount || 0;
  const stock = product.stock !== undefined ? product.stock : 10;
  const isStock = stock > 0;
  const brand = typeof product.brand === "string" ? product.brand : product.brand?.title || "Nirosha";

  const categories = Array.isArray(product.categories)
    ? product.categories.join(", ")
    : typeof product.category === "string"
    ? product.category
    : product.productType || "Electronics";

  return (
    <div className="py-8 md:py-12">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column: Image Switcher Gallery */}
          <ImageView images={product.images} isStock={isStock} />

          {/* Right Column: Product Metadata & Actions */}
          <div className="space-y-6">
            {/* Category & Title */}
            <div className="space-y-2">
              <span className="inline-block text-xs font-bold text-shop-orange uppercase tracking-wider bg-shop-orange/10 px-3 py-1 rounded-full">
                {categories}
              </span>

              <h1 className="text-2xl md:text-3xl font-extrabold text-shop-dark dark:text-slate-100 leading-tight">
                {name}
              </h1>

              {/* Brand & Ratings */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                <span className="text-slate-500 font-medium">
                  Brand: <strong className="text-slate-900 dark:text-slate-200">{brand}</strong>
                </span>

                <div className="flex items-center gap-1">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-slate-500 font-medium ml-1">
                    ({product.reviewsCount || 42} Customer Reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Price View & Stock Badge */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <PriceView price={price} discount={discount} className="text-xl md:text-2xl" />

              <div>
                {isStock ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock: {stock} units
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-red-700 bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {description}
            </p>

            {/* Main Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex-1">
                <AddToCartButton product={product} className="h-11 text-sm shadow-md" />
              </div>
              <div className="shrink-0">
                <AddToWishlistButton product={product} />
              </div>
            </div>

            {/* Secondary Utilities Strip */}
            <div className="flex items-center justify-between py-3 border-y border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
              <button className="flex items-center gap-1.5 hover:text-shop-orange transition-colors cursor-pointer">
                <ArrowLeftRight className="h-4 w-4" />
                <span>Compare</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-shop-orange transition-colors cursor-pointer">
                <HelpCircle className="h-4 w-4" />
                <span>Ask a Question</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-shop-orange transition-colors cursor-pointer">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>

            {/* Delivery & Return Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-shop-orange/10 text-shop-orange mt-0.5">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Free Delivery Available
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                    Enter postal code at checkout for express 24h delivery.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-shop-orange/10 text-shop-orange mt-0.5">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    7-Day Replacement Policy
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                    Hassle-free replacement if damaged upon arrival.
                  </p>
                </div>
              </div>
            </div>

            {/* Product Specifications Accordion */}
            <ProductCharacteristics product={product} />
          </div>
        </div>
      </Container>
    </div>
  );
}

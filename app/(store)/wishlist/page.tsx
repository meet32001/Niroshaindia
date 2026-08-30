"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriceFormatter } from "@/components/shared/PriceFormatter";
import { useStore } from "@/store";
import { getWishlistItems, toggleWishlistItem } from "@/actions/wishlist";
import { Heart, ShoppingBag, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const { favoriteProduct, addToFavorite, addItem } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getWishlistItems().then((res) => {
      if (!isMounted) return;
      if (res.success && res.items.length > 0) {
        // Sync server wishlist items into Zustand store if local is empty
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        res.items.forEach((item: any) => {
          const variant = item.product_variants || {};
          const product = variant.products || {};
          const formatted = {
            id: product.id || variant.id || item.id,
            _id: product.id || variant.id || item.id,
            name: variant.name || product.name || "Product",
            price: (variant.price_cents || 0) / 100,
            image: variant.product_images?.[0]?.image_url || "/images/product-placeholder.png",
            slug: product.slug,
          };
          const exists = favoriteProduct.some(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (fav: any) => String(fav.id || fav._id) === String(formatted.id)
          );
          if (!exists) {
            addToFavorite(formatted);
          }
        });
      }
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRemove = async (product: any) => {
    addToFavorite(product);
    toast.success("Removed from wishlist");
    const id = String(product._id || product.id || "");
    const variantId = String(product.product_variants?.[0]?.id || product.variant_id || "");
    try {
      await toggleWishlistItem(variantId || null, id || null);
    } catch (err) {
      console.warn("[WISHLIST REMOVE NOTICE]:", err);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMoveToCart = (product: any) => {
    addItem(product);
    toast.success("Moved to cart!");
  };

  return (
    <Container className="py-8 space-y-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-600 fill-rose-600" />
          <span>My Wishlist</span>
        </h1>
        <p className="text-sm text-slate-500">
          Save your favorite products to buy later or move them to cart.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : favoriteProduct.length === 0 ? (
        <Card className="p-12 text-center border-dashed space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center mx-auto text-rose-500">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Your wishlist is empty</h3>
            <p className="text-sm text-slate-500">
              Explore products and click the heart icon to save items here.
            </p>
          </div>
          <Link href="/shop">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              Discover Products
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favoriteProduct.map((product) => {
            const id = String(product._id || product.id || "");
            const name = product.name || "Saved Product";
            const image =
              product.image ||
              product.images?.[0] ||
              product.product_variants?.[0]?.product_images?.[0]?.image_url ||
              "/images/product-placeholder.png";
            const price = product.price || (product.price_cents || 0) / 100;

            return (
              <Card
                key={id}
                className="overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                <div>
                  <div className="relative aspect-square bg-slate-50 dark:bg-slate-900 overflow-hidden">
                    <Image
                      src={typeof image === "string" ? image : "/images/product-placeholder.png"}
                      alt={name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => handleRemove(product)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 transition-colors shadow-xs cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base font-semibold line-clamp-1">
                      <Link
                        href={`/product/${product.slug?.current || product.slug || id}`}
                        className="hover:text-emerald-600 transition-colors"
                      >
                        {name}
                      </Link>
                    </CardTitle>
                    <div className="text-emerald-700 dark:text-emerald-400 font-bold text-base mt-1">
                      <PriceFormatter amount={price} />
                    </div>
                  </CardHeader>
                </div>

                <CardFooter className="p-4 pt-2">
                  <Button
                    onClick={() => handleMoveToCart(product)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 rounded-xl"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Move to Cart</span>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </Container>
  );
}
